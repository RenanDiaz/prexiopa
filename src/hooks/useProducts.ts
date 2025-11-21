/**
 * useProducts Hook
 * Custom hooks para consultas de productos usando React Query
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getProducts,
  getProductById,
  getProductByBarcode,
  getProductPrices,
  searchProducts,
  getCategories,
  type ProductFilters,
  type ProductPrice,
} from '@/services/supabase/products';
import type { Product } from '@/types/product.types';

/**
 * Hook para obtener lista de productos con filtros
 */
export const useProductsQuery = (
  filters: ProductFilters = {}
): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un producto por ID
 */
export const useProductQuery = (
  productId: string | undefined
): UseQueryResult<Product | null, Error> => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => (productId ? getProductById(productId) : Promise.resolve(null)),
    enabled: !!productId, // Solo ejecutar si hay un ID
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener un producto por código de barras
 */
export const useProductByBarcodeQuery = (
  barcode: string | undefined
): UseQueryResult<Product | null, Error> => {
  return useQuery({
    queryKey: ['product-by-barcode', barcode],
    queryFn: () => (barcode ? getProductByBarcode(barcode) : Promise.resolve(null)),
    enabled: !!barcode && barcode.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener historial de precios de un producto
 */
export const useProductPricesQuery = (
  productId: string | undefined
): UseQueryResult<ProductPrice[], Error> => {
  return useQuery({
    queryKey: ['product-prices', productId],
    queryFn: () => (productId ? getProductPrices(productId) : Promise.resolve([])),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para búsqueda de productos (autocompletado)
 */
export const useProductSearchQuery = (
  query: string,
  options: { enabled?: boolean; limit?: number } = {}
): UseQueryResult<Product[], Error> => {
  const { enabled = true, limit = 10 } = options;

  return useQuery({
    queryKey: ['product-search', query, limit],
    queryFn: () => searchProducts(query, limit),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener categorías de productos
 */
export const useCategoriesQuery = (): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutos - las categorías cambian poco
  });
};
