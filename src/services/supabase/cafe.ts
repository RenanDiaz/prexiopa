/**
 * CAFE Service
 *
 * Service for importing electronic invoices (CAFE) from DGI Panama.
 * Handles fetching, parsing, and storing invoice data.
 */

import { supabase } from '../../supabaseClient';
import type {
  CAFEInvoice,
  CAFEFetchResult,
  ImportedInvoice,
  CAFEItem,
} from '@/types/cafe';
import { isQRUrl } from '@/types/cafe';
import type { TaxRateCode } from '@/types/tax';

// =====================================================
// EDGE FUNCTION CALLS
// =====================================================

/**
 * Fetch and parse a CAFE invoice from DGI using the Edge Function
 * Accepts either a CUFE directly or a full QR URL
 */
export async function fetchCAFEInvoice(cufeOrUrl: string): Promise<CAFEFetchResult> {
  try {
    // Determine if this is a QR URL or a plain CUFE
    const body = isQRUrl(cufeOrUrl)
      ? { qrUrl: cufeOrUrl }
      : { cufe: cufeOrUrl };

    const { data, error } = await supabase.functions.invoke('fetch-cafe', {
      body,
    });

    if (error) {
      console.error('Error calling fetch-cafe function:', error);
      return {
        success: false,
        error: error.message || 'Error al consultar la factura',
        errorCode: 'FETCH_ERROR',
      };
    }

    return data as CAFEFetchResult;
  } catch (err) {
    console.error('Exception calling fetch-cafe function:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
      errorCode: 'UNKNOWN',
    };
  }
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

/**
 * Check if a CUFE has already been imported by the current user
 */
export async function checkCUFEImported(cufe: string): Promise<{
  isImported: boolean;
  importedInvoiceId?: string;
  shoppingSessionId?: string;
  importedAt?: string;
}> {
  const { data, error } = await supabase.rpc('check_cufe_imported', {
    p_cufe: cufe,
  });

  if (error) {
    console.error('Error checking CUFE:', error);
    return { isImported: false };
  }

  if (data && data.length > 0 && data[0].is_imported) {
    return {
      isImported: true,
      importedInvoiceId: data[0].imported_invoice_id,
      shoppingSessionId: data[0].shopping_session_id,
      importedAt: data[0].imported_at,
    };
  }

  return { isImported: false };
}

/**
 * Save an imported invoice to the database
 */
export async function saveImportedInvoice(
  invoice: CAFEInvoice,
  shoppingSessionId?: string
): Promise<ImportedInvoice> {
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to import invoices');
  }

  // Insert the invoice
  const { data: importedInvoice, error: invoiceError } = await supabase
    .from('imported_invoices')
    .insert({
      user_id: user.id,
      cufe: invoice.cufe,
      invoice_number: invoice.invoiceNumber,
      point_of_sale: invoice.pointOfSale || null,
      issue_date: invoice.issueDate,
      authorization_date: invoice.authorizationDate || null,
      authorization_protocol: invoice.authorizationProtocol || null,
      emitter_ruc: invoice.emitter.ruc,
      emitter_name: invoice.emitter.name,
      emitter_dv: invoice.emitter.dv || null,
      emitter_branch: invoice.emitter.branch || null,
      emitter_address: invoice.emitter.address || null,
      emitter_phone: invoice.emitter.phone || null,
      receiver_ruc: invoice.receiver?.ruc || null,
      receiver_name: invoice.receiver?.name || null,
      receiver_type: invoice.receiver?.type || null,
      subtotal: invoice.totals.subtotal,
      total_tax: invoice.totals.totalTax,
      grand_total: invoice.totals.grandTotal,
      taxable_amount_7: invoice.totals.taxableAmount7 || 0,
      taxable_amount_10: invoice.totals.taxableAmount10 || 0,
      taxable_amount_15: invoice.totals.taxableAmount15 || 0,
      exempt_amount: invoice.totals.exemptAmount || 0,
      discount_amount: invoice.totals.discount || 0,
      payment_method: invoice.payment?.method || null,
      amount_paid: invoice.payment?.amountPaid || null,
      change_amount: invoice.payment?.change || null,
      item_count: invoice.items.length,
      invoice_data: invoice,
      shopping_session_id: shoppingSessionId || null,
      source_url: invoice.metadata.sourceUrl || null,
      raw_xml: invoice.metadata.rawXml || null,
    })
    .select()
    .single();

  if (invoiceError) {
    console.error('Error saving imported invoice:', invoiceError);
    throw new Error(`Failed to save invoice: ${invoiceError.message}`);
  }

  // Insert the invoice items
  const itemsToInsert = invoice.items.map((item) => ({
    imported_invoice_id: importedInvoice.id,
    line_number: item.lineNumber,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    tax_code: item.taxCode,
    tax_rate: item.taxRate,
    tax_amount: item.taxAmount,
    product_code: item.productCode || null,
  }));

  const { error: itemsError } = await supabase
    .from('imported_invoice_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error saving invoice items:', itemsError);
    // Don't throw - the invoice is saved, items are supplementary
  }

  return {
    id: importedInvoice.id,
    userId: importedInvoice.user_id,
    cufe: importedInvoice.cufe,
    invoiceNumber: importedInvoice.invoice_number,
    emitterRuc: importedInvoice.emitter_ruc,
    emitterName: importedInvoice.emitter_name,
    issueDate: importedInvoice.issue_date,
    grandTotal: importedInvoice.grand_total,
    totalTax: importedInvoice.total_tax,
    itemCount: importedInvoice.item_count,
    shoppingSessionId: importedInvoice.shopping_session_id,
    invoiceData: importedInvoice.invoice_data,
    createdAt: importedInvoice.created_at,
    updatedAt: importedInvoice.updated_at,
  };
}

/**
 * Update the shopping session ID for an imported invoice
 */
export async function linkInvoiceToSession(
  importedInvoiceId: string,
  shoppingSessionId: string
): Promise<void> {
  const { error } = await supabase
    .from('imported_invoices')
    .update({ shopping_session_id: shoppingSessionId })
    .eq('id', importedInvoiceId);

  if (error) {
    console.error('Error linking invoice to session:', error);
    throw new Error(`Failed to link invoice: ${error.message}`);
  }
}

/**
 * Get imported invoices for the current user
 */
export async function getImportedInvoices(
  limit: number = 20,
  offset: number = 0
): Promise<
  Array<{
    id: string;
    cufe: string;
    invoiceNumber: string;
    emitterName: string;
    emitterRuc: string;
    issueDate: string;
    grandTotal: number;
    itemCount: number;
    shoppingSessionId: string | null;
    createdAt: string;
  }>
> {
  const { data, error } = await supabase.rpc('get_imported_invoices_summary', {
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching imported invoices:', error);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  return (
    data?.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      cufe: row.cufe as string,
      invoiceNumber: row.invoice_number as string,
      emitterName: row.emitter_name as string,
      emitterRuc: row.emitter_ruc as string,
      issueDate: row.issue_date as string,
      grandTotal: row.grand_total as number,
      itemCount: row.item_count as number,
      shoppingSessionId: row.shopping_session_id as string | null,
      createdAt: row.created_at as string,
    })) || []
  );
}

/**
 * Get a single imported invoice with full details
 */
export async function getImportedInvoice(id: string): Promise<ImportedInvoice | null> {
  const { data, error } = await supabase
    .from('imported_invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching imported invoice:', error);
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    cufe: data.cufe,
    invoiceNumber: data.invoice_number,
    emitterRuc: data.emitter_ruc,
    emitterName: data.emitter_name,
    issueDate: data.issue_date,
    grandTotal: data.grand_total,
    totalTax: data.total_tax,
    itemCount: data.item_count,
    shoppingSessionId: data.shopping_session_id,
    invoiceData: data.invoice_data,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete an imported invoice
 */
export async function deleteImportedInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('imported_invoices').delete().eq('id', id);

  if (error) {
    console.error('Error deleting imported invoice:', error);
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
}

/**
 * Get import statistics for the current user
 */
export async function getImportStatistics(): Promise<{
  totalImports: number;
  totalAmount: number;
  totalItems: number;
  uniqueStores: number;
  firstImport: string | null;
  lastImport: string | null;
}> {
  const { data, error } = await supabase.rpc('get_import_statistics');

  if (error) {
    console.error('Error fetching import statistics:', error);
    return {
      totalImports: 0,
      totalAmount: 0,
      totalItems: 0,
      uniqueStores: 0,
      firstImport: null,
      lastImport: null,
    };
  }

  const stats = data?.[0];
  return {
    totalImports: stats?.total_imports || 0,
    totalAmount: stats?.total_amount || 0,
    totalItems: stats?.total_items || 0,
    uniqueStores: stats?.unique_stores || 0,
    firstImport: stats?.first_import || null,
    lastImport: stats?.last_import || null,
  };
}

// =====================================================
// STORE MATCHING
// =====================================================

/**
 * Find a store by emitter RUC
 */
export async function findStoreByRUC(
  ruc: string
): Promise<{ storeId: string; storeName: string; isVerified: boolean } | null> {
  const { data, error } = await supabase.rpc('find_store_by_ruc', {
    p_ruc: ruc,
  });

  if (error) {
    console.error('Error finding store by RUC:', error);
    return null;
  }

  if (data && data.length > 0) {
    return {
      storeId: data[0].store_id,
      storeName: data[0].store_name,
      isVerified: data[0].is_verified,
    };
  }

  return null;
}

// =====================================================
// HELPERS FOR SHOPPING SESSION CREATION
// =====================================================

/**
 * Convert CAFE items to shopping item format
 */
export function cafeItemsToShoppingItems(
  items: CAFEItem[],
  sessionId: string,
  storeId?: string,
  storeName?: string
): Array<{
  session_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  unit: string;
  store_id: string | null;
  store_name: string | null;
  tax_rate_code: TaxRateCode;
  tax_rate: number;
  price_includes_tax: boolean;
  base_price: number;
  tax_amount: number;
}> {
  return items.map((item) => ({
    session_id: sessionId,
    product_id: null, // Will be matched later if product exists
    product_name: item.description,
    price: item.unitPrice,
    quantity: item.quantity,
    unit: item.unit,
    store_id: storeId || null,
    store_name: storeName || null,
    tax_rate_code: item.taxRateCode as TaxRateCode,
    tax_rate: item.taxRate,
    price_includes_tax: true, // DGI prices include tax
    base_price: item.unitPrice / (1 + item.taxRate / 100),
    tax_amount: item.taxAmount,
  }));
}
