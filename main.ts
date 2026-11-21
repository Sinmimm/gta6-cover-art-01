// TIDELINE PRESS — program entry (Node 22+ stdlib only).
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json with the kit's buildDossier.
// The output directory is MAKEFUN_OUTPUT_DIR, defaulting to /output.
// The build is deterministic: no timestamps, no randomness anywhere.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyTree(name: string): void {
  const src = join(repoRoot, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) throw new Error(`main.ts: missing ${name}/ in ${repoRoot}`);
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree('app');
copyTree('screenshots');

const dossier = buildDossier(outDir, dossierCaps);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`TIDELINE PRESS: wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
