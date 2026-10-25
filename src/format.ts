const money = new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' });
const date = new Intl.DateTimeFormat('es-PA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Panama',
});
const dateTime = new Intl.DateTimeFormat('es-PA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Panama',
});
const quantity = new Intl.NumberFormat('es-PA', { maximumFractionDigits: 3 });

export const formatCents = (cents: number) => money.format(cents / 100);
export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatQuantity = (value: number) => quantity.format(value);
export const formatRate = (basisPoints: number) => `${basisPoints / 100} %`;

/** "$0.80 c/u", "$4.75/kg" o, si la cantidad no es real, "$2.40 la línea" (§10.6). */
export function formatEntryPrice(entry: { unitPriceCents: number | null; lineTotalCents: number; unit: 'kg' | 'lb' | 'u' }) {
  if (entry.unitPriceCents === null) return `${formatCents(entry.lineTotalCents)} la línea`;
  const suffix = entry.unit === 'u' ? ' c/u' : `/${entry.unit}`;
  return `${formatCents(entry.unitPriceCents)}${suffix}`;
}

const monthName = new Intl.DateTimeFormat('es-PA', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2026-10" → "oct 2026". */
export const formatMonth = (month: string) => monthName.format(new Date(`${month}-01T00:00:00Z`));

/** Fecha de hoy en Panamá como "AAAA-MM-DD" (para <input type="date">). */
export const toPanamaDate = (iso: string) => new Date(Date.parse(iso) - 5 * 3_600_000).toISOString().slice(0, 10);
export const todayInPanama = () => toPanamaDate(new Date().toISOString());

/**
 * "2.5" → 250, "1,99" → 199. Sin floats para dinero (igual que el parser CAFE).
 * Devuelve null si no es un monto válido.
 */
export function parseMoneyToCents(text: string): number | null {
  const match = /^\s*\$?\s*(\d{0,7})(?:[.,](\d{0,2}))?\s*$/.exec(text);
  if (!match || (!match[1] && !match[2])) return null;
  return Number(match[1] || '0') * 100 + Number((match[2] ?? '').padEnd(2, '0'));
}
