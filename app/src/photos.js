// TIDELINE PRESS — covers, demo photos, roles and places.
// Everything the studio shows is invented: no real people, no real places,
// no Rockstar names. The 10 demo photos are procedural drawings made by
// tools/gen-photos.html (canvas gradients + silhouettes, seeded PRNG).

export const PHOTOS = [
  { id: 'hero-convertible', file: 'hero-convertible.jpg', label: 'The Driver', alt: 'Woman with sunglasses leaning on a red convertible at sunset' },
  { id: 'fisherman', file: 'fisherman.jpg', label: 'The Keeper', alt: 'Old fisherman in a hat on a wooden pier at golden hour' },
  { id: 'portrait-man', file: 'portrait-man.jpg', label: 'The Singer', alt: 'Close-up portrait of a man in evening light' },
  { id: 'motorcycle', file: 'motorcycle.jpg', label: 'The Runner', alt: 'Motorcycle on a coastal road' },
  { id: 'gas-station', file: 'gas-station.jpg', label: 'The Witness', alt: 'Neon gas station at night, pink and cyan' },
  { id: 'coastal-road', file: 'coastal-road.jpg', label: 'The Drifter', alt: 'Coastal road with palms under a teal sky' },
  { id: 'speedboat', file: 'speedboat.jpg', label: 'The Pilot', alt: 'Speedboat cutting turquoise water' },
  { id: 'beach-palms', file: 'beach-palms.jpg', label: 'The Diver', alt: 'Beach with palm silhouettes and a big sun' },
  { id: 'bandana-woman', file: 'bandana-woman.jpg', label: 'The Night Driver', alt: 'Woman in a bandana on a neon street' },
  { id: 'surfer', file: 'surfer.jpg', label: 'The Surfer', alt: 'Surfer with a board at dawn, pastel sky' },
];

export const ROLES = [
  'THE PILOT', 'THE DIVER', 'THE RUNNER', 'THE SINGER',
  'THE KEEPER', 'THE DRIFTER', 'THE WITNESS',
];

export const PLACES = [
  { place: 'TIDEWALK', time: '6:05 PM' },
  { place: 'SALT PIER', time: '7:40 PM' },
  { place: 'DUNE ROAD', time: '8:22 PM' },
  { place: 'HARBOR GATE', time: '9:15 PM' },
  { place: 'PALM ROW', time: '10:02 PM' },
  { place: 'CAUSEWAY', time: '11:47 PM' },
  { place: 'LAGOON', time: '5:12 AM' },
];

export const COVERS = [
  {
    id: 'kingtide',
    title: 'KING TIDE',
    script: 'After the Rain',
    tagline: 'ONE COAST · SIX STORIES · NO WAY BACK',
    quote: 'A SUN-BLEACHED JOYRIDE',
    quoteSource: 'THE TIDE GAZETTE',
    catalog: 'No. TP-KT-2601',
    badge: 'VOL. 01',
    layout: 'slant-hero',
    grade: 'salt-ember',
    aspect: '16:9',
    exportW: 1920,
    exportH: 1080,
    billing: [
      'TIDELINE PRESS presents KING TIDE',
      'THE DRIVER · THE KEEPER · THE RUNNER · THE PILOT · THE WITNESS',
      'A COASTAL JOYRIDE IN FIVE PANELS — FILMED ON THE TIDEWALK',
    ],
    panels: [
      { photo: 'hero-convertible', role: 'THE DRIVER' },
      { photo: 'fisherman', role: 'THE KEEPER' },
      { photo: 'motorcycle', role: 'THE RUNNER' },
      { photo: 'speedboat', role: 'THE PILOT' },
      { photo: 'gas-station', role: 'THE WITNESS' },
    ],
  },
  {
    id: 'neonvigil',
    title: 'NEON VIGIL',
    script: 'Harbor After Dark',
    tagline: 'ONE COAST · SIX STORIES · NO WAY BACK',
    quote: 'NEON-SOAKED AND UNFORGIVING',
    quoteSource: 'THE HARBOR LEDGER',
    catalog: 'No. TP-NV-2602',
    badge: 'SEASON ONE',
    layout: 'seven-mosaic',
    grade: 'harbor-neon',
    aspect: '4:5',
    exportW: 1080,
    exportH: 1350,
    billing: [
      'TIDELINE PRESS presents NEON VIGIL',
      'SEVEN NIGHTS ON THE HARBOR — EVERY HOUR ON THE RECORD',
      'THE NIGHT DRIVER · THE WITNESS · THE RUNNER · THE KEEPER',
    ],
    panels: [
      { photo: 'bandana-woman', place: 'TIDEWALK', time: '6:05 PM' },
      { photo: 'gas-station', place: 'SALT PIER', time: '7:40 PM' },
      { photo: 'motorcycle', place: 'DUNE ROAD', time: '8:22 PM' },
      { photo: 'coastal-road', place: 'HARBOR GATE', time: '9:15 PM' },
      { photo: 'speedboat', place: 'PALM ROW', time: '10:02 PM' },
      { photo: 'portrait-man', place: 'CAUSEWAY', time: '11:47 PM' },
      { photo: 'beach-palms', place: 'LAGOON', time: '5:12 AM' },
    ],
  },
  {
    id: 'papersun',
    title: 'PAPER SUN',
    script: 'Four Lives, One Frame',
    tagline: 'ONE COAST · SIX STORIES · NO WAY BACK',
    quote: 'PURE SALT AND GASOLINE',
    quoteSource: 'COASTLINE DAILY',
    catalog: 'No. TP-PS-2603',
    badge: 'ISSUE 07',
    layout: 'nine-grid',
    grade: 'high-noon',
    aspect: '1:1',
    exportW: 1080,
    exportH: 1080,
    billing: [
      'TIDELINE PRESS presents PAPER SUN',
      'ONE SURFER · NINE FRAMES · EVERY HOUR OF THE DAY',
      'THE DAWN · THE SURF · THE LIGHT · THE SALT · THE NOON',
    ],
    panels: [
      { photo: 'surfer', role: 'THE DAWN' },
      { photo: 'surfer', role: 'THE SURF' },
      { photo: 'surfer', role: 'THE LIGHT' },
      { photo: 'surfer', role: 'THE SALT' },
      { photo: 'surfer', role: 'THE NOON' },
      { photo: 'surfer', role: 'THE DRIFT' },
      { photo: 'surfer', role: 'THE DUSK' },
      { photo: 'surfer', role: 'THE TIDE' },
      { photo: 'surfer', role: 'THE SUN' },
    ],
  },
];

export function coverById(id) {
  return COVERS.find((c) => c.id === id) ?? COVERS[0];
}

export function photoById(id) {
  return PHOTOS.find((p) => p.id === id) ?? PHOTOS[0];
}

// The nine-grid "one person, many panels" trick: the same surfer photo is
// drawn with a different crop in each panel, so one person fills the frame.
export function panelCrop(panelIndex, panelCount) {
  const crops = [
    { x: 0.5, y: 0.28, z: 1.6 },
    { x: 0.3, y: 0.55, z: 1.3 },
    { x: 0.62, y: 0.35, z: 1.5 },
    { x: 0.42, y: 0.62, z: 1.2 },
    { x: 0.5, y: 0.5, z: 1.0 },
    { x: 0.68, y: 0.6, z: 1.35 },
    { x: 0.35, y: 0.3, z: 1.55 },
    { x: 0.58, y: 0.68, z: 1.25 },
    { x: 0.5, y: 0.42, z: 1.1 },
  ];
  return crops[panelIndex % crops.length];
}
