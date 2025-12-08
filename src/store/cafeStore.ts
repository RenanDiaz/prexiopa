/**
 * CAFE Store
 *
 * Zustand store for managing CAFE (electronic invoice) import state.
 * Handles the import flow: scan/input CUFE -> fetch -> preview -> import
 */

import { create } from 'zustand';
import { toast } from 'react-toastify';
import type { CAFEInvoice, CAFEImportStatus, CAFEFetchResult } from '@/types/cafe';
import {
  fetchCAFEInvoice,
  checkCUFEImported,
  saveImportedInvoice,
  findStoreByRUC,
} from '@/services/supabase/cafe';
import { createShoppingSession, addShoppingItem } from '@/services/supabase/shopping';
import type { TaxRateCode } from '@/types/tax';

interface CAFEState {
  // Current import flow state
  status: CAFEImportStatus;
  cufe: string | null;
  invoice: CAFEInvoice | null;
  error: string | null;
  errorCode: string | null;

  // Import result
  importedInvoiceId: string | null;
  shoppingSessionId: string | null;

  // Store matching
  matchedStore: {
    storeId: string;
    storeName: string;
    isVerified: boolean;
  } | null;

  // UI state
  isModalOpen: boolean;
  showPreview: boolean;

  // Previously imported check
  previouslyImported: {
    isImported: boolean;
    importedInvoiceId?: string;
    shoppingSessionId?: string;
    importedAt?: string;
  } | null;
}

interface CAFEActions {
  // Modal control
  openModal: () => void;
  closeModal: () => void;

  // Import flow
  setCUFE: (cufe: string) => void;
  fetchInvoice: (cufe: string) => Promise<CAFEFetchResult>;
  clearInvoice: () => void;

  // Import to shopping
  importToShopping: (options?: {
    storeId?: string;
    storeName?: string;
    selectedItems?: number[]; // Line numbers to import (empty = all)
  }) => Promise<string | null>; // Returns session ID

  // Reset
  reset: () => void;

  // Error handling
  setError: (error: string, code?: string) => void;
  clearError: () => void;
}

type CAFEStore = CAFEState & CAFEActions;

const initialState: CAFEState = {
  status: 'pending',
  cufe: null,
  invoice: null,
  error: null,
  errorCode: null,
  importedInvoiceId: null,
  shoppingSessionId: null,
  matchedStore: null,
  isModalOpen: false,
  showPreview: false,
  previouslyImported: null,
};

export const useCAFEStore = create<CAFEStore>((set, get) => ({
  ...initialState,

  // Modal control
  openModal: () => {
    set({ isModalOpen: true });
  },

  closeModal: () => {
    set({ isModalOpen: false });
    // Reset state after a short delay to allow animation
    setTimeout(() => {
      get().reset();
    }, 300);
  },

  // Set CUFE (from input or scan)
  setCUFE: (cufe: string) => {
    set({ cufe: cufe.trim().toUpperCase() });
  },

  // Fetch invoice from DGI
  fetchInvoice: async (cufe: string) => {
    const cleanCUFE = cufe.trim().toUpperCase();

    set({
      status: 'fetching',
      cufe: cleanCUFE,
      error: null,
      errorCode: null,
      previouslyImported: null,
    });

    try {
      // First check if already imported
      const importCheck = await checkCUFEImported(cleanCUFE);

      if (importCheck.isImported) {
        set({
          status: 'pending',
          previouslyImported: importCheck,
        });

        toast.info('Esta factura ya fue importada anteriormente', {
          position: 'top-right',
        });

        return {
          success: false,
          error: 'Esta factura ya fue importada',
          errorCode: 'ALREADY_IMPORTED',
        };
      }

      // Fetch from DGI
      const result = await fetchCAFEInvoice(cleanCUFE);

      if (!result.success) {
        set({
          status: 'error',
          error: result.error || 'Error desconocido',
          errorCode: result.errorCode || 'UNKNOWN',
        });

        toast.error(result.error || 'Error al consultar la factura', {
          position: 'top-right',
        });

        return result;
      }

      // Set parsing status while we process
      set({ status: 'parsing' });

      // Try to match the emitter to a store
      let matchedStore = null;
      if (result.invoice?.emitter.ruc) {
        matchedStore = await findStoreByRUC(result.invoice.emitter.ruc);
      }

      // Success - show preview
      set({
        status: 'preview',
        invoice: result.invoice,
        showPreview: true,
        matchedStore,
      });

      toast.success('Factura encontrada', {
        position: 'top-right',
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      set({
        status: 'error',
        error: errorMessage,
        errorCode: 'UNKNOWN',
      });

      toast.error(errorMessage, {
        position: 'top-right',
      });

      return {
        success: false,
        error: errorMessage,
        errorCode: 'UNKNOWN',
      };
    }
  },

  // Clear current invoice
  clearInvoice: () => {
    set({
      invoice: null,
      showPreview: false,
      status: 'pending',
      matchedStore: null,
    });
  },

  // Import invoice to shopping session
  importToShopping: async (options = {}) => {
    const { invoice, matchedStore } = get();

    if (!invoice) {
      toast.error('No hay factura para importar', {
        position: 'top-right',
      });
      return null;
    }

    set({ status: 'importing' });

    try {
      // Determine store info
      const storeId = options.storeId || matchedStore?.storeId || undefined;
      const storeName = options.storeName || matchedStore?.storeName || invoice.emitter.name;

      // Create shopping session
      const session = await createShoppingSession({
        store_id: storeId,
        store_name: storeName,
        date: invoice.issueDate,
        mode: 'completed', // Imported invoices are completed purchases
        notes: `Importada desde CAFE: ${invoice.invoiceNumber}`,
      });

      // Filter items if specific ones were selected
      const itemsToImport =
        options.selectedItems && options.selectedItems.length > 0
          ? invoice.items.filter((item) => options.selectedItems!.includes(item.lineNumber))
          : invoice.items;

      // Add items to session
      for (const item of itemsToImport) {
        await addShoppingItem({
          session_id: session.id,
          product_name: item.description,
          price: item.unitPrice,
          quantity: item.quantity,
          unit: item.unit,
          store_id: storeId,
          store_name: storeName,
          taxRateCode: item.taxRateCode as TaxRateCode,
          taxRate: item.taxRate,
          priceIncludesTax: true, // DGI prices include tax
        });
      }

      // Save the imported invoice record
      const importedInvoice = await saveImportedInvoice(invoice, session.id);

      set({
        status: 'completed',
        importedInvoiceId: importedInvoice.id,
        shoppingSessionId: session.id,
      });

      toast.success(
        `Factura importada exitosamente con ${itemsToImport.length} productos`,
        {
          position: 'top-right',
        }
      );

      return session.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al importar';

      set({
        status: 'error',
        error: errorMessage,
        errorCode: 'IMPORT_ERROR',
      });

      toast.error(errorMessage, {
        position: 'top-right',
      });

      return null;
    }
  },

  // Reset store to initial state
  reset: () => {
    set(initialState);
  },

  // Set error
  setError: (error: string, code?: string) => {
    set({
      status: 'error',
      error,
      errorCode: code || 'UNKNOWN',
    });
  },

  // Clear error
  clearError: () => {
    set({
      error: null,
      errorCode: null,
      status: 'pending',
    });
  },
}));

// Selectors for common derived state
export const selectIsLoading = (state: CAFEStore) =>
  state.status === 'fetching' || state.status === 'parsing' || state.status === 'importing';

export const selectHasError = (state: CAFEStore) => state.status === 'error';

export const selectCanImport = (state: CAFEStore) =>
  state.status === 'preview' && state.invoice !== null;

export const selectImportComplete = (state: CAFEStore) =>
  state.status === 'completed' && state.shoppingSessionId !== null;
