/**
 * ProductCard Component
 *
 * Displays a product card with image, category, name, brand, and lowest price.
 * Includes favorite functionality with heart button in top-right corner.
 *
 * @example
 * ```tsx
 * <ProductCard product={product} />
 * <ProductCardSkeleton />
 * ```
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import type { ProductWithLowestPrice } from '@/types/product';
import { useIsFavorite, useToggleFavoriteMutation } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import { useActiveSessionQuery, useAddItemMutation } from '@/hooks/useShoppingLists';
import { showWarningNotification } from '@/store/uiStore';
import {
  CardContainer,
  CardImageWrapper,
  CardImage,
  CategoryBadge,
  FavoriteButton,
  CardContent,
  ProductName,
  BrandName,
  PriceSection,
  PriceLabel,
  PriceAmount,
  StoreName,
  AddToCartButton,
  SkeletonCard,
  SkeletonImage,
  SkeletonContent,
  SkeletonText,
} from './ProductCard.phase3.styles';

export interface ProductCardProps {
  /** Product data including prices and store information */
  product: ProductWithLowestPrice;
  /** Additional CSS class name */
  className?: string;
  /** Callback when card is clicked (optional) */
  onClick?: (product: ProductWithLowestPrice) => void;
  /** Test ID for testing */
  testId?: string;
}

/**
 * ProductCard component for displaying product information in a card format
 *
 * Features:
 * - 1:1 aspect ratio image
 * - Category badge with uppercase styling
 * - Product name with 2-line clamp
 * - Brand name in secondary text
 * - Lowest price section with store name
 * - Favorite heart button (outline/filled)
 * - Links to product detail page
 * - Responsive design
 * - Theme-integrated styling
 *
 * @component
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  onClick,
  testId = 'product-card',
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isFavorite = useIsFavorite(product.id);
  const { toggleFavorite, isLoading: isTogglingFavorite } = useToggleFavoriteMutation();

  // Shopping list hooks
  const { data: activeSession } = useActiveSessionQuery({ enabled: isAuthenticated });
  const addItemMutation = useAddItemMutation();

  /**
   * Handle favorite button click
   * Prevents event propagation to avoid triggering card navigation
   */
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // TODO: Show login modal or redirect to login
      console.warn('User must be authenticated to add favorites');
      return;
    }

    try {
      await toggleFavorite(product.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // TODO: Show error toast notification
    }
  };

  /**
   * Handle card click
   */
  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  /**
   * Handle add to shopping cart
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showWarningNotification('Debes iniciar sesión para agregar productos a tu lista');
      return;
    }

    if (!activeSession) {
      showWarningNotification('Debes iniciar una sesión de compras primero');
      return;
    }

    if (!product.lowest_price || !product.store_with_lowest_price) {
      showWarningNotification('No hay información de precio disponible');
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        session_id: activeSession.id,
        product_id: product.id,
        product_name: product.name,
        price: product.lowest_price,
        quantity: 1,
        store_id: product.store_with_lowest_price.id,
        store_name: product.store_with_lowest_price.name,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return 'N/A';
    return price.toFixed(2);
  };

  return (
    <CardContainer
      className={className}
      data-testid={testId}
      onClick={handleCardClick}
    >
      <Link to={`/product/${product.id}`} aria-label={`Ver detalles de ${product.name}`}>
        {/* Image Section */}
        <CardImageWrapper>
          <CardImage
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

          {/* Category Badge */}
          {product.category && (
            <CategoryBadge>
              {product.category}
            </CategoryBadge>
          )}

          {/* Favorite Button */}
          {isAuthenticated && (
            <FavoriteButton
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              $isFavorite={isFavorite}
              type="button"
            >
              {isFavorite ? (
                <FaHeart aria-hidden="true" />
              ) : (
                <FiHeart aria-hidden="true" />
              )}
            </FavoriteButton>
          )}
        </CardImageWrapper>

        {/* Content Section */}
        <CardContent>
          {/* Product Name */}
          <ProductName title={product.name}>
            {product.name}
          </ProductName>

          {/* Brand Name */}
          {product.brand && (
            <BrandName>
              {product.brand}
            </BrandName>
          )}

          {/* Price Section */}
          <PriceSection>
            <PriceLabel>Desde</PriceLabel>
            <PriceAmount>
              ${formatPrice(product.lowest_price)}
            </PriceAmount>
            {product.store_with_lowest_price && (
              <StoreName>
                en {product.store_with_lowest_price.name}
              </StoreName>
            )}
          </PriceSection>

          {/* Add to Cart Button */}
          {isAuthenticated && activeSession && (
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={addItemMutation.isPending}
              type="button"
              aria-label="Agregar a lista de compras"
            >
              <FiShoppingCart />
              Agregar a lista
            </AddToCartButton>
          )}
        </CardContent>
      </Link>
    </CardContainer>
  );
};

ProductCard.displayName = 'ProductCard';

/**
 * ProductCardSkeleton - Loading skeleton for ProductCard
 *
 * @example
 * ```tsx
 * <ProductCardSkeleton />
 * ```
 */
export interface ProductCardSkeletonProps {
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  className,
  testId = 'product-card-skeleton',
}) => {
  return (
    <SkeletonCard className={className} data-testid={testId} aria-label="Cargando producto">
      {/* Skeleton Image */}
      <SkeletonImage />

      {/* Skeleton Content */}
      <SkeletonContent>
        {/* Skeleton Product Name */}
        <SkeletonText width="100%" height="20px" />
        <SkeletonText width="80%" height="20px" />

        {/* Skeleton Brand */}
        <SkeletonText width="60%" height="14px" />

        {/* Skeleton Price Section */}
        <div style={{ marginTop: '16px', paddingTop: '12px' }}>
          <SkeletonText width="40%" height="12px" />
          <SkeletonText width="50%" height="24px" style={{ marginTop: '8px' }} />
          <SkeletonText width="70%" height="14px" style={{ marginTop: '4px' }} />
        </div>
      </SkeletonContent>
    </SkeletonCard>
  );
};

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export default ProductCard;
