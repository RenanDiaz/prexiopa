import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';

// Tipos para el store de favoritos
interface FavoritesState {
  favorites: string[]; // Array de product IDs
  isLoading: boolean;
  error: string | null;
  lastSync: number | null; // Timestamp de última sincronización
}

interface FavoritesActions {
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  loadFavorites: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type FavoritesStore = FavoritesState & FavoritesActions;

/**
 * Store de favoritos con Zustand
 * Maneja los productos favoritos del usuario con persistencia local
 * y sincronización opcional con Supabase cuando está autenticado
 */
export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      favorites: [],
      isLoading: false,
      error: null,
      lastSync: null,

      // Establecer estado de carga
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Establecer error
      setError: (error) => {
        set({ error });
      },

      /**
       * Verificar si un producto está en favoritos
       */
      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      },

      /**
       * Agregar producto a favoritos
       */
      addFavorite: async (productId) => {
        const { favorites, syncWithSupabase } = get();

        // Evitar duplicados
        if (favorites.includes(productId)) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          // Actualizar estado local
          const newFavorites = [...favorites, productId];
          set({ favorites: newFavorites });

          // Intentar sincronizar con Supabase si hay usuario autenticado
          await syncWithSupabase();

          set({ isLoading: false });

          toast.success('Producto agregado a favoritos', {
            position: 'top-right',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al agregar favorito';
          set({
            error: errorMessage,
            isLoading: false,
          });

          toast.error(errorMessage, {
            position: 'top-right',
          });

          // Revertir cambio local si falla
          set({ favorites });
          throw error;
        }
      },

      /**
       * Remover producto de favoritos
       */
      removeFavorite: async (productId) => {
        const { favorites, syncWithSupabase } = get();

        try {
          set({ isLoading: true, error: null });

          // Actualizar estado local
          const newFavorites = favorites.filter((id) => id !== productId);
          set({ favorites: newFavorites });

          // Intentar sincronizar con Supabase si hay usuario autenticado
          await syncWithSupabase();

          set({ isLoading: false });

          toast.info('Producto removido de favoritos', {
            position: 'top-right',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al remover favorito';
          set({
            error: errorMessage,
            isLoading: false,
          });

          toast.error(errorMessage, {
            position: 'top-right',
          });

          // Revertir cambio local si falla
          set({ favorites });
          throw error;
        }
      },

      /**
       * Toggle: agregar o remover favorito
       */
      toggleFavorite: async (productId) => {
        const { isFavorite, addFavorite, removeFavorite } = get();

        if (isFavorite(productId)) {
          await removeFavorite(productId);
        } else {
          await addFavorite(productId);
        }
      },

      /**
       * Limpiar todos los favoritos
       */
      clearFavorites: () => {
        set({
          favorites: [],
          error: null,
        });
      },

      /**
       * Cargar favoritos desde Supabase
       */
      loadFavorites: async () => {
        try {
          set({ isLoading: true, error: null });

          // Verificar si hay usuario autenticado
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set({ isLoading: false });
            return;
          }

          // Cargar favoritos desde Supabase
          // Asumiendo tabla 'favorites' con columnas: user_id, product_id
          const { data, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', session.user.id);

          if (error) throw error;

          const productIds = data?.map((item) => item.product_id) || [];

          set({
            favorites: productIds,
            isLoading: false,
            lastSync: Date.now(),
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar favoritos';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      /**
       * Sincronizar favoritos locales con Supabase
       */
      syncWithSupabase: async () => {
        try {
          // Verificar si hay usuario autenticado
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            // No hay sesión, no sincronizar
            return;
          }

          const { favorites } = get();

          // Eliminar todos los favoritos actuales del usuario
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', session.user.id);

          // Insertar favoritos actuales
          if (favorites.length > 0) {
            const favoritesData = favorites.map((productId) => ({
              user_id: session.user.id,
              product_id: productId,
            }));

            const { error } = await supabase
              .from('favorites')
              .insert(favoritesData);

            if (error) throw error;
          }

          set({ lastSync: Date.now(), error: null });
        } catch (error) {
          // Sincronización silenciosa - no lanzar error
          console.error('Error al sincronizar favoritos:', error);
        }
      },
    }),
    {
      name: 'prexiopa-favorites-storage', // Nombre único para localStorage
      partialize: (state) => ({
        // Persistir favoritos y timestamp
        favorites: state.favorites,
        lastSync: state.lastSync,
      }),
    }
  )
);
