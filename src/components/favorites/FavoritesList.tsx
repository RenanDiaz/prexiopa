/**
 * FavoritesList Component
 *
 * Displays a grid of favorite products with:
 * - Grid of favorite products using ProductCard
 * - Empty state with heart icon and message
 * - "Limpiar todos" button at top
 * - Loading state with skeletons
 * - Responsive grid (same as ProductList)
 *
 * @example
 * ```tsx
 * <FavoritesList />
 * ```
 */

import React from 'react';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useFavoritesQuery, useClearAllFavoritesMutation } from '@/hooks/useFavorites';
import { ProductCard, ProductCardSkeleton } from '@/components/products/ProductCard';
import type { ProductWithLowestPrice } from '@/types/product';
import {
  FavoritesContainer,
  FavoritesHeader,
  FavoritesTitle,
  FavoritesCount,
  ClearAllButton,
  FavoritesGrid,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateMessage,
  ErrorContainer,
  ErrorMessage,
} from './FavoritesList.styles';

export interface FavoritesListProps {
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
  /** Callback when a product card is clicked */
  onProductClick?: (product: ProductWithLowestPrice) => void;
}

/**
 * FavoritesList component for displaying user's favorite products
 *
 * Features:
 * - Grid of favorite products using ProductCard
 * - Empty state with FiHeart icon and helpful message
 * - "Limpiar todos" button at top with confirmation
 * - Loading state with ProductCardSkeleton
 * - Error state with retry option
 * - Responsive grid (same layout as ProductList)
 * - Real-time updates via React Query
 *
 * @component
 */
export const FavoritesList: React.FC<FavoritesListProps> = ({
  className,
  testId = 'favorites-list',
  onProductClick,
}) => {
  const { data: favorites = [], isLoading, isError, error } = useFavoritesQuery();
  const { mutate: clearAll, isPending: isClearing } = useClearAllFavoritesMutation();

  /**
   * Handle clear all favorites
   */
  const handleClearAll = () => {
    if (favorites.length === 0) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar todos los ${favorites.length} favoritos?`;
    if (window.confirm(confirmMessage)) {
      clearAll();
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <FavoritesContainer className={className} data-testid={testId}>
        <FavoritesHeader>
          <FavoritesTitle>
            <FiHeart aria-hidden="true" />
            Mis Favoritos
          </FavoritesTitle>
        </FavoritesHeader>

        <FavoritesGrid>
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </FavoritesGrid>
      </FavoritesContainer>
    );
  }

  /**
   * Render error state
   */
  if (isError) {
    return (
      <FavoritesContainer className={className} data-testid={testId}>
        <FavoritesHeader>
          <FavoritesTitle>
            <FiHeart aria-hidden="true" />
            Mis Favoritos
          </FavoritesTitle>
        </FavoritesHeader>

        <ErrorContainer>
          <ErrorMessage>
            Error al cargar favoritos: {error?.message || 'Error desconocido'}
          </ErrorMessage>
        </ErrorContainer>
      </FavoritesContainer>
    );
  }

  /**
   * Render empty state
   */
  if (favorites.length === 0) {
    return (
      <FavoritesContainer className={className} data-testid={testId}>
        <FavoritesHeader>
          <FavoritesTitle>
            <FiHeart aria-hidden="true" />
            Mis Favoritos
          </FavoritesTitle>
        </FavoritesHeader>

        <EmptyStateContainer>
          <EmptyStateIcon aria-hidden="true">
            <FiHeart />
          </EmptyStateIcon>
          <EmptyStateTitle>No tienes favoritos guardados</EmptyStateTitle>
          <EmptyStateMessage>
            Empieza a explorar productos y haz clic en el corazón para guardar tus favoritos.
            Así podrás comparar precios y seguir las ofertas de tus productos preferidos.
          </EmptyStateMessage>
        </EmptyStateContainer>
      </FavoritesContainer>
    );
  }

  /**
   * Render favorites grid
   */
  return (
    <FavoritesContainer className={className} data-testid={testId}>
      <FavoritesHeader>
        <FavoritesTitle>
          <FiHeart aria-hidden="true" />
          Mis Favoritos
          <FavoritesCount aria-label={`${favorites.length} favoritos`}>
            {favorites.length}
          </FavoritesCount>
        </FavoritesTitle>

        <ClearAllButton
          type="button"
          onClick={handleClearAll}
          disabled={isClearing}
          aria-label="Limpiar todos los favoritos"
          title="Limpiar todos los favoritos"
        >
          <FiTrash2 aria-hidden="true" />
          {isClearing ? 'Limpiando...' : 'Limpiar todos'}
        </ClearAllButton>
      </FavoritesHeader>

      <FavoritesGrid>
        {favorites.map((favorite) => {
          // Convert Favorite to ProductWithLowestPrice format
          // Cast the product as any to access the lowest_price and store_with_lowest_price
          // that come from the Supabase query join
          const productData = favorite.product as any;

          const product: ProductWithLowestPrice = {
            id: productData?.id || '',
            name: productData?.name || 'Producto sin nombre',
            description: productData?.description,
            image: productData?.image || '',
            category: productData?.category || '',
            brand: productData?.brand,
            barcode: productData?.barcode,
            created_at: productData?.created_at,
            updated_at: productData?.updated_at,
            lowest_price: productData?.lowest_price,
            store_with_lowest_price: productData?.store_with_lowest_price,
          };

          return (
            <ProductCard
              key={favorite.id}
              product={product}
              onClick={onProductClick}
              testId={`favorite-product-${product.id}`}
            />
          );
        })}
      </FavoritesGrid>
    </FavoritesContainer>
  );
};

FavoritesList.displayName = 'FavoritesList';

export default FavoritesList;
