/**
 * ProductCard Component
 *
 * Professional product card for displaying product information with pricing.
 * Optimized for Prexiopá's price comparison platform.
 *
 * Features:
 * - Product image with fallback
 * - Discount badge (top-right)
 * - Favorite toggle button (animated heart)
 * - Best price highlighting with store info
 * - Brand, category, and product name
 * - Responsive hover effects
 * - Navigation to product detail page
 * - Mobile-optimized touch targets
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProductCard
 *   product={product}
 *   bestPrice={lowestPriceData}
 *   onFavoriteToggle={handleToggle}
 *   isFavorite={false}
 * />
 *
 * // Compact variant
 * <ProductCard
 *   product={product}
 *   variant="compact"
 * />
 * ```
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMapPin, FiTrendingDown } from 'react-icons/fi';
import type { Product } from '@/types/product.types';
import type { StorePriceComparison } from '@/types/price.types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import * as S from './ProductCard.styles';

export interface ProductCardProps {
  /**
   * Product data to display
   */
  product: Product;

  /**
   * Best price data (lowest price from all stores)
   */
  bestPrice?: StorePriceComparison;

  /**
   * Callback when favorite button is toggled
   */
  onFavoriteToggle?: (productId: string) => void;

  /**
   * Whether product is favorited by user
   */
  isFavorite?: boolean;

  /**
   * Card display variant
   * - default: Full card with all information
   * - compact: Condensed version for dense layouts
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
 * ProductCard - Display product with pricing and interactions
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  bestPrice,
  onFavoriteToggle,
  isFavorite = false,
  variant = 'default',
  className,
  testId = 'product-card',
}) => {
  const navigate = useNavigate();
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get primary image or first available image
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const imageUrl = imageError ? '/images/product-placeholder.png' : primaryImage?.url;

  // Calculate discount percentage if available
  const discountPercentage = bestPrice?.discountPercentage || 0;
  const hasDiscount = discountPercentage > 0;

  // Format price with currency
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Handle favorite toggle with animation
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (onFavoriteToggle) {
      setIsHeartAnimating(true);
      onFavoriteToggle(product.id);

      // Reset animation after completion
      setTimeout(() => setIsHeartAnimating(false), 600);
    }
  };

  // Navigate to product detail page
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle View Details button
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <S.ProductCardWrapper
      className={className}
      variant={variant}
      data-testid={testId}
    >
      <Card variant="default" padding="md">
        {/* Image Section with Badges */}
        <S.ImageSection onClick={handleCardClick} role="button" tabIndex={0}>
          <S.ProductImage
            src={imageUrl}
            alt={primaryImage?.alt || product.name}
            onError={handleImageError}
            loading="lazy"
          />

          {/* Discount Badge - Top Right */}
          {hasDiscount && (
            <S.DiscountBadge>
              <Badge variant="warning" size="md">
                <FiTrendingDown size={12} />
                <span>-{Math.round(discountPercentage)}%</span>
              </Badge>
            </S.DiscountBadge>
          )}

          {/* Favorite Button - Top Right */}
          <S.FavoriteButton
            onClick={handleFavoriteClick}
            isFavorite={isFavorite}
            isAnimating={isHeartAnimating}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </S.FavoriteButton>
        </S.ImageSection>

        {/* Content Section */}
        <S.ContentSection onClick={handleCardClick}>
          {/* Category */}
          <S.CategoryText>{product.category}</S.CategoryText>

          {/* Product Name */}
          <S.ProductName title={product.name}>
            {product.name}
          </S.ProductName>

          {/* Brand */}
          {product.brand && (
            <S.BrandText>
              <span>por</span> <strong>{product.brand}</strong>
            </S.BrandText>
          )}

          {/* Price Section */}
          {bestPrice && (
            <S.PriceSection>
              {/* Best Price Label */}
              <S.BestPriceLabel>
                <Badge variant="success" size="sm">
                  Mejor Precio
                </Badge>
              </S.BestPriceLabel>

              {/* Price Display */}
              <S.PriceDisplay>
                {bestPrice.discountPrice ? (
                  <>
                    <S.OriginalPrice>
                      {formatPrice(bestPrice.price)}
                    </S.OriginalPrice>
                    <S.DiscountPrice>
                      {formatPrice(bestPrice.discountPrice)}
                    </S.DiscountPrice>
                  </>
                ) : (
                  <S.CurrentPrice>
                    {formatPrice(bestPrice.price)}
                  </S.CurrentPrice>
                )}
              </S.PriceDisplay>

              {/* Store Info */}
              <S.StoreInfo>
                <FiMapPin size={14} />
                <span>en {bestPrice.storeName}</span>
              </S.StoreInfo>
            </S.PriceSection>
          )}

          {/* No Price Available */}
          {!bestPrice && (
            <S.NoPriceAvailable>
              <span>Precio no disponible</span>
            </S.NoPriceAvailable>
          )}
        </S.ContentSection>

        {/* Action Button */}
        <S.ActionSection>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleViewDetails}
            aria-label={`Ver detalles de ${product.name}`}
          >
            Ver Detalles
          </Button>
        </S.ActionSection>
      </Card>
    </S.ProductCardWrapper>
  );
};

/**
 * ProductCardSkeleton - Loading state for ProductCard
 */
export const ProductCardSkeleton: React.FC<{ variant?: 'default' | 'compact' }> = ({
  variant = 'default',
}) => {
  return (
    <S.ProductCardWrapper variant={variant} data-testid="product-card-skeleton">
      <Card variant="default" padding="md">
        {/* Image Skeleton */}
        <S.SkeletonImage />

        {/* Content Skeleton */}
        <S.SkeletonContent>
          <S.SkeletonText width="40%" height="12px" />
          <S.SkeletonText width="90%" height="16px" marginTop="8px" />
          <S.SkeletonText width="60%" height="12px" marginTop="8px" />

          {/* Price Skeleton */}
          <S.SkeletonPriceSection>
            <S.SkeletonText width="80px" height="20px" />
            <S.SkeletonText width="120px" height="24px" marginTop="4px" />
            <S.SkeletonText width="100px" height="12px" marginTop="4px" />
          </S.SkeletonPriceSection>
        </S.SkeletonContent>

        {/* Button Skeleton */}
        <S.SkeletonButton />
      </Card>
    </S.ProductCardWrapper>
  );
};

ProductCard.displayName = 'ProductCard';
ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export default ProductCard;
