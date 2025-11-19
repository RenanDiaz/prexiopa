/**
 * useStores Hook
 * Custom hooks para consultas de tiendas usando React Query
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getStores,
  getStoreById,
  getStoreProducts,
  type Store,
} from '@/services/supabase/stores';

/**
 * Hook para obtener todas las tiendas
 */
export const useStoresQuery = (): UseQueryResult<Store[], Error> => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
    staleTime: 30 * 60 * 1000, // 30 minutos - las tiendas cambian poco
  });
};

/**
 * Hook para obtener una tienda por ID
 */
export const useStoreQuery = (
  storeId: string | undefined
): UseQueryResult<Store | null, Error> => {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => (storeId ? getStoreById(storeId) : Promise.resolve(null)),
    enabled: !!storeId,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

/**
 * Hook para obtener productos de una tienda
 */
export const useStoreProductsQuery = (
  storeId: string | undefined
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: ['store-products', storeId],
    queryFn: () => (storeId ? getStoreProducts(storeId) : Promise.resolve([])),
    enabled: !!storeId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};
