import { multiplyToCents, toCents } from './money';

// Parser de la página "Facturas por CUFE" de la DGI (spec §6.3 y §10).
// Función pura: recibe el HTML y devuelve la factura o lanza CafeParseError.
// No lee el bloque RECEPTOR (spec §10.5).

export type CafeLine = {
  lineNo: number;
  code: string | null;
  description: string;
  quantity: number;
  /** Columna "Precio" (unitario, antes del descuento). */
  listPriceCents: number;
  /** "Descuento" es por unidad; aquí va el descuento total de la línea. */
  discountCents: number;
  /** Columna "Total": lo pagado por la línea, con ITBMS y después del descuento. */
  lineTotalCents: number;
  /** Tasa de ITBMS en puntos base (700 = 7 %), inferida de Impuesto / Monto. */
  taxRateBp: number;
  taxCents: number;
};

export type CafeInvoice = {
  cufe: string;
  number: string | null;
  /** ISO-8601 UTC. La DGI muestra la hora de Panamá (UTC-5, sin horario de verano). */
  issuedAt: string;
  issuer: { ruc: string; dv: string | null; name: string; address: string | null };
  lines: CafeLine[];
  /** Totales del encabezado de la factura, nunca sumados de las líneas (§10.3). */
  totals: {
    subtotalCents: number;
    taxCents: number;
    discountCents: number;
    totalCents: number;
    paidCents: number | null;
  };
  /** Avisos no bloqueantes, p. ej. si las líneas no cuadran con el encabezado. */
  warnings: string[];
};

export class CafeParseError extends Error {
  override name = 'CafeParseError';
}

/** La DGI respondió, pero no tiene una factura con ese CUFE. */
export class CafeNotFoundError extends Error {
  override name = 'CafeNotFoundError';
}

const TAX_RATES_BP = [0, 700, 1000, 1500];
const PANAMA_UTC_OFFSET_HOURS = 5;
const LINE_SUM_TOLERANCE_CENTS = 5;

function decodeText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\\\//g, '/')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Valor de un par <dt>LABEL</dt><dd>VALOR</dd> dentro de `section`. */
function definition(section: string, label: string): string | null {
  const re = new RegExp(`<dt[^>]*>\\s*${label}\\s*</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`, 'i');
  const match = re.exec(section);
  if (!match) return null;
  const value = decodeText(match[1] ?? '');
  return value || null;
}

/** Monto en el pie de la tabla, p. ej. "Valor Total: <div>4.62</div>". */
function footerAmount(footer: string, label: string): string | null {
  const re = new RegExp(`${label}\\s*:\\s*(?:<[^>]+>\\s*)*([-\\d.,]+)`, 'i');
  return re.exec(footer)?.[1] ?? null;
}

function cells(row: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const match of row.matchAll(/<td[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)<\/td>/gi)) {
    map.set(match[1] ?? '', decodeText(match[2] ?? ''));
  }
  return map;
}

function nearestTaxRateBp(taxCents: number, baseCents: number): number {
  if (taxCents === 0 || baseCents === 0) return 0;
  const implied = (taxCents / baseCents) * 10_000;
  return TAX_RATES_BP.reduce((best, rate) => (Math.abs(rate - implied) < Math.abs(best - implied) ? rate : best));
}

/** "03/12/2025 20:27:50" (hora de Panamá) → "2025-12-04T01:27:50.000Z". */
function parseIssuedAt(text: string): string {
  const match = /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/.exec(text);
  if (!match) throw new CafeParseError('No se encontró la fecha de emisión');
  const [, day, month, year, hour, minute, second] = match.map(Number) as number[];
  const utc = Date.UTC(year!, month! - 1, day!, hour! + PANAMA_UTC_OFFSET_HOURS, minute!, second!);
  return new Date(utc).toISOString();
}

function parseLine(row: string, index: number): CafeLine {
  const c = cells(row);
  const get = (title: string) => c.get(title) ?? '';
  const quantityText = get('Cantidad');
  const quantity = Number(quantityText);
  if (!quantityText || !Number.isFinite(quantity)) {
    throw new CafeParseError(`Cantidad inválida en la línea ${index + 1}`);
  }
  const description = get('Descripción');
  if (!description) throw new CafeParseError(`Línea ${index + 1} sin descripción`);

  try {
    const taxCents = toCents(get('Impuesto'));
    return {
      lineNo: Number(get('Linea')) || index + 1,
      code: get('Código') || null,
      description,
      quantity,
      listPriceCents: toCents(get('Precio')),
      discountCents: multiplyToCents(get('Descuento'), quantityText),
      lineTotalCents: toCents(get('Total')),
      taxRateBp: nearestTaxRateBp(taxCents, toCents(get('Monto'))),
      taxCents,
    };
  } catch (error) {
    throw new CafeParseError(`Montos inválidos en la línea ${index + 1}: ${(error as Error).message}`);
  }
}

export function parseInvoiceHtml(html: string): CafeInvoice {
  const start = html.indexOf('id="facturaHTML"');
  if (start === -1) throw new CafeParseError('La página no contiene una factura');
  const doc = html.slice(start);
  // Si el CUFE no existe, la DGI responde 200 con el contenedor vacío.
  if (/^id="facturaHTML"[^>]*>\s*<\/div>/.test(doc)) throw new CafeNotFoundError('La DGI no tiene esta factura');

  const cufe = definition(doc, 'CÓDIGO ÚNICO DE FACTURA ELECTRÓNICA \\[CUFE\\]');
  if (!cufe) throw new CafeParseError('No se encontró el CUFE');

  // EMISOR y RECEPTOR usan las mismas etiquetas: se lee solo el panel del emisor.
  const issuerStart = doc.indexOf('EMISOR');
  const receiverStart = doc.indexOf('RECEPTOR', issuerStart);
  if (issuerStart === -1 || receiverStart === -1) throw new CafeParseError('No se encontró el emisor');
  const issuerPanel = doc.slice(issuerStart, receiverStart);
  const ruc = definition(issuerPanel, 'RUC');
  const name = definition(issuerPanel, 'NOMBRE');
  if (!ruc || !name) throw new CafeParseError('El emisor no tiene RUC o nombre');

  const heading = /<div class="panel-heading">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/.exec(doc)?.[1] ?? '';
  const number = /No\.\s*(\d+)/.exec(decodeText(heading))?.[1] ?? null;
  const issuedAt = parseIssuedAt(decodeText(heading));

  const table = /<table[^>]*>([\s\S]*?)<\/table>/.exec(doc.slice(receiverStart))?.[1] ?? '';
  const body = /<tbody>([\s\S]*?)<\/tbody>/.exec(table)?.[1];
  const footer = /<tfoot>([\s\S]*?)<\/tfoot>/.exec(table)?.[1];
  if (body === undefined || footer === undefined) throw new CafeParseError('No se encontró el detalle');

  const lines = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((match, i) => parseLine(match[1] ?? '', i));
  if (lines.length === 0) throw new CafeParseError('La factura no tiene líneas');

  const total = footerAmount(footer, 'Valor Total');
  const tax = footerAmount(footer, 'ITBMS Total');
  if (total === null || tax === null) throw new CafeParseError('No se encontraron los totales');
  const paid = footerAmount(footer, 'TOTAL PAGADO');
  const headerDiscount = footerAmount(footer, 'Descuentos');

  const totalCents = toCents(total);
  const taxCents = toCents(tax);
  const lineDiscountCents = lines.reduce((sum, line) => sum + line.discountCents, 0);

  const warnings: string[] = [];
  const lineSumCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  if (Math.abs(lineSumCents - totalCents) > LINE_SUM_TOLERANCE_CENTS) {
    warnings.push(`Las líneas suman ${lineSumCents} centavos y el encabezado dice ${totalCents}`);
  }

  return {
    cufe,
    number,
    issuedAt,
    issuer: { ruc, dv: definition(issuerPanel, 'DV'), name, address: definition(issuerPanel, 'DIRECCIÓN') },
    lines,
    totals: {
      subtotalCents: totalCents - taxCents,
      taxCents,
      // "Descuentos" del pie es un descuento global (casi siempre 0.00); se suma al de las líneas.
      discountCents: lineDiscountCents + (headerDiscount === null ? 0 : toCents(headerDiscount)),
      totalCents,
      paidCents: paid === null ? null : toCents(paid),
    },
    warnings,
  };
}
