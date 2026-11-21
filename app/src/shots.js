// TIDELINE PRESS — screenshot scene modes.
// ?shot=cover&cover=<id>  → the exported cover, full-bleed, no studio UI.
// ?shot=editor&cover=<id> → the studio with the cover in the preview.
// After the first paint (and two animation frames) the page sets
// window.__shotReady = true so the screenshot runner knows it can shoot.

import { renderCover } from './cover.js';
import { coverById } from './photos.js';
import { initStudio } from './main.js';

function waitFontsAndImages(images) {
  const loaded = [...images.values()].map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });
  return Promise.all([document.fonts.ready, ...loaded]);
}

function markReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}

export async function runShotMode() {
  const params = new URLSearchParams(location.search);
  const mode = params.get('shot');
  if (!mode) return false;
  const cover = coverById(params.get('cover') ?? 'kingtide');
  if (mode === 'cover') {
    document.body.classList.add('shot-cover');
    const stage = document.getElementById('stage');
    const canvas = document.getElementById('preview');
    const main = document.querySelector('#studio > main');
    if (main) {
      // The studio grid is 360px + 1fr; with the controls hidden the stage
      // would auto-place into the 360px track. Force a single full column.
      main.style.gridTemplateColumns = '1fr';
      main.style.height = '100vh';
    }
    if (stage) {
      stage.style.display = 'block';
      stage.style.padding = '0';
    }
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';
    const header = document.querySelector('#studio > header');
    if (header) header.style.display = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';
    canvas.style.borderRadius = '0';
    canvas.style.boxShadow = 'none';
    const images = await initStudio({ coverId: cover.id, shot: true });
    const ctx = canvas.getContext('2d');
    renderCover(ctx, cover, images, { panels: undefined });
    await waitFontsAndImages(images);
    renderCover(ctx, cover, images, {});
    markReady();
    return true;
  }
  if (mode === 'editor') {
    document.body.classList.add('shot-editor');
    await initStudio({ coverId: cover.id, shot: true });
    await document.fonts.ready;
    markReady();
    return true;
  }
  return false;
}
