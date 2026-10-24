import { invoiceUrl } from './cufe';
import { CafeParseError, parseInvoiceHtml, type CafeInvoice } from './parse';

// Consulta a la DGI (spec §6.3 y §10). Algunos emisores tardan 11–12 s en
// responder, así que el timeout es de 30 s con 1 reintento.

export type DgiFetch = (url: string, init: RequestInit) => Promise<Response>;

export type FetchCafeOptions = {
  /** Para tests: reemplaza el fetch a la DGI. */
  fetch?: DgiFetch;
  timeoutMs?: number;
  retries?: number;
};

export class DgiUnavailableError extends Error {
  override name = 'DgiUnavailableError';
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'es-PA,es;q=0.9',
};

// El preview y el guardado consultan la misma factura con segundos de diferencia;
// la caché evita esperar otros 12 s a la DGI al guardar.
const CACHE_TTL_SECONDS = 15 * 60;
const cacheKey = (cufe: string) => `https://cafe-cache.prexiopa.internal/${cufe}`;

async function cachedHtml(cufe: string): Promise<string | null> {
  const hit = await caches.default.match(cacheKey(cufe));
  return hit ? hit.text() : null;
}

async function storeHtml(cufe: string, html: string): Promise<void> {
  const response = new Response(html, { headers: { 'Cache-Control': `max-age=${CACHE_TTL_SECONDS}` } });
  await caches.default.put(cacheKey(cufe), response);
}

async function download(cufe: string, options: FetchCafeOptions): Promise<string> {
  const doFetch = options.fetch ?? ((url, init) => fetch(url, init));
  const attempts = 1 + (options.retries ?? 1);
  let lastError = 'sin respuesta';

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await doFetch(invoiceUrl(cufe), {
        headers: HEADERS,
        signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
      });
      if (res.ok) return await res.text();
      lastError = `HTTP ${res.status}`;
      if (res.status < 500) break; // un 4xx no mejora reintentando
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new DgiUnavailableError(`La DGI no respondió (${lastError})`);
}

/**
 * Descarga y parsea la factura. Lanza DgiUnavailableError si la DGI no responde
 * y CafeParseError si el HTML no tiene el formato esperado.
 */
export async function fetchCafe(cufe: string, options: FetchCafeOptions = {}): Promise<CafeInvoice> {
  const cached = await cachedHtml(cufe);
  if (cached) return parseFor(cufe, cached);

  const html = await download(cufe, options);
  const invoice = parseFor(cufe, html); // solo se cachea un HTML que parsea
  await storeHtml(cufe, html);
  return invoice;
}

function parseFor(cufe: string, html: string): CafeInvoice {
  const invoice = parseInvoiceHtml(html);
  if (invoice.cufe !== cufe) throw new CafeParseError('La DGI devolvió otra factura');
  return invoice;
}
