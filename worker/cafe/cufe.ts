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

/** Fecha de emisión que trae el CUFE (caracteres 33–40, AAAAMMDD) como "AAAA-MM-DD". */
export function cufeIssueDate(cufe: string): string {
  const ymd = cufe.slice(32, 40);
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

const PANAMA_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Mensaje cuando la DGI no tiene la factura. Solo sugiere esperar si el CUFE es
 * de hoy o de ayer en hora de Panamá (ayer cubre las compras cerca de medianoche):
 * a una factura vieja no le va a servir esperar.
 */
export function cafeNotFoundMessage(cufe: string, now: Date = new Date()): string {
  const issued = cufeIssueDate(cufe);
  const panamaNow = now.getTime() - PANAMA_OFFSET_MS;
  const yesterday = new Date(panamaNow - DAY_MS).toISOString().slice(0, 10);
  if (issued >= yesterday) {
    return 'La DGI no tiene una factura con este CUFE. Si es de hoy, espera unos minutos y reintenta.';
  }
  const [y, m, d] = issued.split('-');
  return `La DGI no tiene una factura con este CUFE (emitida el ${d}/${m}/${y}). Revisa que el QR sea de una factura electrónica.`;
}
