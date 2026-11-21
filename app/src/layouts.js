// TIDELINE PRESS — the 7 panel layouts.
// Every layout is a pure function of (W, H, panelCount): it returns one
// rect per panel as fractions of the cover, {x, y, w, h} in 0..1, plus a
// slant flag for the hero edge. The cover renderer clips each photo to its
// rect, so layouts compose with any cover and any photo set.

export const LAYOUTS = [
  { id: 'slant-hero', name: 'Slant Hero' },
  { id: 'pop-out-hero', name: 'Pop-Out Hero' },
  { id: 'six-grid', name: 'Six Grid' },
  { id: 'diagonal-trio', name: 'Diagonal Trio' },
  { id: 'seven-mosaic', name: 'Seven Mosaic' },
  { id: 'nine-grid', name: 'Nine Grid' },
  { id: 'hero-trio', name: 'Hero Trio' },
];

function rect(x, y, w, h, hero = false, slant = false) {
  return { x, y, w, h, hero, slant };
}

export function layoutPanels(layoutId, count) {
  switch (layoutId) {
    case 'slant-hero': {
      // Hero down the whole left side with a slanted right edge; the rest
      // fills a 2x2 grid on the right.
      const out = [rect(0, 0, 0.56, 1, true, true)];
      const gx = 0.56;
      const gw = 0.44 / 2;
      out.push(rect(gx, 0, gw, 0.5));
      out.push(rect(gx + gw, 0, gw, 0.5));
      out.push(rect(gx, 0.5, gw, 0.5));
      out.push(rect(gx + gw, 0.5, gw, 0.5));
      return out.slice(0, Math.max(count, 1));
    }
    case 'pop-out-hero': {
      // A tall hero in the middle, popping over four corner panels.
      const out = [
        rect(0, 0, 0.3, 0.5),
        rect(0.7, 0, 0.3, 0.5),
        rect(0, 0.5, 0.3, 0.5),
        rect(0.7, 0.5, 0.3, 0.5),
        rect(0.28, 0.06, 0.44, 0.88, true),
      ];
      return out.slice(0, Math.max(count, 1));
    }
    case 'six-grid': {
      const out = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) out.push(rect(c / 3, r / 2, 1 / 3, 1 / 2, r === 0 && c === 0));
      }
      return out.slice(0, Math.max(count, 1));
    }
    case 'diagonal-trio': {
      return [
        rect(0, 0, 0.52, 0.62, true),
        rect(0.42, 0.3, 0.58, 0.42),
        rect(0, 0.62, 1, 0.38),
      ].slice(0, Math.max(count, 1));
    }
    case 'seven-mosaic': {
      // Wide hero band on top, then two rows of three.
      const out = [rect(0, 0, 1, 0.46, true)];
      for (let c = 0; c < 3; c++) out.push(rect(c / 3, 0.46, 1 / 3, 0.27));
      for (let c = 0; c < 3; c++) out.push(rect(c / 3, 0.73, 1 / 3, 0.27));
      return out.slice(0, Math.max(count, 1));
    }
    case 'nine-grid': {
      const out = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) out.push(rect(c / 3, r / 3, 1 / 3, 1 / 3, r === 1 && c === 1));
      }
      return out.slice(0, Math.max(count, 1));
    }
    case 'hero-trio':
    default: {
      return [
        rect(0, 0, 1, 0.62, true),
        rect(0, 0.62, 0.5, 0.38),
        rect(0.5, 0.62, 0.5, 0.38),
      ].slice(0, Math.max(count, 1));
    }
  }
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
