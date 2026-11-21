// TIDELINE PRESS — PNG export.
// Renders the current cover on an offscreen canvas at the real post size
// (1080x1080, 1080x1350 or 1920x1080) and downloads it as a PNG.

import { renderCover } from './cover.js';

export const EXPORT_SIZES = {
  '1:1': { w: 1080, h: 1080, label: '1080x1080' },
  '4:5': { w: 1080, h: 1350, label: '1080x1350' },
  '16:9': { w: 1920, h: 1080, label: '1920x1080' },
};

export function exportFileName(cover, sizeKey) {
  const size = EXPORT_SIZES[sizeKey];
  return `tideline-press-${cover.id}-${sizeKey.replace(':', 'x')}-${size.w}x${size.h}.png`;
}

export function renderExportCanvas(cover, images, opts, sizeKey) {
  const size = EXPORT_SIZES[sizeKey];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, cover, images, opts);
  return canvas;
}

export function downloadCanvas(canvas, fileName, onDone) {
  canvas.toBlob((blob) => {
    if (!blob) {
      onDone?.(fileName, false);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    onDone?.(fileName, true);
  }, 'image/png');
}

export function exportCoverPng(cover, images, opts, sizeKey, onDone) {
  const canvas = renderExportCanvas(cover, images, opts, sizeKey);
  const fileName = exportFileName(cover, sizeKey);
  downloadCanvas(canvas, fileName, onDone);
  return fileName;
}

export function exportAllSizes(cover, images, opts, onDone) {
  const names = [];
  for (const sizeKey of Object.keys(EXPORT_SIZES)) {
    names.push(exportCoverPng(cover, images, opts, sizeKey, onDone));
  }
  return names;
}
