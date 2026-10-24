// Formato oficial del CUFE: el mismo regex que valida el formulario de la DGI.
const CUFE_RE =
  /^FE\d{2}[12][0-9A-Z-]{20}-[0-9A-Z]{6}[12]\d{3}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{13}0[1-4][12]\d{10}$/;

export const DGI_INVOICE_URL = 'https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/';

export function isValidCufe(cufe: string): boolean {
  return CUFE_RE.test(cufe);
}

/**
 * Acepta el CUFE pegado o la URL del QR (`...FacturasPorQR?chFE=<CUFE>&...`).
 * Devuelve el CUFE normalizado, o null si no hay uno válido.
 */
export function extractCufe(input: string): string | null {
  const text = input.trim();
  let candidate = text;
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      candidate = url.searchParams.get('chFE') ?? url.pathname.split('/').pop() ?? '';
    } catch {
      return null;
    }
  }
  candidate = candidate.trim().toUpperCase();
  return isValidCufe(candidate) ? candidate : null;
}

export function invoiceUrl(cufe: string): string {
  return DGI_INVOICE_URL + cufe;
}
