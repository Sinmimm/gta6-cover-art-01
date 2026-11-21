// TIDELINE PRESS — static file server for app/ (Node stdlib only).
// Usage: node serve.ts [--port 8080]
// Serves only files inside app/, never above it; no directory listing.

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(join(fileURLToPath(new URL('.', import.meta.url)), 'app'));

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function parsePort(argv: string[]): number {
  const i = argv.indexOf('--port');
  if (i >= 0 && argv[i + 1]) {
    const p = Number.parseInt(argv[i + 1], 10);
    if (Number.isInteger(p) && p > 0 && p < 65536) return p;
  }
  return 8080;
}

const port = parsePort(process.argv.slice(2));

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = resolve(join(appRoot, normalize(rel).replace(/^(\.\.[/\\])+/, '')));
  if (!file.startsWith(appRoot + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('not found\n');
    return;
  }
  res.writeHead(200, { 'content-type': mimeTypes[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`TIDELINE PRESS studio at http://localhost:${port}/`);
});
