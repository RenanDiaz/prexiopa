// Formato de los códigos de producto de una cadena (spec §10.2).

export type CodeFormat = 'gtin' | 'gtin_no_check' | 'internal';

/** Dígito verificador GS1 para un código sin él. */
export function gtinCheckDigit(body: string): number {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const digit = Number(body[body.length - 1 - i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  return (10 - (sum % 10)) % 10;
}

export function hasValidCheckDigit(code: string): boolean {
  if (!/^\d{8,14}$/.test(code)) return false;
  return gtinCheckDigit(code.slice(0, -1)) === Number(code.at(-1));
}

/**
 * Detecta el formato a partir de los códigos de una factura:
 * ≥ 60 % de los numéricos de 8–14 dígitos con dígito verificador válido → `gtin`;
 * si no, mayoría de 10–12 dígitos → `gtin_no_check`; si no, `internal`.
 */
export function detectCodeFormat(codes: (string | null)[]): CodeFormat {
  const numeric = codes.filter((code): code is string => !!code && /^\d+$/.test(code));
  const candidates = numeric.filter((code) => code.length >= 8 && code.length <= 14);
  if (candidates.length === 0) return 'internal';

  const valid = candidates.filter(hasValidCheckDigit).length;
  if (valid / candidates.length >= 0.6) return 'gtin';

  const tenToTwelve = numeric.filter((code) => code.length >= 10 && code.length <= 12).length;
  if (tenToTwelve / numeric.length > 0.5) return 'gtin_no_check';
  return 'internal';
}
