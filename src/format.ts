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
