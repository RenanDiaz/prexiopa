// Montos de la DGI como string → centavos enteros, con redondeo half-up (spec §10.3).
// Nunca parseFloat: TAMEK manda "1.639999" y CITY MALL "3.53875".

const DECIMAL_RE = /^(-?)(\d*)(?:\.(\d*))?$/;

/** Un decimal como entero escalado: value = units / 10^scale. */
type Scaled = { units: bigint; scale: number };

function parseDecimal(raw: string): Scaled {
  const text = raw.trim().replace(/,/g, '');
  const match = DECIMAL_RE.exec(text);
  if (!text || !match || (!match[2] && !match[3])) throw new Error(`Monto inválido: "${raw}"`);
  const [, sign, int = '', frac = ''] = match;
  const units = BigInt(`${int || '0'}${frac}`);
  return { units: sign ? -units : units, scale: frac.length };
}

/** Divide por 10^scale redondeando half-up (alejándose de cero en el .5). */
function roundScaled(units: bigint, scale: number): bigint {
  if (scale <= 0) return units * 10n ** BigInt(-scale);
  const divisor = 10n ** BigInt(scale);
  const abs = units < 0n ? -units : units;
  const rounded = (abs * 2n + divisor) / (divisor * 2n);
  return units < 0n ? -rounded : rounded;
}

/** "4.62" → 462, "3.53875" → 354, "" → 0. */
export function toCents(raw: string): number {
  if (!raw.trim()) return 0;
  const { units, scale } = parseDecimal(raw);
  return Number(roundScaled(units, scale - 2));
}

/** a × b en centavos, sin pasar por floats: ("0.11", "2") → 22. */
export function multiplyToCents(a: string, b: string): number {
  if (!a.trim() || !b.trim()) return 0;
  const x = parseDecimal(a);
  const y = parseDecimal(b);
  return Number(roundScaled(x.units * y.units, x.scale + y.scale - 2));
}
