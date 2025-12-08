/**
 * Supabase Edge Function: fetch-cafe
 *
 * Fetches and parses electronic invoice (CAFE) data from DGI Panama
 * given a CUFE (Código Único de Factura Electrónica).
 *
 * This function:
 * 1. Validates the CUFE format
 * 2. Fetches the invoice page from DGI
 * 3. Extracts the XML data from the hidden field
 * 4. Parses the XML into a structured format
 * 5. Returns the parsed invoice data
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Note: We parse HTML directly with regex instead of DOMParser
// because deno_dom's DOMParser has limitations

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface CAFEItem {
  lineNumber: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  taxCode: string;
  taxRate: number;
  taxAmount: number;
  taxRateCode: string;
  productCode?: string;
}

interface CAFEInvoice {
  cufe: string;
  invoiceNumber: string;
  pointOfSale?: string;
  issueDate: string;
  authorizationDate?: string;
  authorizationProtocol?: string;
  emitter: {
    ruc: string;
    name: string;
    dv?: string;
    branch?: string;
    address?: string;
    phone?: string;
  };
  receiver?: {
    ruc?: string;
    name?: string;
    type?: string;
  };
  items: CAFEItem[];
  totals: {
    subtotal: number;
    totalTax: number;
    grandTotal: number;
    taxableAmount7?: number;
    taxableAmount10?: number;
    taxableAmount15?: number;
    exemptAmount?: number;
    discount?: number;
    rounding?: number;
  };
  payment?: {
    method?: string;
    amountPaid?: number;
    change?: number;
  };
  metadata: {
    rawXml?: string;
    fetchedAt: string;
    sourceUrl?: string;
  };
}

interface FetchResult {
  success: boolean;
  invoice?: CAFEInvoice;
  error?: string;
  errorCode?: string;
}

// Tax code mapping
const TAX_CODE_TO_RATE: Record<string, number> = {
  '0': 0,
  '1': 7,
  '2': 10,
  '3': 15,
};

const TAX_CODE_TO_RATE_CODE: Record<string, string> = {
  '0': 'exempt',
  '1': 'general',
  '2': 'selective',
  '3': 'services',
};

/**
 * Validate CUFE format
 */
function validateCUFE(cufe: string): boolean {
  if (!cufe || typeof cufe !== 'string') {
    return false;
  }

  const cleanCufe = cufe.trim().toUpperCase();
  const validPrefixes = ['FE', 'NC', 'ND'];
  const hasValidPrefix = validPrefixes.some((prefix) => cleanCufe.startsWith(prefix));

  if (!hasValidPrefix) {
    return false;
  }

  if (cleanCufe.length < 40) {
    return false;
  }

  return true;
}

/**
 * Parse a number from string, handling locale-specific formats
 */
function parseNumber(value: string | null | undefined): number {
  if (!value) return 0;
  // Remove currency symbols and whitespace, handle comma as decimal separator
  const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * Handles: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }

  // DD/MM/YYYY or DD-MM-YYYY format (common in Panama/Latin America)
  const dmyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // MM/DD/YYYY format (US style, less common)
  const mdyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mdyMatch) {
    // Assume DMY for Latin America unless day > 12
    const [, first, second, year] = mdyMatch;
    const firstNum = parseInt(first, 10);
    const secondNum = parseInt(second, 10);

    // If first number > 12, it must be the day
    if (firstNum > 12) {
      return `${year}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
    }
    // Default to DMY format
    return `${year}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
  }

  // Return as-is if no pattern matches (will likely fail, but at least we tried)
  return dateStr;
}

/**
 * Get XML element text content using regex
 * Works for both self-closing and regular tags
 */
function getXmlElementText(xml: string, tagName: string): string {
  // Match both <tag>content</tag> and <tag /> patterns
  const pattern = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i');
  const match = xml.match(pattern);
  return match ? match[1].trim() : '';
}

/**
 * Get XML element block (including nested content)
 */
function getXmlElementBlock(xml: string, tagName: string): string {
  const pattern = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?</${tagName}>`, 'i');
  const match = xml.match(pattern);
  return match ? match[0] : '';
}

/**
 * Get all XML element blocks (for multiple occurrences like gItem)
 */
function getAllXmlElementBlocks(xml: string, tagName: string): string[] {
  const pattern = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?</${tagName}>`, 'gi');
  const matches = xml.match(pattern);
  return matches || [];
}

/**
 * Extract value from HTML dt/dd pattern
 * Pattern: <dt class="small">LABEL</dt><dd>VALUE</dd>
 */
function extractDTValue(html: string, label: string): string {
  const pattern = new RegExp(
    `<dt[^>]*>\\s*${label}\\s*</dt>\\s*<dd[^>]*>([^<]*)</dd>`,
    'i'
  );
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

/**
 * Extract value from HTML table cell with data-title attribute
 * Pattern: <td data-title="TITLE" ...>VALUE</td>
 */
function extractTdValue(row: string, dataTitle: string): string {
  const pattern = new RegExp(
    `<td[^>]*data-title="${dataTitle}"[^>]*>([^<]*)</td>`,
    'i'
  );
  const match = row.match(pattern);
  return match ? match[1].trim() : '';
}

/**
 * Extract all table rows from tbody
 */
function extractTableRows(html: string): string[] {
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return [];

  const rowPattern = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  return tbodyMatch[1].match(rowPattern) || [];
}

/**
 * Estimate tax rate from unit price, total price, and tax amount
 * Returns the tax code (0, 1, 2, 3)
 */
function estimateTaxCode(
  unitPrice: number,
  totalPrice: number,
  taxAmount: number
): string {
  if (taxAmount === 0) return '0'; // Exempt

  // Calculate implied tax rate
  const baseAmount = totalPrice - taxAmount;
  if (baseAmount <= 0) return '1'; // Default to 7%

  const impliedRate = (taxAmount / baseAmount) * 100;

  // Match to closest known rate
  if (impliedRate < 3) return '0'; // Exempt (0%)
  if (impliedRate < 8.5) return '1'; // General (7%)
  if (impliedRate < 12.5) return '2'; // Selective (10%)
  return '3'; // Services/Tobacco (15%)
}

/**
 * Parse invoice data directly from the HTML response
 * The DGI page renders the invoice data in HTML tables
 */
function parseInvoiceFromHTML(html: string, cufe: string, sourceUrl: string): CAFEInvoice {
  console.log('Parsing HTML response, length:', html.length);

  // Extract emitter (Emisor) data
  // The HTML has sections with <dt>LABEL</dt><dd>VALUE</dd> pairs
  const emitterRuc = extractDTValue(html, 'RUC');
  const emitterDV = extractDTValue(html, 'DV');
  const emitterName = extractDTValue(html, 'NOMBRE');
  const emitterAddress = extractDTValue(html, 'DIRECCIÓN');
  const emitterPhone = extractDTValue(html, 'TELÉFONO');

  console.log('Parsed emitter:', { emitterRuc, emitterName, emitterDV });

  // Extract invoice number and date from page
  // Look for patterns like "No. Documento: 12345" or "Fecha: 2025-12-08"
  const invoiceNumberMatch = html.match(/No\.?\s*Documento[:\s]*(\d+)/i);
  const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : '';

  // Try to extract date from multiple patterns
  let issueDateStr = '';
  const dateMatch = html.match(
    /Fecha[^:]*:\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i
  );
  if (dateMatch) {
    issueDateStr = dateMatch[1];
  }

  // Extract CUFE breakdown from the URL itself to get date
  // CUFE format includes date: FE + RUC parts + YYYYMMDD + sequence
  const cufeMatch = cufe.match(/(\d{8})\d{13}0[1-4][1-2]\d{10}$/);
  if (cufeMatch && !issueDateStr) {
    const dateStr = cufeMatch[1];
    issueDateStr = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }

  console.log('Parsed general data:', { invoiceNumber, issueDateStr });

  // Parse items from the table
  // Table structure: Linea, Código, Descripción, Cantidad, Precio Unitario, etc.
  const items: CAFEItem[] = [];
  const rows = extractTableRows(html);

  console.log('Found table rows:', rows.length);

  rows.forEach((row, index) => {
    const description =
      extractTdValue(row, 'Descripción') || extractTdValue(row, 'Descripcion');
    const quantity = parseNumber(extractTdValue(row, 'Cantidad'));
    const productCode =
      extractTdValue(row, 'Código') || extractTdValue(row, 'Codigo');
    const unitPrice =
      parseNumber(extractTdValue(row, 'Precio Unitario')) ||
      parseNumber(extractTdValue(row, 'Precio'));
    const totalPrice = parseNumber(extractTdValue(row, 'Total'));
    const taxAmount =
      parseNumber(extractTdValue(row, 'ITBMS')) ||
      parseNumber(extractTdValue(row, 'Impuesto'));

    // Skip empty rows
    if (!description && !productCode) return;

    // Estimate tax code from amounts
    const taxCode = estimateTaxCode(unitPrice, totalPrice, taxAmount);
    const taxRate = TAX_CODE_TO_RATE[taxCode] ?? 7;
    const taxRateCode = TAX_CODE_TO_RATE_CODE[taxCode] ?? 'general';

    items.push({
      lineNumber: index + 1,
      description: description || 'Producto',
      quantity: quantity || 1,
      unit: 'UND',
      unitPrice,
      totalPrice,
      taxCode,
      taxRate,
      taxAmount,
      taxRateCode,
      productCode: productCode || undefined,
    });
  });

  console.log('Parsed items:', items.length);

  // Calculate totals from items
  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalPrice - item.taxAmount),
    0
  );
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Try to extract totals from footer if available
  const itbmsTotalMatch = html.match(/ITBMS\s*Total[:\s]*([0-9.,]+)/i);
  const extractedTotalTax = itbmsTotalMatch
    ? parseNumber(itbmsTotalMatch[1])
    : totalTax;

  console.log('Parsed totals:', {
    subtotal,
    totalTax: extractedTotalTax,
    grandTotal,
  });

  return {
    cufe,
    invoiceNumber,
    pointOfSale: undefined,
    issueDate: normalizeDate(issueDateStr),
    authorizationDate: undefined,
    authorizationProtocol: undefined,
    emitter: {
      ruc: emitterRuc,
      name: emitterName,
      dv: emitterDV || undefined,
      branch: undefined,
      address: emitterAddress || undefined,
      phone: emitterPhone || undefined,
    },
    receiver: undefined,
    items,
    totals: {
      subtotal,
      totalTax: extractedTotalTax,
      grandTotal,
    },
    payment: undefined,
    metadata: {
      rawXml: undefined,
      fetchedAt: new Date().toISOString(),
      sourceUrl,
    },
  };
}

/**
 * Extract CUFE from QR URL
 */
function extractCUFEFromQRUrl(url: string): string | null {
  const qrPattern = /[?&]chFE=([A-Za-z0-9\-]+)/i;
  const match = url.match(qrPattern);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Check if the input is a QR URL
 */
function isQRUrl(input: string): boolean {
  return input.toLowerCase().includes('facturasporqr');
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries} for:`, url);
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt} failed:`, lastError.message);

      // If it's a connection error and we have retries left, wait and retry
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // 1s, 2s, 3s...
        console.log(`Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('All fetch attempts failed');
}

/**
 * Fetch invoice from DGI and parse it
 * Accepts either a CUFE directly or a full QR URL
 */
async function fetchCAFE(cufeOrUrl: string): Promise<FetchResult> {
  let sourceUrl: string;
  let cufe: string;

  // Determine if input is a QR URL or a plain CUFE
  if (isQRUrl(cufeOrUrl)) {
    // It's a QR URL - use it directly
    sourceUrl = cufeOrUrl;
    const extractedCufe = extractCUFEFromQRUrl(cufeOrUrl);
    if (!extractedCufe) {
      return {
        success: false,
        error: 'No se pudo extraer el CUFE de la URL del QR',
        errorCode: 'INVALID_CUFE',
      };
    }
    cufe = extractedCufe;
  } else {
    // It's a plain CUFE - build the URL
    cufe = cufeOrUrl;
    sourceUrl = `https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/${cufe}`;
  }

  try {
    console.log('Fetching URL:', sourceUrl);

    // Fetch the HTML page with browser-like headers and retry logic
    const response = await fetchWithRetry(
      sourceUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'es-PA,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
        },
        redirect: 'follow',
      },
      3
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Try to get error body for debugging
      const errorBody = await response.text().catch(() => 'Unable to read error body');
      console.error('DGI error response:', errorBody.substring(0, 500));

      if (response.status === 404) {
        return {
          success: false,
          error: 'Factura no encontrada en el sistema de la DGI',
          errorCode: 'NOT_FOUND',
        };
      }
      if (response.status === 400) {
        // If QR URL failed, try with CUFE URL instead
        if (isQRUrl(cufeOrUrl)) {
          console.log('QR URL failed, retrying with CUFE URL...');
          const cufeUrl = `https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/${cufe}`;
          return fetchCAFE(cufe); // Retry with just the CUFE
        }
        return {
          success: false,
          error: 'La DGI rechazó la solicitud. Verifica que el CUFE sea correcto.',
          errorCode: 'FETCH_ERROR',
        };
      }
      return {
        success: false,
        error: `Error al consultar la DGI: ${response.status}`,
        errorCode: 'FETCH_ERROR',
      };
    }

    const html = await response.text();

    console.log('HTML response received, length:', html.length);

    // Check if the page contains invoice data (look for the details table)
    if (!html.includes('table') || !html.includes('data-title')) {
      // The page might not have loaded the invoice data
      // Check for error messages
      if (html.includes('No se encontr') || html.includes('no encontrada')) {
        return {
          success: false,
          error: 'Factura no encontrada en el sistema de la DGI',
          errorCode: 'NOT_FOUND',
        };
      }
      return {
        success: false,
        error: 'No se pudo obtener los datos de la factura. La página no contiene información del documento.',
        errorCode: 'PARSE_ERROR',
      };
    }

    // Parse invoice data directly from HTML
    // The DGI page renders the invoice data in HTML tables with data-title attributes
    const invoice = parseInvoiceFromHTML(html, cufe, sourceUrl);

    // Validate that we got some data
    if (!invoice.emitter.ruc && !invoice.emitter.name && invoice.items.length === 0) {
      return {
        success: false,
        error: 'No se pudieron extraer los datos de la factura del HTML',
        errorCode: 'PARSE_ERROR',
      };
    }

    return {
      success: true,
      invoice,
    };
  } catch (error) {
    console.error('Error fetching CAFE:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Check for connection errors
    if (
      errorMessage.includes('Connection reset') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('timeout')
    ) {
      return {
        success: false,
        error:
          'No se pudo conectar con el servidor de la DGI. El servicio puede estar temporalmente no disponible. Por favor intenta de nuevo en unos minutos.',
        errorCode: 'FETCH_ERROR',
      };
    }

    return {
      success: false,
      error: errorMessage,
      errorCode: 'UNKNOWN',
    };
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();
    const { cufe, qrUrl } = body;

    // Accept either cufe directly or a full qrUrl
    const input = qrUrl || cufe;

    if (!input) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'CUFE o URL del QR es requerido',
          errorCode: 'INVALID_CUFE',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If it's a QR URL, validate it contains the required parameter
    if (isQRUrl(input)) {
      if (!extractCUFEFromQRUrl(input)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'URL del QR inválida: no contiene el parámetro chFE',
            errorCode: 'INVALID_CUFE',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Validate CUFE format
      if (!validateCUFE(input)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Formato de CUFE inválido',
            errorCode: 'INVALID_CUFE',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Fetch and parse the invoice
    const result = await fetchCAFE(input.trim());

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        errorCode: 'UNKNOWN',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
