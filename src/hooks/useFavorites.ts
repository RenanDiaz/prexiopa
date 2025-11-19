/**
 * useFavorites Hook
 * Custom hooks para favoritos usando React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getFavoriteProductIds,
  clearAllFavorites,
  type Favorite,
} from '@/services/supabase/favorites';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook para obtener favoritos del usuario actual
 */
export const useFavoritesQuery = (): UseQueryResult<Favorite[], Error> => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => (user?.id ? getFavorites(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener solo los IDs de favoritos
 */
export const useFavoriteIdsQuery = (): UseQueryResult<string[], Error> => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['favorite-ids', user?.id],
    queryFn: () => (user?.id ? getFavoriteProductIds(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para agregar un producto a favoritos
 */
export const useAddFavoriteMutation = (): UseMutationResult<
  Favorite,
  Error,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (productId: string) => {
      if (!user?.id) {
        return Promise.reject(new Error('Usuario no autenticado'));
      }
      return addFavorite(user.id, productId);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-ids', user?.id] });
    },
    onError: (error) => {
      console.error('[useFavorites] Error adding favorite:', error);
    },
  });
};

/**
 * Hook para remover un producto de favoritos
 */
export const useRemoveFavoriteMutation = (): UseMutationResult<
  void,
  Error,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (productId: string) => {
      if (!user?.id) {
        return Promise.reject(new Error('Usuario no autenticado'));
      }
      return removeFavorite(user.id, productId);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-ids', user?.id] });
    },
    onError: (error) => {
      console.error('[useFavorites] Error removing favorite:', error);
    },
  });
};

/**
 * Hook para toggle de favorito (agregar/remover según estado actual)
 */
export const useToggleFavoriteMutation = () => {
  const addMutation = useAddFavoriteMutation();
  const removeMutation = useRemoveFavoriteMutation();
  const { data: favoriteIds = [] } = useFavoriteIdsQuery();

  const toggleFavorite = async (productId: string) => {
    const isFavorite = favoriteIds.includes(productId);

    if (isFavorite) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  };

  return {
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
  };
};

/**
 * Hook para limpiar todos los favoritos
 */
export const useClearAllFavoritesMutation = (): UseMutationResult<
  void,
  Error,
  void,
  unknown
> => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: () => {
      if (!user?.id) {
        return Promise.reject(new Error('Usuario no autenticado'));
      }
      return clearAllFavorites(user.id);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-ids', user?.id] });
    },
    onError: (error) => {
      console.error('[useFavorites] Error clearing favorites:', error);
    },
  });
};

/**
 * Hook helper para verificar si un producto es favorito
 */
export const useIsFavorite = (productId: string): boolean => {
  const { data: favoriteIds = [] } = useFavoriteIdsQuery();
  return favoriteIds.includes(productId);
};
