# TIDELINE PRESS — Cover Studio

**One coast · six stories · no way back.**

TIDELINE PRESS is an offline browser studio that turns any photo and a caption
into GTA 6-style multi-panel cover art — the iconic poster look with bold
lettering and a Vice City sunset or neon grade — and exports it as a PNG to
share. No upload, no network: every photo stays on your machine.

## What it makes

Three original covers, each a different size, layout and grade:

| Cover | Size | Layout | Grade |
|---|---|---|---|
| KING TIDE — "After the Rain" | 1920 × 1080 | Slant Hero | Salt Ember (signature) |
| NEON VIGIL — "Harbor After Dark" | 1080 × 1350 | Seven Mosaic | Harbor Neon |
| PAPER SUN — "Four Lives, One Frame" | 1080 × 1080 | Nine Grid | High Noon |

Every cover carries the genre's furniture: a giant 3-D gradient title with a
script subtitle, five gold stars and a press quote, a starburst
"ORIGINAL COVER ART" seal, a procedural barcode with its catalogue number
(`TP-KT-2601`, `TP-NV-2602`, `TP-PS-2603`), a billing block, a tagline strip
with a volume badge and "COMING SOON", and a role or place-and-time label on
every panel.

## The studio

1. **Add photos** — ten procedural demo photos are loaded for you, or add your
   own from your machine, paste one in, or load the samples again.
2. **Caption** — title, script subtitle, tagline, press quote, seal, volume,
   ribbon and marquee; pick one of 7 layouts and 7 grades; tune Paint,
   Poster Ink, Grain, Halftone, Glow and Vignette.
3. **Export** — 1:1, 4:5 or 16:9, one PNG or all three at once, plus Remix and
   "Surprise me".

Per panel you can zoom, flip, swap (shift-drag), set a focal point
(Top / Center / Bottom), tag a name and role, and reset the crop.
Hint: *Drag to pan · Scroll to zoom · Shift-drag to swap.*

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
node serve.ts --port 8123
```

Build the submission dossier (writes `dossier.json` beside `app/` and
`screenshots/` in the output directory):

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots (Playwright, Chromium):

```sh
python3 tools/shots.py   # writes screenshots/1-cover.jpg … 4-cover.jpg
```

## Art, all its own

The ten demo photos are drawn procedurally by `tools/gen-photos.html` —
canvas gradients, suns, palms and silhouettes from a seeded PRNG, no
photographs, no borrowed artwork. Fonts are Anton, Oswald and Pacifico from
Google Fonts under the SIL Open Font License (see `FONTS.md`). Nothing here
is a Rockstar Games logo, artwork or font; every title, quote and place name
is invented.

Referral code: `7vzr5yt5`

## Layout

- `main.ts` — program entry: copies `app/` + `screenshots/` to the output
  directory and writes `dossier.json` with the kit's `buildDossier`.
- `serve.ts` — static file server for `app/` (Node stdlib only).
- `shots.json` — the four screenshots the entry hands in.
- `app/index.html`, `app/style.css` — the studio shell and its styling.
- `app/src/prng.js` — seeded PRNG (`hashSeed`, `mulberry32`); no
  `Math.random()` anywhere on the render path, so two runs are byte-identical.
- `app/src/grades.js` — the 7 colour grades.
- `app/src/layouts.js` — the 7 panel layouts.
- `app/src/photos.js` — the 3 covers, the 10 demo photos, roles and places.
- `app/src/lettering.js` — 3-D titles, script, stars, seal, barcode, billing,
  tagline strip, ticket badge, panel labels, palm silhouettes.
- `app/src/cover.js` — the cover renderer (panels, washes, scrim, lettering).
- `app/src/export.js` — PNG export in the three post sizes.
- `app/src/main.js` — studio UI wiring (steps, pickers, sliders, per-panel
  controls, drag / zoom / swap).
- `app/src/shots.js` — `?shot=cover` and `?shot=editor` scene modes.
- `tools/gen-photos.html`, `tools/gen-photos.py` — the procedural photo
  generator (Playwright screenshots of the generator page).
- `tools/shots.py` — screenshot runner with adaptive JPEG quality.

## License

MIT — see `LICENSE`.
