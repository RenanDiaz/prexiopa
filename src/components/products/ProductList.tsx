/**
 * ProductList Component
 *
 * Displays a responsive grid of product cards with loading and empty states.
 * Handles different screen sizes: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop).
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProductList products={products} />
 *
 * // With loading state
 * <ProductList products={[]} isLoading={true} />
 *
 * // With empty state
 * <ProductList products={[]} emptyMessage="No se encontraron productos" />
 *
 * // With custom empty action
 * <ProductList
 *   products={[]}
 *   emptyMessage="No hay productos favoritos"
 *   emptyActionLabel="Explorar Productos"
 *   onEmptyAction={() => navigate('/productos')}
 * />
 * ```
 */

import React from 'react';
import { FiPackage } from 'react-icons/fi';
import type { Product } from '@/types/product.types';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductCard } from './ProductCard';
import {
  ListContainer,
  ProductGrid,
} from './ProductList.styles';

export interface ProductListProps {
  /** Array of products to display */
  products: Product[];
  /** Loading state flag */
  isLoading?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom empty state title */
  emptyTitle?: string;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Empty state action button label */
  emptyActionLabel?: string;
  /** Empty state action callback */
  onEmptyAction?: () => void;
  /** Callback when a product card is clicked */
  onProductClick?: (product: Product) => void;
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * ProductList component for displaying a grid of products
 *
 * Features:
 * - Responsive grid layout
 *   - Mobile: 1 column
 *   - Tablet: 2 columns
 *   - Desktop: 3-4 columns
 * - Loading state with spinner
 * - Empty state with icon and message
 * - Handles product click events
 * - Theme-integrated styling
 *
 * Grid Breakpoints:
 * - Mobile: < 768px (1 col)
 * - Tablet: 768px - 1024px (2 cols)
 * - Desktop: 1024px - 1440px (3 cols)
 * - Large Desktop: > 1440px (4 cols)
 *
 * @component
 */
export const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading = false,
  loadingMessage = 'Cargando productos...',
  emptyTitle = 'No se encontraron productos',
  emptyMessage = 'Intenta con otros términos de búsqueda o filtros',
  emptyActionLabel,
  onEmptyAction,
  onProductClick,
  className,
  testId = 'product-list',
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <ListContainer className={className} data-testid={`${testId}-loading`}>
        <LoadingState
          message={loadingMessage}
          size="lg"
          color="primary"
        />
      </ListContainer>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <ListContainer className={className} data-testid={`${testId}-empty`}>
        <EmptyState
          icon={FiPackage}
          title={emptyTitle}
          message={emptyMessage}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </ListContainer>
    );
  }

  // Show product grid
  return (
    <ListContainer className={className} data-testid={testId}>
      <ProductGrid>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
            testId={`product-card-${product.id}`}
          />
        ))}
      </ProductGrid>
    </ListContainer>
  );
};

ProductList.displayName = 'ProductList';

export default ProductList;
