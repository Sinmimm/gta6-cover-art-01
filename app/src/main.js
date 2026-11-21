// TIDELINE PRESS — the studio UI.
// Three steps: (1) add photos, (2) caption + layout + grade, (3) export.
// The preview canvas always shows the live cover; every control re-renders
// it through renderCover. Panel interaction on the canvas: drag to pan,
// scroll to zoom, shift-drag to swap two panels.

import { renderCover, defaultPanels } from './cover.js';
import { exportAllSizes, exportCoverPng, EXPORT_SIZES } from './export.js';
import { GRADES } from './grades.js';
import { LAYOUTS, layoutPanels } from './layouts.js';
import { COVERS, PHOTOS, coverById } from './photos.js';
import { hashSeed, mulberry32 } from './prng.js';

const $ = (id) => document.getElementById(id);

const state = {
  coverId: 'kingtide',
  layoutId: 'slant-hero',
  gradeId: 'salt-ember',
  title: 'KING TIDE',
  script: 'After the Rain',
  tagline: 'ONE COAST · SIX STORIES · NO WAY BACK',
  quote: 'A SUN-BLEACHED JOYRIDE',
  quoteSource: 'THE TIDE GAZETTE',
  badge: 'VOL. 01',
  seal: true,
  marquee: true,
  ribbon: '',
  fx: { paint: 0.6, ink: 0.5, grain: 0.5, halftone: 0.35, glow: 0.6, vignette: 0.6 },
  panels: [],
  selectedPanel: 0,
  exportSize: '16:9',
  photos: [...PHOTOS],
  remixCount: 0,
};

const images = new Map();
let previewCtx = null;
let previewCanvas = null;

function cover() {
  return coverById(state.coverId);
}

function stateToOpts() {
  return {
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    title: state.title,
    script: state.script,
    tagline: state.tagline,
    quote: state.quote,
    quoteSource: state.quoteSource,
    seal: state.seal,
    marquee: state.marquee,
    ribbon: state.ribbon,
    panels: state.panels,
    fx: { ...state.fx },
  };
}

function loadPhotoImage(photo) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = photo.dataUrl ?? `samples/${photo.file}`;
  });
}

async function loadAllImages() {
  for (const photo of state.photos) {
    if (images.has(photo.id)) continue;
    const img = await loadPhotoImage(photo);
    if (img) images.set(photo.id, img);
  }
}

function renderPreview() {
  if (!previewCanvas) return;
  const c = cover();
  previewCanvas.width = c.exportW;
  previewCanvas.height = c.exportH;
  renderCover(previewCtx, c, images, stateToOpts());
}

function setStatus(text) {
  const el = $('status-line');
  if (el) el.textContent = text;
}

function applyCoverDefaults(c) {
  state.coverId = c.id;
  state.layoutId = c.layout;
  state.gradeId = c.grade;
  state.title = c.title;
  state.script = c.script;
  state.tagline = c.tagline;
  state.quote = c.quote;
  state.quoteSource = c.quoteSource;
  state.badge = c.badge;
  state.panels = defaultPanels(c);
  state.selectedPanel = 0;
  state.exportSize = c.aspect;
}

function syncInputs() {
  const c = cover();
  $('in-title').value = state.title;
  $('in-script').value = state.script;
  $('in-tagline').value = state.tagline;
  $('in-quote').value = state.quote;
  $('in-badge').value = state.badge;
  $('in-seal').checked = state.seal;
  $('in-marquee').checked = state.marquee;
  $('in-ribbon').value = state.ribbon;
  $('export-size').value = state.exportSize;
  for (const key of Object.keys(state.fx)) {
    const el = $(`fx-${key}`);
    if (el) el.value = Math.round(state.fx[key] * 100);
  }
  document.querySelectorAll('#cover-tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.cover === c.id);
  });
  document.querySelectorAll('#layout-picker button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layoutId);
  });
  document.querySelectorAll('#grade-picker button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.gradeId);
  });
  syncPanelControls();
}

function syncPanelControls() {
  const sel = $('panel-select');
  sel.innerHTML = '';
  state.panels.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Panel ${i + 1} — ${p.label || p.photo}`;
    sel.appendChild(opt);
  });
  sel.value = String(state.selectedPanel);
  const swap = $('panel-swap');
  swap.innerHTML = '<option value="">Swap with…</option>';
  state.panels.forEach((p, i) => {
    if (i === state.selectedPanel) return;
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Panel ${i + 1} — ${p.label || p.photo}`;
    swap.appendChild(opt);
  });
  const p = state.panels[state.selectedPanel];
  if (p) {
    $('panel-zoom').value = Math.round((p.z ?? 1) * 100);
    $('panel-tag').value = p.label ?? '';
    const fy = p.y ?? 0.5;
    $('panel-focal').value = fy < 0.34 ? 'Top' : fy > 0.66 ? 'Bottom' : 'Center';
  }
}

function buildPickers() {
  const tabs = $('cover-tabs');
  tabs.innerHTML = '';
  for (const c of COVERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.cover = c.id;
    b.textContent = `${c.title} · ${c.aspect}`;
    b.addEventListener('click', () => {
      applyCoverDefaults(c);
      syncInputs();
      renderPreview();
    });
    tabs.appendChild(b);
  }
  const layouts = $('layout-picker');
  layouts.innerHTML = '';
  for (const l of LAYOUTS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = l.id;
    b.textContent = l.name;
    b.addEventListener('click', () => {
      state.layoutId = l.id;
      syncInputs();
      renderPreview();
    });
    layouts.appendChild(b);
  }
  const grades = $('grade-picker');
  grades.innerHTML = '';
  for (const g of GRADES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = g.id;
    b.textContent = g.name + (g.signature ? ' ★' : '');
    b.addEventListener('click', () => {
      state.gradeId = g.id;
      syncInputs();
      renderPreview();
    });
    grades.appendChild(b);
  }
}

function buildPhotoStrip() {
  const strip = $('photo-strip');
  strip.innerHTML = '';
  for (const photo of state.photos) {
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = photo.dataUrl ?? `samples/${photo.file}`;
    img.alt = photo.alt ?? photo.label;
    img.title = photo.label;
    img.addEventListener('click', () => {
      const p = state.panels[state.selectedPanel];
      if (p) {
        p.photo = photo.id;
        renderPreview();
        syncPanelControls();
      }
    });
    strip.appendChild(img);
  }
}

function wireControls() {
  $('in-title').addEventListener('input', (e) => { state.title = e.target.value; renderPreview(); });
  $('in-script').addEventListener('input', (e) => { state.script = e.target.value; renderPreview(); });
  $('in-tagline').addEventListener('input', (e) => { state.tagline = e.target.value; renderPreview(); });
  $('in-quote').addEventListener('input', (e) => { state.quote = e.target.value; renderPreview(); });
  $('in-badge').addEventListener('input', (e) => { state.badge = e.target.value; renderPreview(); });
  $('in-ribbon').addEventListener('input', (e) => { state.ribbon = e.target.value; renderPreview(); });
  $('in-seal').addEventListener('change', (e) => { state.seal = e.target.checked; renderPreview(); });
  $('in-marquee').addEventListener('change', (e) => { state.marquee = e.target.checked; renderPreview(); });
  for (const key of Object.keys(state.fx)) {
    $(`fx-${key}`).addEventListener('input', (e) => {
      state.fx[key] = Number(e.target.value) / 100;
      renderPreview();
    });
  }
  $('panel-select').addEventListener('change', (e) => {
    state.selectedPanel = Number(e.target.value);
    syncPanelControls();
  });
  $('panel-zoom').addEventListener('input', (e) => {
    const p = state.panels[state.selectedPanel];
    if (p) {
      p.z = Number(e.target.value) / 100;
      renderPreview();
    }
  });
  $('panel-flip').addEventListener('click', () => {
    const p = state.panels[state.selectedPanel];
    if (p) {
      p.flip = !p.flip;
      renderPreview();
    }
  });
  $('panel-swap').addEventListener('change', (e) => {
    const target = Number(e.target.value);
    if (!Number.isNaN(target)) {
      const a = state.panels[state.selectedPanel];
      const b = state.panels[target];
      if (a && b) {
        const photo = a.photo;
        a.photo = b.photo;
        b.photo = photo;
        renderPreview();
        syncPanelControls();
      }
    }
    e.target.value = '';
  });
  $('panel-focal').addEventListener('change', (e) => {
    const p = state.panels[state.selectedPanel];
    if (p) {
      p.y = e.target.value === 'Top' ? 0.2 : e.target.value === 'Bottom' ? 0.8 : 0.5;
      renderPreview();
    }
  });
  $('panel-tag').addEventListener('input', (e) => {
    const p = state.panels[state.selectedPanel];
    if (p) {
      p.label = e.target.value.toUpperCase();
      renderPreview();
    }
  });
  $('panel-reset').addEventListener('click', () => {
    state.panels = defaultPanels(cover());
    state.selectedPanel = 0;
    syncPanelControls();
    renderPreview();
  });
  $('export-size').addEventListener('change', (e) => { state.exportSize = e.target.value; });
  $('btn-export').addEventListener('click', () => {
    const name = exportCoverPng(cover(), images, stateToOpts(), state.exportSize, (file, ok) => {
      setStatus(ok ? `Saved ${file}` : `Export failed: ${file}`);
    });
    setStatus(`Exporting ${name}…`);
  });
  $('btn-export-all').addEventListener('click', () => {
    const names = exportAllSizes(cover(), images, stateToOpts(), (file, ok) => {
      setStatus(ok ? `Saved ${file}` : `Export failed: ${file}`);
    });
    setStatus(`Exporting ${names.length} sizes…`);
  });
  $('btn-remix').addEventListener('click', () => {
    const rnd = mulberry32(hashSeed(`remix:${state.remixCount}`));
    state.remixCount += 1;
    state.layoutId = LAYOUTS[Math.floor(rnd() * LAYOUTS.length)].id;
    state.gradeId = GRADES[Math.floor(rnd() * GRADES.length)].id;
    syncInputs();
    renderPreview();
    setStatus('Remixed layout + grade.');
  });
  $('btn-surprise').addEventListener('click', () => {
    const rnd = mulberry32(hashSeed(`surprise:${state.remixCount}`));
    state.remixCount += 1;
    state.layoutId = LAYOUTS[Math.floor(rnd() * LAYOUTS.length)].id;
    state.gradeId = GRADES[Math.floor(rnd() * GRADES.length)].id;
    for (const p of state.panels) {
      p.photo = state.photos[Math.floor(rnd() * state.photos.length)].id;
    }
    syncInputs();
    renderPreview();
    setStatus('Surprise me: new layout, grade and photos.');
  });
  $('btn-samples').addEventListener('click', async () => {
    state.photos = [...PHOTOS];
    await loadAllImages();
    buildPhotoStrip();
    renderPreview();
    setStatus('Loaded 10 demo photos.');
  });
  $('file-input').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const id = `user-${state.photos.length}-${file.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
      state.photos.push({ id, file: file.name, label: file.name, dataUrl });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      images.set(id, img);
    }
    buildPhotoStrip();
    renderPreview();
    setStatus(`Added ${files.length} photo(s).`);
    e.target.value = '';
  });
  document.addEventListener('paste', async (e) => {
    const items = [...(e.clipboardData?.items ?? [])];
    for (const item of items) {
      if (!item.type.startsWith('image/')) continue;
      const file = item.getAsFile();
      if (!file) continue;
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const id = `paste-${state.photos.length}`;
      state.photos.push({ id, file: 'pasted.png', label: 'Pasted photo', dataUrl });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      images.set(id, img);
      buildPhotoStrip();
      renderPreview();
      setStatus('Pasted photo added.');
    }
  });
  wireCanvasInteraction();
}

function panelAtPoint(clientX, clientY) {
  const rect = previewCanvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * previewCanvas.width;
  const y = ((clientY - rect.top) / rect.height) * previewCanvas.height;
  const rects = layoutPanels(state.layoutId, state.panels.length);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (x >= r.x * previewCanvas.width && x <= (r.x + r.w) * previewCanvas.width
      && y >= r.y * previewCanvas.height && y <= (r.y + r.h) * previewCanvas.height) {
      return { index: i, x, y };
    }
  }
  return null;
}

function wireCanvasInteraction() {
  let drag = null;
  previewCanvas.addEventListener('mousedown', (e) => {
    const hit = panelAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    state.selectedPanel = hit.index;
    syncPanelControls();
    const p = state.panels[hit.index];
    drag = { index: hit.index, startX: e.clientX, startY: e.clientY, fx: p.x ?? 0.5, fy: p.y ?? 0.5, shift: e.shiftKey };
  });
  previewCanvas.addEventListener('mousemove', (e) => {
    if (!drag) return;
    const p = state.panels[drag.index];
    if (!p) return;
    const rect = previewCanvas.getBoundingClientRect();
    const dx = (e.clientX - drag.startX) / rect.width;
    const dy = (e.clientY - drag.startY) / rect.height;
    p.x = Math.min(1, Math.max(0, drag.fx - dx));
    p.y = Math.min(1, Math.max(0, drag.fy - dy));
    renderPreview();
  });
  previewCanvas.addEventListener('mouseup', (e) => {
    if (drag?.shift) {
      const hit = panelAtPoint(e.clientX, e.clientY);
      if (hit && hit.index !== drag.index) {
        const a = state.panels[drag.index];
        const b = state.panels[hit.index];
        if (a && b) {
          const photo = a.photo;
          a.photo = b.photo;
          b.photo = photo;
          setStatus(`Swapped panel ${drag.index + 1} and panel ${hit.index + 1}.`);
        }
      }
    }
    drag = null;
    renderPreview();
    syncPanelControls();
  });
  previewCanvas.addEventListener('mouseleave', () => { drag = null; });
  previewCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const hit = panelAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    const p = state.panels[hit.index];
    if (!p) return;
    p.z = Math.min(3, Math.max(1, (p.z ?? 1) * (e.deltaY < 0 ? 1.1 : 0.9)));
    state.selectedPanel = hit.index;
    syncPanelControls();
    renderPreview();
  }, { passive: false });
}

export async function initStudio(opts = {}) {
  previewCanvas = $('preview');
  previewCtx = previewCanvas.getContext('2d');
  applyCoverDefaults(coverById(opts.coverId ?? 'kingtide'));
  buildPickers();
  buildPhotoStrip();
  wireControls();
  syncInputs();
  await loadAllImages();
  renderPreview();
  document.fonts.ready.then(() => renderPreview());
  return images;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    import('./shots.js').then(({ runShotMode }) => {
      runShotMode().then((shot) => {
        if (!shot) initStudio({});
      });
    });
  });
} else {
  import('./shots.js').then(({ runShotMode }) => {
    runShotMode().then((shot) => {
      if (!shot) initStudio({});
    });
  });
}
