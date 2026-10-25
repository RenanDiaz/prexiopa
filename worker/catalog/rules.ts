import { gtinCheckDigit, hasValidCheckDigit, type CodeFormat } from '../cafe/codes';

// Reglas puras del catálogo: GTIN (§10.2), pesables y cantidades no confiables (§10.6).

/** Sube cuando cambian estas reglas: los datos de cada usuario se recalculan una vez. */
export const CATALOG_VERSION = 1;

export type StoreQuantities = 'reliable' | 'always_one';
export type QuantitySource = 'invoice' | 'inferred' | 'user';

const WEIGHED_DESCRIPTION_RE = /KG\b|KILO|\bLBS?\b/i;

/**
 * PLU (hasta 5 dígitos) o etiqueta de balanza: GS1 de circulación restringida
 * (prefijo 2). Carnes, quesos y embutidos los pesa el dependiente y la etiqueta
 * codifica el producto y el peso o el precio. Don Antonio manda esas etiquetas
 * sin dígito verificador (11 dígitos) y con el peso en ceros: "20786500000".
 */
function isVariableMeasureCode(code: string): boolean {
  if (/^\d{1,5}$/.test(code)) return true;
  return /^\d{11,14}$/.test(code) && code.replace(/^0+/, '').startsWith('2');
}

export function isWeighedItem(code: string | null, description: string): boolean {
  return (!!code && isVariableMeasureCode(code)) || WEIGHED_DESCRIPTION_RE.test(description);
}

/**
 * GTIN-13 normalizado según el formato de la tienda, o null si el código no
 * identifica un producto (interno, pesable o de circulación restringida).
 */
export function normalizeGtin(code: string | null, format: CodeFormat): string | null {
  if (!code || !/^\d+$/.test(code) || isVariableMeasureCode(code)) return null;

  let full: string;
  if (format === 'gtin') {
    if (code.length < 8 || code.length > 14 || !hasValidCheckDigit(code)) return null;
    full = code;
  } else if (format === 'gtin_no_check') {
    // Don Antonio quita el dígito verificador y los ceros iniciales.
    if (code.length < 7 || code.length > 12) return null;
    full = code + gtinCheckDigit(code);
  } else {
    return null;
  }

  const gtin13 = full.replace(/^0+/, '').padStart(13, '0');
  if (gtin13.length > 13 || gtin13.startsWith('2') || gtin13.startsWith('02')) return null;
  return gtin13;
}

/**
 * §10.6 regla 1: una tienda es `always_one` si en sus facturas de ≥ 10 líneas
 * todas las cantidades son 1 y hay al menos un pesable con cantidad 1.
 */
export function detectStoreQuantities(stats: {
  largeInvoiceLines: number;
  largeInvoiceNonUnitLines: number;
  weighedUnitLines: number;
}): StoreQuantities {
  if (stats.largeInvoiceLines === 0) return 'reliable';
  return stats.largeInvoiceNonUnitLines === 0 && stats.weighedUnitLines > 0 ? 'always_one' : 'reliable';
}

/**
 * §10.6 regla 3: con un precio unitario conocido, infiere cuántas unidades
 * hay en una línea con cantidad 1. Devuelve null si no es un múltiplo claro.
 */
export function inferUnits(lineTotalCents: number, unitPriceCents: number): number | null {
  if (unitPriceCents <= 0 || lineTotalCents <= 0) return null;
  for (let k = 1; k <= 24; k++) {
    // Tolerancia: 1 centavo por unidad.
    if (Math.abs(lineTotalCents - k * unitPriceCents) <= k) return k;
  }
  return null;
}

/** §5.3: la cantidad de una línea es real y su precio unitario se puede comparar. */
export function hasRealQuantity(source: QuantitySource, storeQuantities: StoreQuantities): boolean {
  return source !== 'invoice' || storeQuantities === 'reliable';
}

/** Precio efectivo unitario (por unidad o por kg) si la cantidad es real; si no, null. */
export function effectiveUnitPriceCents(line: {
  lineTotalCents: number;
  quantity: number;
  quantitySource: QuantitySource;
  storeQuantities: StoreQuantities;
}): number | null {
  if (!hasRealQuantity(line.quantitySource, line.storeQuantities) || line.quantity <= 0) return null;
  return Math.round(line.lineTotalCents / line.quantity);
}
