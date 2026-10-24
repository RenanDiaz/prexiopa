// Spec §6.6: el JS inicial (lo que carga index.html) no pasa de 150 KB gzip.
// Los chunks lazy (p. ej. el escáner) no cuentan.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 150;
const clientDir = 'dist/client';

const html = readFileSync(join(clientDir, 'index.html'), 'utf8');
const scripts = [
  ...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
].map((m) => m[1]);

if (scripts.length === 0) {
  console.error('No se encontraron scripts en index.html. ¿Corriste `npm run build`?');
  process.exit(1);
}

let totalBytes = 0;
for (const src of new Set(scripts)) {
  const bytes = gzipSync(readFileSync(join(clientDir, src))).length;
  totalBytes += bytes;
  console.log(`${(bytes / 1024).toFixed(1).padStart(7)} KB  ${src}`);
}

const totalKb = totalBytes / 1024;
console.log(`${totalKb.toFixed(1).padStart(7)} KB  total JS inicial (gzip) · presupuesto ${BUDGET_KB} KB`);
if (totalKb > BUDGET_KB) {
  console.error(`Excede el presupuesto por ${(totalKb - BUDGET_KB).toFixed(1)} KB.`);
  process.exit(1);
}
