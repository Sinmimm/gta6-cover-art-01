// TIDELINE PRESS — poster lettering and furniture.
// Everything is drawn, never pasted: 3-D gradient titles, script subtitles,
// gold stars, the starburst seal, a procedural barcode, the billing block,
// the tagline strip, the ticket badge, panel labels and palm silhouettes.

import { hashSeed, mulberry32 } from './prng.js';

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Fit the Anton title exactly the way drawTitle3D does, and return the
// fitted size plus its measured width (used to size the title scrim).
export function fitTitle(ctx, text, maxW, maxPx) {
  let px = maxPx;
  const setFont = (s) => { ctx.font = `400 ${s}px Anton, 'Arial Black', sans-serif`; };
  setFont(px);
  while (px > 24 && ctx.measureText(text).width > maxW) {
    px = Math.floor(px * 0.96);
    setFont(px);
  }
  return { px, width: ctx.measureText(text).width };
}

// Giant 3-D title: dark extruded copies stacked down-right, a vertical
// gradient face, and a dark outline. Returns the fitted pixel size.
export function drawTitle3D(ctx, text, cx, topY, maxW, maxPx, colors, stroke) {
  const { px } = fitTitle(ctx, text, maxW, maxPx);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `400 ${px}px Anton, 'Arial Black', sans-serif`;
  const depth = Math.max(3, Math.round(px * 0.055));
  const dx = px * 0.018;
  const dy = px * 0.03;
  ctx.fillStyle = stroke;
  for (let i = depth; i >= 1; i--) {
    ctx.fillText(text, cx + dx * i, topY + dy * i);
  }
  const grad = ctx.createLinearGradient(0, topY, 0, topY + px);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, topY);
  ctx.lineWidth = Math.max(1.5, px * 0.012);
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, cx, topY);
  ctx.restore();
  return px;
}

export function drawScript(ctx, text, cx, y, px, color = '#ffffff') {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${px}px Pacifico, cursive`;
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = px * 0.2;
  ctx.shadowOffsetY = px * 0.05;
  ctx.fillStyle = color;
  ctx.fillText(text, cx, y);
  ctx.restore();
}

export function drawStar(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawStars(ctx, cx, y, size, count = 5) {
  const gap = size * 1.5;
  const total = gap * (count - 1);
  for (let i = 0; i < count; i++) {
    drawStar(ctx, cx - total / 2 + i * gap, y, size, '#ffc93c');
  }
}

// Starburst seal: "ORIGINAL COVER ART".
export function drawSeal(ctx, cx, cy, r, lines = ['ORIGINAL', 'COVER ART']) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 16;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.82;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#e8243c';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.03);
  ctx.strokeStyle = '#ffd76a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3d6';
  ctx.fill();
  ctx.fillStyle = '#a31226';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const px = r * 0.2;
  ctx.font = `700 ${px}px Oswald, sans-serif`;
  ctx.fillText(lines[0], 0, -px * 0.55);
  ctx.fillText(lines[1], 0, px * 0.55);
  ctx.restore();
}

// Procedural barcode: seeded bar widths, catalogue number underneath.
export function drawBarcode(ctx, x, y, w, h, text, seedName) {
  const rnd = mulberry32(hashSeed(seedName + ':barcode'));
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 6, y - 6, w + 12, h + 22);
  let bx = x;
  ctx.fillStyle = '#111111';
  while (bx < x + w - 3) {
    const bw = 1 + Math.floor(rnd() * 4);
    if (rnd() > 0.45) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + Math.floor(rnd() * 3);
  }
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `600 ${Math.max(9, h * 0.16)}px Oswald, sans-serif`;
  ctx.fillText(text, x + w / 2, y + h + 3);
  ctx.restore();
}

// Billing block: every line at full opacity with a dark shadow, over a
// soft scrim that follows the longest line — so the third line still reads
// over a busy panel, and the scrim never covers the marquee above it.
export function drawBilling(ctx, lines, cx, y, maxW, color = '#f5efe0') {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const px = Math.max(10, maxW * 0.011);
  ctx.font = `600 ${px}px Oswald, sans-serif`;
  const blockH = lines.length * px * 1.5;
  let widest = 0;
  for (const line of lines) widest = Math.max(widest, ctx.measureText(line).width);
  const padX = px * 1.1;
  const padTop = Math.min(px * 0.3, 4);
  const padBottom = px * 0.5;
  ctx.fillStyle = 'rgba(6,3,16,0.55)';
  roundRect(ctx, cx - widest / 2 - padX, y - padTop,
    widest + padX * 2, blockH + padTop + padBottom, Math.max(4, px * 0.5));
  ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = px * 0.25;
  ctx.shadowOffsetY = px * 0.06;
  ctx.fillStyle = color;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, y + i * px * 1.5);
  });
  ctx.restore();
  return blockH;
}

// Bottom strip: "COMING SOON" left, tagline centre, volume badge right.
export function drawTaglineStrip(ctx, x, y, w, h, tagline, badge) {
  ctx.save();
  ctx.fillStyle = '#0b0618';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(x, y, w, Math.max(2, h * 0.06));
  const px = Math.max(11, h * 0.34);
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${px}px Oswald, sans-serif`;
  ctx.fillStyle = '#ff5e7a';
  ctx.textAlign = 'left';
  ctx.fillText('COMING SOON', x + w * 0.02, y + h * 0.55);
  ctx.fillStyle = '#f5efe0';
  ctx.textAlign = 'center';
  ctx.fillText(tagline, x + w / 2, y + h * 0.55);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd76a';
  ctx.fillText(badge, x + w * 0.98, y + h * 0.55);
  ctx.restore();
}

// Ticket badge, top-right corner of the cover.
export function drawTicketBadge(ctx, x, y, w, h, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(11,6,24,0.85)';
  roundRect(ctx, x, y, w, h, h * 0.18);
  ctx.fill();
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = Math.max(1.5, h * 0.04);
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(x, y + h / 2, h * 0.12, 0, Math.PI * 2);
  ctx.arc(x + w, y + h / 2, h * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5efe0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${h * 0.30}px Oswald, sans-serif`;
  ctx.fillText(text, x + w / 2, y + h * 0.52);
  ctx.restore();
}

// Panel label pill, pinned to the top of its panel.
export function drawPanelLabel(ctx, rect, text) {
  const px = Math.max(10, Math.min(rect.w * 0.055, rect.h * 0.09, 26));
  ctx.save();
  ctx.font = `700 ${px}px Oswald, sans-serif`;
  const tw = ctx.measureText(text).width;
  const padX = px * 0.7;
  const padY = px * 0.45;
  const bw = tw + padX * 2;
  const bh = px + padY * 2;
  const bx = rect.x + Math.max(6, rect.w * 0.04);
  const by = rect.y + Math.max(6, rect.h * 0.04);
  ctx.fillStyle = 'rgba(6,3,16,0.72)';
  roundRect(ctx, bx, by, Math.min(bw, rect.w * 0.92), bh, bh / 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + padX, by + bh / 2 + px * 0.04);
  ctx.restore();
}

// Palm silhouette: a curved trunk and a crown of fronds.
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.55, x + s * 0.28, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.28;
  const topY = y - s * 0.95;
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.85) + (i * Math.PI * 1.7) / 6;
    const len = s * (0.42 + (i % 2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.5 - s * 0.12,
      topX + Math.cos(a) * len, topY + Math.sin(a) * len + s * 0.18,
    );
    ctx.stroke();
  }
  ctx.restore();
}
