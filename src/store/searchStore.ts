import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Tipos para productos
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  brand?: string;
  prices?: ProductPrice[];
}

export interface ProductPrice {
  storeId: string;
  storeName: string;
  price: number;
  currency: string;
  lastUpdated: string;
}

// Tipos para filtros de búsqueda
export interface SearchFilters {
  category?: string;
  store?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'price' | 'name' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// Historial de búsquedas
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

// Estado del store
interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Product[];
  isLoading: boolean;
  error: string | null;
  searchHistory: SearchHistoryItem[];
  totalResults: number;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  search: (query?: string) => Promise<void>;
  clearResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
}

type SearchStore = SearchState & SearchActions;

const DEFAULT_FILTERS: SearchFilters = {
  sortBy: 'relevance',
  sortOrder: 'asc',
};

const MAX_HISTORY_ITEMS = 10;

/**
 * Store de búsqueda con Zustand + Immer
 * Maneja las búsquedas de productos, filtros y resultados
 * Incluye historial de búsquedas persistido en localStorage
 */
export const useSearchStore = create<SearchStore>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      query: '',
      filters: DEFAULT_FILTERS,
      results: [],
      isLoading: false,
      error: null,
      searchHistory: [],
      totalResults: 0,

      /**
       * Establecer query de búsqueda
       */
      setQuery: (query) => {
        set((state) => {
          state.query = query;
        });
      },

      /**
       * Establecer o actualizar filtros
       */
      setFilters: (filters) => {
        set((state) => {
          state.filters = {
            ...state.filters,
            ...filters,
          };
        });
      },

      /**
       * Limpiar todos los filtros
       */
      clearFilters: () => {
        set((state) => {
          state.filters = DEFAULT_FILTERS;
        });
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
       * Realizar búsqueda de productos
       * TODO: Integrar con API real cuando esté disponible
       */
      search: async (queryParam) => {
        const { query: currentQuery, addToHistory } = get();
        const searchQuery = queryParam ?? currentQuery;

        if (!searchQuery.trim()) {
          set((state) => {
            state.results = [];
            state.totalResults = 0;
          });
          return;
        }

        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          // Agregar al historial
          addToHistory(searchQuery);

          // Simular llamada a API
          // TODO: Reemplazar con llamada real a /products?query=...
          const response = await mockSearchAPI(searchQuery, get().filters);

          set((state) => {
            state.results = response.products;
            state.totalResults = response.total;
            state.query = searchQuery;
            state.isLoading = false;
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al buscar productos';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
            state.results = [];
            state.totalResults = 0;
          });
          throw error;
        }
      },

      /**
       * Limpiar resultados de búsqueda
       */
      clearResults: () => {
        set((state) => {
          state.results = [];
          state.totalResults = 0;
          state.query = '';
          state.error = null;
        });
      },

      /**
       * Agregar búsqueda al historial
       */
      addToHistory: (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        set((state) => {
          // Remover duplicados
          const filteredHistory = state.searchHistory.filter(
            (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
          );

          // Agregar al inicio
          state.searchHistory = [
            { query: trimmedQuery, timestamp: Date.now() },
            ...filteredHistory,
          ].slice(0, MAX_HISTORY_ITEMS); // Limitar cantidad
        });
      },

      /**
       * Limpiar todo el historial
       */
      clearHistory: () => {
        set((state) => {
          state.searchHistory = [];
        });
      },

      /**
       * Remover un item del historial
       */
      removeFromHistory: (query) => {
        set((state) => {
          state.searchHistory = state.searchHistory.filter(
            (item) => item.query !== query
          );
        });
      },
    })),
    {
      name: 'prexiopa-search-storage',
      partialize: (state) => ({
        // Solo persistir historial y última query
        searchHistory: state.searchHistory,
        query: state.query,
        filters: state.filters,
      }),
    }
  )
);

/**
 * Mock de API de búsqueda
 * TODO: Reemplazar con integración real
 */
async function mockSearchAPI(
  query: string,
  _filters: SearchFilters
): Promise<{ products: Product[]; total: number }> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Arroz Premium',
      description: 'Arroz de grano largo',
      category: 'Alimentos',
      brand: 'Don Pancho',
      prices: [
        {
          storeId: '1',
          storeName: 'Super 99',
          price: 3.99,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        },
        {
          storeId: '2',
          storeName: 'El Machetazo',
          price: 3.75,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        },
      ],
    },
    // Más productos mock...
  ];

  // Filtrar por query (simulado)
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return {
    products: filteredProducts,
    total: filteredProducts.length,
  };
}
