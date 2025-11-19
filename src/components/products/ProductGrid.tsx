/**
 * ProductGrid Component
 *
 * Responsive grid layout for displaying multiple product cards.
 * Handles loading states, empty states, and responsive breakpoints.
 *
 * Features:
 * - Responsive grid (1-4 columns based on screen size)
 * - Loading state with skeletons
 * - Empty state with custom message
 * - Consistent gaps from theme
 * - Performance optimized
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProductGrid
 *   products={products}
 *   bestPrices={priceMap}
 *   loading={isLoading}
 * />
 *
 * // With favorites
 * <ProductGrid
 *   products={products}
 *   bestPrices={priceMap}
 *   favorites={favoriteIds}
 *   onFavoriteToggle={handleToggle}
 * />
 *
 * // Custom empty state
 * <ProductGrid
 *   products={[]}
 *   emptyMessage="No encontramos productos con ese nombre"
 *   emptyAction="Buscar otros productos"
 *   onEmptyAction={() => navigate('/search')}
 * />
 * ```
 */

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import type { Product } from '@/types/product.types';
import type { StorePriceComparison } from '@/types/price.types';
// import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import * as S from './ProductGrid.styles';

export interface ProductGridProps {
  /**
   * Array of products to display
   */
  products: Product[];

  /**
   * Map of product IDs to their best prices
   */
  bestPrices?: Record<string, StorePriceComparison>;

  /**
   * Set of favorited product IDs
   */
  favorites?: Set<string>;

  /**
   * Callback when favorite is toggled
   */
  onFavoriteToggle?: (productId: string) => void;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Number of skeleton cards to show while loading
   */
  skeletonCount?: number;

  /**
   * Message to show when no products
   */
  emptyMessage?: string;

  /**
   * Title for empty state
   */
  emptyTitle?: string;

  /**
   * Action button label for empty state
   */
  emptyAction?: string;

  /**
   * Callback for empty state action
   */
  onEmptyAction?: () => void;

  /**
   * Card variant to use
   */
  variant?: 'default' | 'compact';

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * ProductGrid - Responsive grid for product cards
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  bestPrices = {},
  favorites = new Set(),
  onFavoriteToggle,
  loading = false,
  skeletonCount = 8,
  emptyMessage = 'No se encontraron productos',
  emptyTitle = 'No hay productos disponibles',
  emptyAction,
  onEmptyAction,
  variant = 'default',
  className,
  testId = 'product-grid',
}) => {
  // Loading State
  if (loading) {
    return (
      <S.GridContainer className={className} data-testid={`${testId}-loading`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} variant={variant} />
        ))}
      </S.GridContainer>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <S.EmptyContainer data-testid={`${testId}-empty`}>
        <EmptyState
          icon={FiSearch}
          title={emptyTitle}
          message={emptyMessage}
          actionLabel={emptyAction}
          onAction={onEmptyAction}
        />
      </S.EmptyContainer>
    );
  }

  // Grid with Products
  return (
    <S.GridContainer className={className} data-testid={testId}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          bestPrice={bestPrices[product.id]}
          isFavorite={favorites.has(product.id)}
          onFavoriteToggle={onFavoriteToggle}
          variant={variant}
        />
      ))}
    </S.GridContainer>
  );
};

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
