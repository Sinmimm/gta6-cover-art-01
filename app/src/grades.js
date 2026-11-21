// TIDELINE PRESS — the 7 colour grades.
// A grade is a gradient-map wash over the photos plus the lettering palette:
// the two title gradient stops, the title outline, and the wash the panels
// get before the lettering goes on.

export const GRADES = [
  {
    id: 'salt-ember',
    name: 'Salt Ember',
    signature: true,
    title: ['#ffe259', '#ff7e2e'],
    titleStroke: '#2b0a1e',
    wash: 'rgba(255, 94, 20, 0.16)',
    warm: 'rgba(255, 170, 60, 0.10)',
    cool: 'rgba(20, 10, 60, 0.10)',
    vignette: 0.42,
  },
  {
    id: 'dusk-vice',
    name: 'Dusk Vice',
    title: ['#ff9de2', '#7b2ff7'],
    titleStroke: '#12041f',
    wash: 'rgba(255, 45, 149, 0.18)',
    warm: 'rgba(255, 120, 180, 0.10)',
    cool: 'rgba(40, 10, 90, 0.14)',
    vignette: 0.46,
  },
  {
    id: 'harbor-neon',
    name: 'Harbor Neon',
    title: ['#7df9ff', '#ff2fb3'],
    titleStroke: '#04101f',
    wash: 'rgba(0, 229, 255, 0.14)',
    warm: 'rgba(255, 47, 179, 0.10)',
    cool: 'rgba(4, 16, 40, 0.16)',
    vignette: 0.48,
  },
  {
    id: 'high-noon',
    name: 'High Noon',
    title: ['#fff3b0', '#ff9d00'],
    titleStroke: '#241300',
    wash: 'rgba(255, 190, 40, 0.14)',
    warm: 'rgba(255, 220, 120, 0.12)',
    cool: 'rgba(10, 40, 70, 0.08)',
    vignette: 0.34,
  },
  {
    id: 'ink-storm',
    name: 'Ink Storm',
    title: ['#e8ecff', '#5f7cff'],
    titleStroke: '#05070f',
    wash: 'rgba(70, 90, 200, 0.18)',
    warm: 'rgba(120, 140, 255, 0.08)',
    cool: 'rgba(5, 8, 24, 0.18)',
    vignette: 0.52,
  },
  {
    id: 'night-rain',
    name: 'Night Rain',
    title: ['#b8fff1', '#2fd4c4'],
    titleStroke: '#03110f',
    wash: 'rgba(47, 212, 196, 0.14)',
    warm: 'rgba(140, 255, 230, 0.08)',
    cool: 'rgba(3, 17, 15, 0.18)',
    vignette: 0.50,
  },
  {
    id: 'violet-hour',
    name: 'Violet Hour',
    title: ['#ffd6f5', '#a55cff'],
    titleStroke: '#16041f',
    wash: 'rgba(165, 92, 255, 0.16)',
    warm: 'rgba(255, 150, 220, 0.10)',
    cool: 'rgba(22, 4, 31, 0.16)',
    vignette: 0.46,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
