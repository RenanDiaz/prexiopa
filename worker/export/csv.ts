import { hasRealQuantity, type QuantitySource, type StoreQuantities } from '../catalog/rules';

// F8 — Exportar a CSV (CA8.1–CA8.5). Todo aquí es puro; las queries viven en worker/db/export.ts.

const BOM = String.fromCharCode(0xfeff);
const PANAMA_OFFSET_MS = 5 * 3_600_000;

export const PURCHASE_COLUMNS = [
  'id_compra',
  'fecha',
  'emitida_utc',
  'tienda',
  'ruc',
  'sucursal',
  'origen',
  'subtotal',
  'itbms',
  'descuento',
  'total',
  'pagado',
  'cufe',
] as const;

export const LINE_COLUMNS = [
  'id_compra',
  'linea',
  'fecha',
  'tienda',
  'codigo',
  'descripcion',
  'producto',
  'cantidad',
  'cantidad_origen',
  'cantidad_confiable',
  'es_pesable',
  'precio_lista',
  'descuento',
  'total_linea',
  'tasa_itbms',
  'itbms',
] as const;

/** Centavos enteros → "18.78", sin pasar por floats (CA8.4). */
export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** Hasta 3 decimales y sin ceros sobrantes: 0.7 → "0.7", 2 → "2". */
export function formatQuantity(value: number): string {
  return String(Number(value.toFixed(3)));
}

/** Fecha local de Panamá (UTC-5, sin horario de verano) como "AAAA-MM-DD". */
export function panamaDate(iso: string): string {
  return new Date(new Date(iso).getTime() - PANAMA_OFFSET_MS).toISOString().slice(0, 10);
}

/** "700" puntos base → "7". */
export function formatRate(basisPoints: number): string {
  return String(basisPoints / 100);
}

/**
 * Celda de texto de origen externo (DGI, usuario). Si empieza con un carácter que una
 * hoja de cálculo interpreta como fórmula, se prefija con `'` (CA8.5).
 */
export function textCell(value: string | null | undefined): string {
  const text = value ?? '';
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function quote(cell: string): string {
  return /[",\r\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
}

/** UTF-8 con BOM, `CRLF` y comillas según RFC 4180 (CA8.4). */
export function toCsv(columns: readonly string[], rows: string[][]): string {
  const lines = [columns, ...rows].map((row) => row.map(quote).join(','));
  return `${BOM}${lines.join('\r\n')}\r\n`;
}

export type PurchaseExportRow = {
  id: string;
  issuedAt: string;
  storeName: string;
  ruc: string | null;
  branchAddress: string | null;
  source: 'cafe' | 'manual';
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  paidCents: number | null;
  cufe: string | null;
};

export type LineExportRow = {
  purchaseId: string;
  source: 'cafe' | 'manual';
  lineNo: number;
  issuedAt: string;
  storeName: string;
  code: string | null;
  description: string;
  productName: string | null;
  quantity: number;
  quantitySource: QuantitySource;
  storeQuantities: StoreQuantities;
  isWeighed: boolean;
  listPriceCents: number;
  discountCents: number;
  lineTotalCents: number;
  taxRateBp: number;
  taxCents: number;
};

/** Una compra manual no captura ITBMS (spec §3): se exporta vacío, no como 0.00 (CA8.2, CA8.3). */
const taxCell = (source: 'cafe' | 'manual', render: () => string) => (source === 'manual' ? '' : render());

export function purchasesCsv(rows: PurchaseExportRow[]): string {
  return toCsv(
    PURCHASE_COLUMNS,
    rows.map((row) => [
      row.id,
      panamaDate(row.issuedAt),
      row.issuedAt,
      textCell(row.storeName),
      textCell(row.ruc),
      textCell(row.branchAddress),
      row.source,
      // subtotal = total − ITBMS: sin ITBMS tampoco se conoce.
      taxCell(row.source, () => centsToDecimal(row.subtotalCents)),
      taxCell(row.source, () => centsToDecimal(row.taxCents)),
      centsToDecimal(row.discountCents),
      centsToDecimal(row.totalCents),
      row.paidCents === null ? '' : centsToDecimal(row.paidCents),
      row.cufe ?? '',
    ]),
  );
}

export function linesCsv(rows: LineExportRow[]): string {
  return toCsv(
    LINE_COLUMNS,
    rows.map((row) => [
      row.purchaseId,
      String(row.lineNo),
      panamaDate(row.issuedAt),
      textCell(row.storeName),
      textCell(row.code),
      textCell(row.description),
      textCell(row.productName),
      formatQuantity(row.quantity),
      row.quantitySource,
      // La misma regla que usa F3 para comparar precios (§5.3).
      hasRealQuantity(row.quantitySource, row.storeQuantities) ? 'si' : 'no',
      row.isWeighed ? 'si' : 'no',
      centsToDecimal(row.listPriceCents),
      centsToDecimal(row.discountCents),
      centsToDecimal(row.lineTotalCents),
      taxCell(row.source, () => formatRate(row.taxRateBp)),
      taxCell(row.source, () => centsToDecimal(row.taxCents)),
    ]),
  );
}
