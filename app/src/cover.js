// TIDELINE PRESS — the cover renderer.
// Draws one cover on a 2-D canvas at any size: panels clipped to the
// layout, photos cover-fit with per-panel crop, grade wash, vignette, then
// the lettering block — title scrim, 3-D title, script, marquee stars and
// quote, billing, seal, barcode and tagline strip. All randomness is
// seeded, so the same inputs always draw the same pixels.

import { gradeById } from './grades.js';
import { layoutPanels } from './layouts.js';
import {
  drawBarcode, drawBilling, drawPanelLabel, drawScript, drawSeal,
  drawStars, drawTaglineStrip, drawTicketBadge, drawTitle3D,
  fitTitle, roundRect,
} from './lettering.js';
import { coverById, panelCrop, photoById } from './photos.js';
import { hashSeed, mulberry32 } from './prng.js';

// Procedural sky detail for the KING TIDE hero panel: soft clouds, birds
// and a distant silhouette band, all from a seeded PRNG so the render
// stays deterministic. Drawn inside the hero clip, after the photo and
// before the grade wash.
function drawHeroSky(ctx, rect, cover) {
  const rnd = mulberry32(hashSeed(cover.id + ':sky'));
  const { x, y, w, h } = rect;
  ctx.save();
  // Distant silhouette band (palms/skyline) across 0.45-0.55 of panel height.
  ctx.fillStyle = 'rgba(20,8,30,0.5)';
  const bandY = y + h * 0.45;
  const bandH = h * 0.10;
  ctx.beginPath();
  ctx.moveTo(x, bandY + bandH);
  let bx = x;
  while (bx < x + w) {
    const peak = bandY + rnd() * bandH * 0.4;
    const bw = w * (0.03 + rnd() * 0.05);
    ctx.lineTo(bx + bw / 2, peak);
    ctx.lineTo(bx + bw, bandY + bandH);
    bx += bw;
  }
  ctx.lineTo(x + w, bandY + bandH);
  ctx.closePath();
  ctx.fill();
  // Soft clouds in the top 45% of the panel.
  for (let i = 0; i < 5; i++) {
    const cx = x + rnd() * w;
    const cy = y + rnd() * h * 0.45;
    const cw = w * (0.10 + rnd() * 0.12);
    const ch = cw * 0.28;
    ctx.fillStyle = `rgba(255,240,220,${(0.10 + rnd() * 0.06).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw / 2, ch / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Birds (chevrons) in the top 60% of the panel.
  ctx.strokeStyle = 'rgba(20,8,30,0.55)';
  ctx.lineWidth = Math.max(1, w * 0.002);
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const gx = x + w * (0.08 + rnd() * 0.84);
    const gy = y + h * (0.05 + rnd() * 0.55);
    const s = w * (0.008 + rnd() * 0.008);
    ctx.beginPath();
    ctx.moveTo(gx - s, gy);
    ctx.quadraticCurveTo(gx - s * 0.4, gy - s * 0.7, gx, gy);
    ctx.quadraticCurveTo(gx + s * 0.4, gy - s * 0.7, gx + s, gy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPhotoInto(ctx, img, rect, crop) {
  const { x, y, w, h } = rect;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const z = crop.z ?? 1;
  const fx = crop.x ?? 0.5;
  const fy = crop.y ?? 0.5;
  const scale = Math.max(w / iw, h / ih) * z;
  const dw = iw * scale;
  const dh = ih * scale;
  let dx = x + (w - dw) / 2 + (0.5 - fx) * (dw - w);
  let dy = y + (h - dh) / 2 + (0.5 - fy) * (dh - h);
  dx = Math.max(x + w - dw, Math.min(x, dx));
  dy = Math.max(y + h - dh, Math.min(y, dy));
  ctx.save();
  if (crop.flip) {
    ctx.translate(x + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + w / 2), 0);
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function slantPath(ctx, rect, slant) {
  const { x, y, w, h } = rect;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - slant, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function panelLabelText(panel) {
  if (panel.label) return panel.label;
  if (panel.place) return `${panel.place} · ${panel.time}`;
  return panel.role ?? '';
}

export function defaultPanels(cover) {
  return cover.panels.map((p, i) => {
    const crop = cover.id === 'papersun' ? panelCrop(i, cover.panels.length) : { x: 0.5, y: 0.5, z: 1 };
    return { ...p, ...crop, flip: false, label: panelLabelText(p) };
  });
}

export function renderCover(ctx, coverInput, images, opts = {}) {
  const cover = typeof coverInput === 'string' ? coverById(coverInput) : coverInput;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const grade = gradeById(opts.gradeId ?? cover.grade);
  const fx = {
    paint: opts.fx?.paint ?? 0.6,
    ink: opts.fx?.ink ?? 0.5,
    grain: opts.fx?.grain ?? 0.5,
    halftone: opts.fx?.halftone ?? 0.35,
    glow: opts.fx?.glow ?? 0.6,
    vignette: opts.fx?.vignette ?? 0.6,
    ...(opts.fx ?? {}),
  };
  const title = opts.title ?? cover.title;
  const script = opts.script ?? cover.script;
  const tagline = opts.tagline ?? cover.tagline;
  const quote = opts.quote ?? cover.quote;
  const quoteSource = opts.quoteSource ?? cover.quoteSource;
  const showSeal = opts.seal !== false;
  const panels = opts.panels ?? defaultPanels(cover);
  const rects = layoutPanels(opts.layoutId ?? cover.layout, panels.length);

  // Backdrop.
  ctx.save();
  ctx.fillStyle = '#0b0618';
  ctx.fillRect(0, 0, W, H);

  // Panels: clip -> photo -> hero sky -> grade wash -> border -> label.
  const gap = Math.max(2, W * 0.004);
  rects.forEach((r, i) => {
    const panel = panels[i % panels.length];
    const rect = {
      x: r.x * W + (r.x > 0 ? gap / 2 : 0),
      y: r.y * H + (r.y > 0 ? gap / 2 : 0),
      w: r.w * W - (r.x > 0 ? gap / 2 : 0) - (r.x + r.w < 1 ? gap / 2 : 0),
      h: r.h * H - (r.y > 0 ? gap / 2 : 0) - (r.y + r.h < 1 ? gap / 2 : 0),
    };
    const slant = r.slant ? W * 0.035 : 0;
    ctx.save();
    if (r.slant) slantPath(ctx, rect, slant);
    else ctx.beginPath(), ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const img = images.get(panel.photo);
    if (img) drawPhotoInto(ctx, img, rect, panel);
    else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#3a2a55');
      g.addColorStop(1, '#12081f');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    // Procedural sky detail in the KING TIDE hero panel.
    if (cover.id === 'kingtide' && r.hero) drawHeroSky(ctx, rect, cover);
    // Grade tint wash.
    ctx.fillStyle = grade.wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    const warm = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    warm.addColorStop(0, grade.warm);
    warm.addColorStop(1, grade.cool);
    ctx.globalAlpha = 0.5 + fx.paint * 0.5;
    ctx.fillStyle = warm;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
    ctx.restore();
    // Poster-ink border.
    ctx.save();
    ctx.lineWidth = Math.max(2, W * 0.003 + fx.ink * W * 0.002);
    ctx.strokeStyle = 'rgba(245,239,224,0.92)';
    if (r.slant) slantPath(ctx, rect, slant);
    else ctx.beginPath(), ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.stroke();
    ctx.restore();
    const label = panelLabelText(panel);
    if (label) drawPanelLabel(ctx, rect, label);
  });

  // Vignette before the lettering block.
  if (fx.vignette > 0) {
    const vg = ctx.createRadialGradient(
      W / 2, H * 0.45, Math.min(W, H) * 0.35,
      W / 2, H / 2, Math.max(W, H) * 0.75,
    );
    vg.addColorStop(0, 'rgba(5,2,12,0)');
    vg.addColorStop(1, `rgba(5,2,12,${(grade.vignette * fx.vignette).toFixed(2)})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // ---- Lettering block geometry ----
  const stripH = H * 0.052;
  const stripY = H - stripH;
  const billY = stripY - H * 0.085; // billing block baseline (marquee sits just above it)
  const marqueeY = billY - H * 0.022;

  // Title + script, overlapping the panels in the lower third.
  // PAPER SUN's title sits higher: at 0.60H it covers the bottom row of
  // nine-grid labels (THE LIGHT / THE DUSK). Other covers keep 0.60H —
  // on KING TIDE a raised title would hit the lower-right panel labels.
  const titleTop = H * (cover.id === 'papersun' ? 0.52 : 0.60);
  const titleMaxW = W * 0.94;
  // Cap the title by height too, so on wide 16:9 the script still clears
  // the marquee line below it.
  const titleMaxPx = Math.min(W * 0.115, H * 0.16);
  const titleFit = fitTitle(ctx, title, titleMaxW, titleMaxPx);
  const scriptPx = Math.max(20, W * 0.038);
  const scriptY = titleTop + titleFit.px * 1.02;
  // Soft scrim behind the title + script zone, so the lettering reads
  // over any panel boundary. Width follows the wider of title / script,
  // measured with their fonts. Drawn after the vignette, before the title.
  ctx.font = `${scriptPx}px Pacifico, cursive`;
  const scriptW = ctx.measureText(script).width;
  const scrimW = Math.max(titleFit.width, scriptW);
  const scrimPadX = Math.max(18, W * 0.02);
  const scrimPadY = Math.max(10, H * 0.012);
  const scrimTop = titleTop - scrimPadY;
  const scrimBottom = Math.min(
    scriptY + scriptPx * 0.45 + scrimPadY,
    billY - H * 0.026, // keep clear of the marquee line above the billing block
  );
  // Glow behind the title zone.
  if (fx.glow > 0) {
    const glow = ctx.createRadialGradient(
      W / 2, titleTop + titleFit.px * 0.5, 10,
      W / 2, titleTop + titleFit.px * 0.5, scrimW * 0.62,
    );
    glow.addColorStop(0, grade.warm.replace(/[\d.]+\)$/, `${(0.35 * fx.glow).toFixed(2)})`));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, scrimTop - H * 0.05, W, scrimBottom - scrimTop + H * 0.1);
  }
  ctx.save();
  ctx.shadowColor = 'rgba(6,3,16,0.55)';
  ctx.shadowBlur = Math.max(6, W * 0.008);
  ctx.fillStyle = 'rgba(6,3,16,0.50)';
  roundRect(ctx, W / 2 - scrimW / 2 - scrimPadX, scrimTop,
    scrimW + scrimPadX * 2, scrimBottom - scrimTop, Math.max(10, H * 0.02));
  ctx.fill();
  ctx.restore();
  const titlePx = drawTitle3D(ctx, title, W / 2, titleTop, titleMaxW, titleMaxPx, grade.title, grade.titleStroke);
  drawScript(ctx, script, W / 2, titleTop + titlePx * 1.02, scriptPx, '#ffffff');

  // Marquee line just above the billing block: five gold stars + press quote.
  if (opts.marquee !== false) {
    const mqPx = Math.max(13, W * 0.016);
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${mqPx}px Oswald, sans-serif`;
    const quoteText = ` ${quote} — ${quoteSource} `;
    const qw = ctx.measureText(quoteText).width;
    const starR = mqPx * 0.42;
    const totalW = qw + starR * 2 * 5 + mqPx * 2.4;
    let sx = W / 2 - totalW / 2;
    ctx.fillStyle = '#f5efe0';
    ctx.textAlign = 'left';
    for (let i = 0; i < 5; i++) {
      drawStars(ctx, sx + starR + i * starR * 2, marqueeY, starR, 1);
    }
    sx += starR * 2 * 5 + mqPx * 0.4;
    ctx.fillText(quoteText, sx, marqueeY);
    ctx.restore();
  }

  // Billing block.
  const billing = opts.billing ?? cover.billing;
  drawBilling(ctx, billing, W / 2, billY, W * 0.62);

  // Seal (right) and barcode (left), flanking the billing block.
  const sealR = Math.max(28, Math.min(W, H) * 0.052);
  if (showSeal) {
    drawSeal(ctx, W - sealR - Math.max(14, W * 0.02), billY + sealR * 0.75, sealR);
  }
  drawBarcode(ctx, Math.max(16, W * 0.025), billY + 2, Math.min(W * 0.14, 150), Math.max(26, H * 0.032), cover.catalog, cover.id);

  // Tagline strip along the bottom.
  drawTaglineStrip(ctx, 0, stripY, W, stripH, tagline, cover.badge);

  // Ticket badge, right edge, clear of the panel labels (which sit at
  // each panel's top): parked mid-height on the right side instead.
  const tbW = Math.max(120, W * 0.16);
  const tbH = Math.max(26, H * 0.042);
  drawTicketBadge(ctx, W - tbW - Math.max(12, W * 0.015), H * 0.30, tbW, tbH, 'TIDELINE PRESS');

  // Ribbon, top-left corner, when the studio sets one (e.g. LIMITED).
  if (opts.ribbon) {
    const rbH = Math.max(22, H * 0.036);
    const rbText = opts.ribbon.toUpperCase();
    ctx.save();
    ctx.translate(0, H * 0.1);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#e8243c';
    ctx.fillRect(-W * 0.22, -rbH / 2, W * 0.48, rbH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${rbH * 0.52}px Oswald, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rbText, W * 0.02, 0);
    ctx.restore();
  }

  // Grain + halftone finish, seeded and light.
  const grainRnd = mulberry32(hashSeed(cover.id + ':grain'));
  if (fx.grain > 0) {
    ctx.save();
    ctx.globalAlpha = 0.05 * fx.grain;
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = grainRnd() > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(grainRnd() * W, grainRnd() * H, 1.6, 1.6);
    }
    ctx.restore();
  }
  if (fx.halftone > 0) {
    ctx.save();
    ctx.globalAlpha = 0.05 * fx.halftone;
    ctx.fillStyle = '#000000';
    const step = Math.max(10, W * 0.012);
    for (let gy = step / 2; gy < H; gy += step) {
      for (let gx = step / 2; gx < W; gx += step) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.restore();
  return { titlePx, titleTop, billY, marqueeY, stripY };
}
