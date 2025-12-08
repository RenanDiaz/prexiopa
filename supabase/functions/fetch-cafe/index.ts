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
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

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
 * Parse XML invoice data using regex-based parsing
 * (deno_dom's DOMParser doesn't support text/xml)
 */
function parseInvoiceXML(xmlString: string, cufe: string, sourceUrl: string): CAFEInvoice {
  console.log('Parsing XML, length:', xmlString.length);

  // Parse general data (gDGen)
  const gDGen = getXmlElementBlock(xmlString, 'gDGen');
  const invoiceNumber = getXmlElementText(gDGen, 'dNroDF') || getXmlElementText(xmlString, 'dNroDF');
  const pointOfSale = getXmlElementText(gDGen, 'dPtoFacDF') || getXmlElementText(xmlString, 'dPtoFacDF');
  const issueDateStr = getXmlElementText(gDGen, 'dFechaEm') || getXmlElementText(xmlString, 'dFechaEm');

  console.log('Parsed general data:', { invoiceNumber, pointOfSale, issueDateStr });

  // Parse emitter data (gEmis)
  const gEmis = getXmlElementBlock(xmlString, 'gEmis');
  const gRucEmi = getXmlElementBlock(gEmis, 'gRucEmi');
  const emitterRuc = getXmlElementText(gRucEmi, 'dRuc') || getXmlElementText(gEmis, 'dRuc');
  const emitterDV = getXmlElementText(gRucEmi, 'dDV') || getXmlElementText(gEmis, 'dDV');
  const emitterName = getXmlElementText(gEmis, 'dNombEm');
  const emitterBranch = getXmlElementText(gEmis, 'dSucEm');
  const emitterAddress = getXmlElementText(gEmis, 'dDirecEm');
  const emitterPhone = getXmlElementText(gEmis, 'dTfnEm');

  console.log('Parsed emitter:', { emitterRuc, emitterName });

  // Parse receiver data (gDatRec)
  const gDatRec = getXmlElementBlock(xmlString, 'gDatRec');
  const gRucRec = getXmlElementBlock(gDatRec, 'gRucRec');
  const receiverRuc = getXmlElementText(gRucRec, 'dRuc') || getXmlElementText(gDatRec, 'dRuc');
  const receiverName = getXmlElementText(gDatRec, 'dNombRec');
  const receiverType = getXmlElementText(gDatRec, 'iTipoRec');

  // Parse items (gItem)
  const items: CAFEItem[] = [];
  const gItems = getAllXmlElementBlocks(xmlString, 'gItem');

  console.log('Found items:', gItems.length);

  gItems.forEach((gItem, index) => {
    const description = getXmlElementText(gItem, 'dDescProd');
    const quantity = parseNumber(getXmlElementText(gItem, 'dCantCodInt'));
    const unit = getXmlElementText(gItem, 'cUnidad') || 'UND';
    const productCode = getXmlElementText(gItem, 'dCodProd');

    // Parse prices
    const gPrecios = getXmlElementBlock(gItem, 'gPrecios');
    const unitPrice = parseNumber(getXmlElementText(gPrecios, 'dPrUnit'));
    const totalPrice = parseNumber(getXmlElementText(gPrecios, 'dValTotItem'));

    // Parse ITBMS
    const gITBMSItem = getXmlElementBlock(gItem, 'gITBMSItem');
    const taxCode = getXmlElementText(gITBMSItem, 'dTasaITBMS') || '1';
    const taxAmount = parseNumber(getXmlElementText(gITBMSItem, 'dValITBMS'));
    const taxRate = TAX_CODE_TO_RATE[taxCode] ?? 7;
    const taxRateCode = TAX_CODE_TO_RATE_CODE[taxCode] ?? 'general';

    items.push({
      lineNumber: index + 1,
      description,
      quantity: quantity || 1,
      unit,
      unitPrice,
      totalPrice,
      taxCode,
      taxRate,
      taxAmount,
      taxRateCode,
      productCode: productCode || undefined,
    });
  });

  // Parse totals (gTot)
  const gTot = getXmlElementBlock(xmlString, 'gTot');
  const subtotal = parseNumber(getXmlElementText(gTot, 'dTotNeto'));
  const totalTax = parseNumber(getXmlElementText(gTot, 'dTotITBMS'));
  const grandTotal = parseNumber(getXmlElementText(gTot, 'dVTot'));
  const taxableAmount7 = parseNumber(getXmlElementText(gTot, 'dTotGravado'));
  const exemptAmount = parseNumber(getXmlElementText(gTot, 'dTotExe'));
  const discount = parseNumber(getXmlElementText(gTot, 'dTotDesc'));

  console.log('Parsed totals:', { subtotal, totalTax, grandTotal });

  // Parse payment info (gPago)
  const gPago = getXmlElementBlock(xmlString, 'gPago');
  const paymentMethod = getXmlElementText(gPago, 'iFormaPago');
  const amountPaid = parseNumber(getXmlElementText(gPago, 'dVlrCuota'));

  // Parse authorization
  const gAutXML = getXmlElementBlock(xmlString, 'gAutXML');
  const authorizationProtocol = getXmlElementText(gAutXML, 'dProtAut');
  const authorizationDateStr = getXmlElementText(gAutXML, 'dFecProc');

  return {
    cufe,
    invoiceNumber,
    pointOfSale,
    issueDate: issueDateStr,
    authorizationDate: authorizationDateStr || undefined,
    authorizationProtocol: authorizationProtocol || undefined,
    emitter: {
      ruc: emitterRuc,
      name: emitterName,
      dv: emitterDV || undefined,
      branch: emitterBranch || undefined,
      address: emitterAddress || undefined,
      phone: emitterPhone || undefined,
    },
    receiver: receiverRuc || receiverName
      ? {
          ruc: receiverRuc || undefined,
          name: receiverName || undefined,
          type: receiverType || undefined,
        }
      : undefined,
    items,
    totals: {
      subtotal,
      totalTax,
      grandTotal,
      taxableAmount7,
      exemptAmount,
      discount,
    },
    payment:
      paymentMethod || amountPaid
        ? {
            method: paymentMethod || undefined,
            amountPaid: amountPaid || undefined,
          }
        : undefined,
    metadata: {
      rawXml: xmlString,
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
  return input.includes('FacturasPorQR');
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

    // Fetch the HTML page with browser-like headers
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-PA,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      redirect: 'follow',
    });

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

    // Parse HTML to extract the XML from the hidden field
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      return {
        success: false,
        error: 'Error al procesar la respuesta de la DGI',
        errorCode: 'PARSE_ERROR',
      };
    }

    // Look for the hidden field containing XML
    // The field might be #facturaXML or similar
    let xmlContent: string | null = null;

    // Try different selectors
    const xmlField =
      doc.querySelector('#facturaXML') ||
      doc.querySelector('input[name="facturaXML"]') ||
      doc.querySelector('textarea[name="facturaXML"]');

    if (xmlField) {
      xmlContent = xmlField.getAttribute('value') || xmlField.textContent;
    }

    // If no hidden field, try to find XML in a script tag or data attribute
    if (!xmlContent) {
      const scripts = doc.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || '';
        // Look for XML content in JavaScript
        const xmlMatch = text.match(/FacturaXML['":\s]*['"](<\?xml[\s\S]*?<\/rFE>)['"]/i);
        if (xmlMatch) {
          xmlContent = xmlMatch[1];
          break;
        }
      }
    }

    // If still no XML, try to extract from the page content
    // Some pages might have the XML embedded differently
    if (!xmlContent) {
      // Look for XML declaration in the HTML
      const xmlMatch = html.match(/<\?xml[\s\S]*?<\/rFE>/i);
      if (xmlMatch) {
        xmlContent = xmlMatch[0];
      }
    }

    // If we couldn't find XML, try to parse from HTML tables
    if (!xmlContent) {
      // Fallback: parse from HTML structure
      // This is less reliable but might work for some pages
      return {
        success: false,
        error:
          'No se pudo extraer los datos XML de la factura. Es posible que el formato de la DGI haya cambiado.',
        errorCode: 'PARSE_ERROR',
      };
    }

    // Decode HTML entities if needed
    xmlContent = xmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Parse the XML
    const invoice = parseInvoiceXML(xmlContent, cufe, sourceUrl);

    return {
      success: true,
      invoice,
    };
  } catch (error) {
    console.error('Error fetching CAFE:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
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
