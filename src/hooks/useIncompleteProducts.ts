/**
 * useIncompleteProducts - Hook for incomplete products data
 * Fetches products with missing information for admin moderation
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type {
  IncompleteProduct,
  IncompleteProductsFilters,
  CompletenessStats,
} from '@/types/incomplete-product';

/**
 * Fetch incomplete products from Supabase
 */
const fetchIncompleteProducts = async (
  filters: IncompleteProductsFilters = {}
): Promise<IncompleteProduct[]> => {
  const {
    minCompleteness = 0,
    maxCompleteness = 99,
    categoryId = null,
    limit = 50,
    offset = 0,
  } = filters;

  const { data, error } = await supabase.rpc('get_incomplete_products', {
    p_min_completeness: minCompleteness,
    p_max_completeness: maxCompleteness,
    p_category_id: categoryId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching incomplete products:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch total count of incomplete products
 */
const fetchIncompleteProductsCount = async (
  filters: Omit<IncompleteProductsFilters, 'limit' | 'offset'> = {}
): Promise<number> => {
  const { minCompleteness = 0, maxCompleteness = 99, categoryId = null } = filters;

  const { data, error } = await supabase.rpc('get_incomplete_products_count', {
    p_min_completeness: minCompleteness,
    p_max_completeness: maxCompleteness,
    p_category_id: categoryId,
  });

  if (error) {
    console.error('Error fetching incomplete products count:', error);
    throw error;
  }

  return data || 0;
};

/**
 * Fetch completeness statistics
 */
const fetchCompletenessStats = async (): Promise<CompletenessStats> => {
  const { data, error } = await supabase.rpc('get_completeness_stats');

  if (error) {
    console.error('Error fetching completeness stats:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    // Return default stats if no data
    return {
      total_products: 0,
      complete_products: 0,
      incomplete_products: 0,
      missing_barcode: 0,
      missing_image: 0,
      missing_brand: 0,
      missing_description: 0,
      missing_category: 0,
      missing_recent_price: 0,
      avg_completeness: 0,
    };
  }

  return data[0];
};

/**
 * Hook to query incomplete products
 */
export const useIncompleteProductsQuery = (filters: IncompleteProductsFilters = {}) => {
  return useQuery({
    queryKey: ['incomplete-products', filters],
    queryFn: () => fetchIncompleteProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Hook to query incomplete products count
 */
export const useIncompleteProductsCountQuery = (
  filters: Omit<IncompleteProductsFilters, 'limit' | 'offset'> = {}
) => {
  return useQuery({
    queryKey: ['incomplete-products-count', filters],
    queryFn: () => fetchIncompleteProductsCount(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to query completeness statistics
 */
export const useCompletenessStatsQuery = () => {
  return useQuery({
    queryKey: ['completeness-stats'],
    queryFn: fetchCompletenessStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to get all incomplete products data
 * Combines products, count, and stats in one hook
 */
export const useIncompleteProductsData = (filters: IncompleteProductsFilters = {}) => {
  const productsQuery = useIncompleteProductsQuery(filters);
  const countQuery = useIncompleteProductsCountQuery({
    minCompleteness: filters.minCompleteness,
    maxCompleteness: filters.maxCompleteness,
    categoryId: filters.categoryId,
  });
  const statsQuery = useCompletenessStatsQuery();

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    productsError: productsQuery.error,
    totalCount: countQuery.data || 0,
    isLoadingCount: countQuery.isLoading,
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    isLoading: productsQuery.isLoading || countQuery.isLoading || statsQuery.isLoading,
    refetch: () => {
      productsQuery.refetch();
      countQuery.refetch();
      statsQuery.refetch();
    },
  };
};
