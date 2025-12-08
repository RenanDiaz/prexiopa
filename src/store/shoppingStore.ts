/**
 * Shopping Store
 * Estado global para sesiones de compra y listas de compras
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'react-toastify';
import type { TaxRateCode, TaxBreakdown } from '@/types/tax';
import {
  DEFAULT_TAX_RATE_CODE,
  DEFAULT_TAX_RATE,
  calculateBasePrice,
  calculateTaxAmount,
  calculateSessionTaxSummary,
  getTaxRateByCode,
} from '@/types/tax';

export interface ShoppingItem {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
  notes?: string;
  // Tax fields (ITBMS)
  taxRateCode: TaxRateCode;
  taxRate: number;
  priceIncludesTax: boolean;
  basePrice: number;
  taxAmount: number;
}

export interface ShoppingSession {
  id: string;
  storeId: string | null;
  storeName?: string;
  date: string;
  total: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  items: ShoppingItem[];
  // Tax summary fields
  subtotalBeforeTax: number;
  totalTax: number;
  taxBreakdown: TaxBreakdown;
}

interface ShoppingState {
  currentSession: ShoppingSession | null;
  recentSessions: ShoppingSession[];
  isLoading: boolean;
  error: string | null;
}

// Input type for adding items (without calculated fields)
export interface AddItemInput {
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  notes?: string;
  // Tax fields
  taxRateCode?: TaxRateCode;
  taxRate?: number;
  priceIncludesTax?: boolean;
}

interface ShoppingActions {
  // Session management
  startSession: (storeId?: string | null, storeName?: string) => void;
  endSession: () => void;
  cancelSession: () => void;
  updateSessionStore: (storeId: string, storeName: string) => void;
  updateSessionNotes: (notes: string) => void;

  // Item management
  addItem: (item: AddItemInput) => void;
  updateItem: (itemId: string, updates: Partial<AddItemInput>) => void;
  removeItem: (itemId: string) => void;
  clearItems: () => void;

  // Quantity management
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Session history
  addToHistory: (session: ShoppingSession) => void;
  clearHistory: () => void;
}

type ShoppingStore = ShoppingState & ShoppingActions;

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const calculateSubtotal = (price: number, quantity: number): number => {
  return Number((price * quantity).toFixed(2));
};

const calculateSessionTotal = (items: ShoppingItem[]): number => {
  return Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
};

/**
 * Recalculate all tax-related totals for a session
 */
const recalculateSessionTaxTotals = (session: ShoppingSession): void => {
  const summary = calculateSessionTaxSummary(session.items);
  session.subtotalBeforeTax = summary.subtotalBeforeTax;
  session.totalTax = summary.totalTax;
  session.taxBreakdown = summary.breakdown;
  session.total = summary.grandTotal;
};

/**
 * Create a new shopping item with tax calculations
 */
const createShoppingItem = (itemData: AddItemInput): ShoppingItem => {
  const taxRateCode = itemData.taxRateCode || DEFAULT_TAX_RATE_CODE;
  const taxRate = itemData.taxRate ?? getTaxRateByCode(taxRateCode)?.rate ?? DEFAULT_TAX_RATE;
  const priceIncludesTax = itemData.priceIncludesTax ?? true;

  const basePrice = calculateBasePrice(itemData.price, taxRate, priceIncludesTax);
  const taxAmount = calculateTaxAmount(basePrice, taxRate, itemData.quantity);
  const subtotal = calculateSubtotal(itemData.price, itemData.quantity);

  return {
    id: `item_${generateId()}`,
    productId: itemData.productId,
    productName: itemData.productName,
    price: itemData.price,
    quantity: itemData.quantity,
    unit: itemData.unit,
    subtotal,
    notes: itemData.notes,
    taxRateCode,
    taxRate,
    priceIncludesTax,
    basePrice,
    taxAmount,
  };
};

/**
 * Shopping Store con Zustand + Immer
 * Maneja sesiones de compra activas y historial
 */
export const useShoppingStore = create<ShoppingStore>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      currentSession: null,
      recentSessions: [],
      isLoading: false,
      error: null,

      /**
       * Iniciar nueva sesión de compra
       */
      startSession: (storeId, storeName) => {
        set((state) => {
          state.currentSession = {
            id: `session_${generateId()}`,
            storeId: storeId || null,
            storeName,
            date: new Date().toISOString(),
            total: 0,
            status: 'in_progress',
            items: [],
            // Tax fields initialized
            subtotalBeforeTax: 0,
            totalTax: 0,
            taxBreakdown: {},
          };
          state.error = null;
        });
      },

      /**
       * Finalizar sesión actual
       */
      endSession: () => {
        set((state) => {
          if (state.currentSession) {
            const completedSession: ShoppingSession = {
              ...state.currentSession,
              status: 'completed',
            };

            // Agregar a historial
            state.recentSessions = [
              completedSession,
              ...state.recentSessions.slice(0, 9), // Keep last 10
            ];

            state.currentSession = null;
          }
        });

        toast.success('Sesión de compra finalizada', {
          position: 'top-right',
        });
      },

      /**
       * Cancelar sesión actual
       */
      cancelSession: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.status = 'cancelled';
            state.currentSession = null;
          }
        });
      },

      /**
       * Actualizar tienda de la sesión
       */
      updateSessionStore: (storeId, storeName) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.storeId = storeId;
            state.currentSession.storeName = storeName;
          }
        });
      },

      /**
       * Actualizar notas de la sesión
       */
      updateSessionNotes: (notes) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.notes = notes;
          }
        });
      },

      /**
       * Agregar item a la sesión actual
       */
      addItem: (itemData) => {
        set((state) => {
          if (!state.currentSession) {
            // Auto-start session if not started
            state.currentSession = {
              id: `session_${generateId()}`,
              storeId: null,
              date: new Date().toISOString(),
              total: 0,
              status: 'in_progress',
              items: [],
              subtotalBeforeTax: 0,
              totalTax: 0,
              taxBreakdown: {},
            };
          }

          // Create item with tax calculations
          const newItem = createShoppingItem(itemData);

          state.currentSession.items.push(newItem);

          // Recalculate session totals including tax
          recalculateSessionTaxTotals(state.currentSession);
        });

        toast.success(`${itemData.productName} agregado a la lista`, {
          position: 'top-right',
        });
      },

      /**
       * Actualizar item existente
       */
      updateItem: (itemId, updates) => {
        set((state) => {
          if (state.currentSession) {
            const itemIndex = state.currentSession.items.findIndex((i) => i.id === itemId);
            if (itemIndex !== -1) {
              const item = state.currentSession.items[itemIndex];

              // Merge updates
              const updatedPrice = updates.price ?? item.price;
              const updatedQuantity = updates.quantity ?? item.quantity;
              const updatedTaxRateCode = updates.taxRateCode ?? item.taxRateCode;
              const updatedTaxRate = updates.taxRate ?? item.taxRate;
              const updatedPriceIncludesTax = updates.priceIncludesTax ?? item.priceIncludesTax;

              // Recalculate tax-related fields
              const basePrice = calculateBasePrice(updatedPrice, updatedTaxRate, updatedPriceIncludesTax);
              const taxAmount = calculateTaxAmount(basePrice, updatedTaxRate, updatedQuantity);
              const subtotal = calculateSubtotal(updatedPrice, updatedQuantity);

              // Update item
              state.currentSession.items[itemIndex] = {
                ...item,
                ...updates,
                price: updatedPrice,
                quantity: updatedQuantity,
                taxRateCode: updatedTaxRateCode,
                taxRate: updatedTaxRate,
                priceIncludesTax: updatedPriceIncludesTax,
                basePrice,
                taxAmount,
                subtotal,
              };

              // Recalculate session totals
              recalculateSessionTaxTotals(state.currentSession);
            }
          }
        });
      },

      /**
       * Remover item de la sesión
       */
      removeItem: (itemId) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.items = state.currentSession.items.filter(
              (item) => item.id !== itemId
            );
            // Recalculate session totals including tax
            recalculateSessionTaxTotals(state.currentSession);
          }
        });
      },

      /**
       * Limpiar todos los items
       */
      clearItems: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.items = [];
            state.currentSession.total = 0;
            state.currentSession.subtotalBeforeTax = 0;
            state.currentSession.totalTax = 0;
            state.currentSession.taxBreakdown = {};
          }
        });
      },

      /**
       * Incrementar cantidad de un item
       */
      incrementQuantity: (itemId) => {
        const { updateItem, currentSession } = get();
        if (currentSession) {
          const item = currentSession.items.find((i) => i.id === itemId);
          if (item) {
            updateItem(itemId, { quantity: item.quantity + 1 });
          }
        }
      },

      /**
       * Decrementar cantidad de un item
       */
      decrementQuantity: (itemId) => {
        const { updateItem, removeItem, currentSession } = get();
        if (currentSession) {
          const item = currentSession.items.find((i) => i.id === itemId);
          if (item) {
            if (item.quantity > 1) {
              updateItem(itemId, { quantity: item.quantity - 1 });
            } else {
              removeItem(itemId);
            }
          }
        }
      },

      /**
       * Establecer estado de carga
       */
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      /**
       * Establecer error
       */
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },

      /**
       * Limpiar error
       */
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      /**
       * Agregar sesión al historial
       */
      addToHistory: (session) => {
        set((state) => {
          state.recentSessions = [session, ...state.recentSessions.slice(0, 9)];
        });
      },

      /**
       * Limpiar historial
       */
      clearHistory: () => {
        set((state) => {
          state.recentSessions = [];
        });
      },
    })),
    {
      name: 'prexiopa-shopping-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        recentSessions: state.recentSessions,
      }),
    }
  )
);
