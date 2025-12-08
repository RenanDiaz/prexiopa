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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import type { Product } from '@/types/product.types';
import productPlaceholder from '@/assets/images/product-placeholder.svg';
import {
  formatProductMeasurement,
  calculatePricePerBaseUnit,
  formatPricePerBaseUnit,
} from '@/types/product.types';
import { useIsFavorite, useToggleFavoriteMutation } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import { useActiveSessionQuery, useAddItemMutation, useCreateSessionMutation } from '@/hooks/useShoppingLists';
import { useStoresQuery } from '@/hooks/useStores';
import { showWarningNotification } from '@/store/uiStore';
import { AddToListModal } from '@/components/shopping';
import type { TaxRateCode } from '@/types/tax';
import {
  CardContainer,
  CardImageWrapper,
  CardImage,
  CategoryBadge,
  FavoriteButton,
  CardContent,
  ProductName,
  BrandName,
  ProductMeasurement,
  PriceSection,
  PriceLabel,
  PriceAmount,
  PricePerUnit,
  StoreName,
  AddToCartButton,
  SkeletonCard,
  SkeletonImage,
  SkeletonContent,
  SkeletonText,
} from './ProductCard.phase3.styles';

export interface ProductCardProps {
  /** Product data including prices and store information */
  product: Product;
  /** Additional CSS class name */
  className?: string;
  /** Callback when card is clicked (optional) */
  onClick?: (product: Product) => void;
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
  const [imgSrc, setImgSrc] = useState(product.image || productPlaceholder);
  const [imgError, setImgError] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isFavorite = useIsFavorite(product.id);
  const { toggleFavorite, isLoading: isTogglingFavorite } = useToggleFavoriteMutation();

  // Shopping list hooks
  const { data: activeSession, isLoading: isLoadingSession } = useActiveSessionQuery({ enabled: isAuthenticated });
  const addItemMutation = useAddItemMutation();
  const createSessionMutation = useCreateSessionMutation();

  // Stores query for modal
  const { data: stores = [] } = useStoresQuery();

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
   * Handle add to shopping cart - opens modal
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showWarningNotification('Debes iniciar sesión para agregar productos a tu lista');
      return;
    }

    setIsAddToListModalOpen(true);
  };

  /**
   * Handle add from modal - actual add logic with price
   */
  const handleAddFromModal = async (data: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    store_id: string;
    store_name: string;
    savePrice: boolean;
    // Tax fields
    taxRateCode: TaxRateCode;
    taxRate: number;
    priceIncludesTax: boolean;
  }) => {
    try {
      // If no active session, create one automatically with the selected store
      let sessionId = activeSession?.id;
      if (!sessionId) {
        const newSession = await createSessionMutation.mutateAsync({
          mode: 'planning',
          store_id: data.store_id,
          store_name: data.store_name,
        });
        sessionId = newSession.id;
      }

      // Use session's store if it exists, otherwise use the selected store from modal
      const finalStoreId = activeSession?.store_id || data.store_id;
      const finalStoreName = activeSession?.store_name || data.store_name;

      // Add item to shopping list with tax info
      await addItemMutation.mutateAsync({
        session_id: sessionId,
        product_id: data.product_id,
        product_name: data.product_name,
        price: data.price,
        quantity: data.quantity,
        store_id: finalStoreId,
        store_name: finalStoreName,
        // Tax fields
        taxRateCode: data.taxRateCode,
        taxRate: data.taxRate,
        priceIncludesTax: data.priceIncludesTax,
      });

      // If savePrice is true, save to prices table
      if (data.savePrice) {
        try {
          const { saveProductPrice } = await import('@/services/supabase/products');
          await saveProductPrice({
            product_id: data.product_id,
            store_id: data.store_id,
            price: data.price,
            in_stock: true,
          });
        } catch (error) {
          console.error('Error saving price:', error);
          // Don't block the flow if price save fails
        }
      }

      // Close modal
      setIsAddToListModalOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
      // Error notifications are already handled by mutations
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return 'N/A';
    return price.toFixed(2);
  };

  /**
   * Handle image load error - show fallback
   */
  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(productPlaceholder);
    }
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
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
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

          {/* Product Measurement */}
          {product.unit && product.measurement_value && (
            <ProductMeasurement>
              {formatProductMeasurement(product.measurement_value, product.unit)}
            </ProductMeasurement>
          )}

          {/* Price Section */}
          <PriceSection>
            <PriceLabel>Desde</PriceLabel>
            <PriceAmount>
              ${formatPrice(product.lowest_price)}
            </PriceAmount>
            {/* Price per unit */}
            {product.lowest_price && product.unit && product.measurement_value && (
              <PricePerUnit>
                {formatPricePerBaseUnit(
                  calculatePricePerBaseUnit(
                    product.lowest_price,
                    product.unit,
                    product.measurement_value
                  ),
                  product.unit
                )}
              </PricePerUnit>
            )}
            {product.store_with_lowest_price && (
              <StoreName>
                en {product.store_with_lowest_price.name}
              </StoreName>
            )}
          </PriceSection>

          {/* Add to Cart Button */}
          {isAuthenticated && (
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={isLoadingSession}
              type="button"
              aria-label="Agregar a lista de compras"
            >
              <FiShoppingCart />
              Agregar a lista
            </AddToCartButton>
          )}
        </CardContent>
      </Link>

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={isAddToListModalOpen}
        product={product}
        stores={stores}
        onClose={() => setIsAddToListModalOpen(false)}
        onAdd={handleAddFromModal}
        isSubmitting={addItemMutation.isPending || createSessionMutation.isPending}
        sessionStoreId={activeSession?.store_id}
        sessionStoreName={activeSession?.store_name}
      />
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
