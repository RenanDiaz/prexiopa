/**
 * PriceComparison Component
 *
 * Displays a comparison table/card layout of product prices across different stores.
 * Highlights the lowest price and shows store information with action buttons.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PriceComparison prices={product.prices} />
 *
 * // With custom empty message
 * <PriceComparison
 *   prices={[]}
 *   emptyMessage="No hay precios disponibles para este producto"
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { FiExternalLink, FiAlertCircle, FiTag, FiPercent } from 'react-icons/fi';
import type { Price } from '@/types/product';
import { EmptyState } from '@/components/common/EmptyState';
import {
  ComparisonContainer,
  ComparisonTitle,
  PriceList,
  PriceItem,
  StoreLogoWrapper,
  StoreLogo,
  PriceInfo,
  StoreName,
  PriceRow,
  PriceAmount,
  BestPriceBadge,
  OutOfStockBadge,
  PromotionBadge,
  DealLabel,
  EffectivePrice,
  ViewOfferButton,
} from './PriceComparison.styles';

export interface PriceComparisonProps {
  /** Array of prices from different stores */
  prices?: Price[];
  /** Title for the comparison section */
  title?: string;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * PriceComparison component for comparing prices across stores
 *
 * Features:
 * - Sorted by price (lowest first)
 * - Highlights lowest price with success badge
 * - Shows store logo and name
 * - Displays "Agotado" badge for out of stock items
 * - "Ver oferta" link button for each store
 * - Empty state for no prices
 * - Responsive card/table layout
 * - Theme-integrated styling
 *
 * Price Display Rules:
 * - Prices sorted ascending (lowest first)
 * - Lowest in-stock price gets "Mejor precio" badge
 * - Out of stock items shown at the bottom with disabled styling
 *
 * @component
 */
export const PriceComparison: React.FC<PriceComparisonProps> = ({
  prices = [],
  title = 'Comparación de precios',
  emptyMessage = 'No hay precios disponibles para este producto',
  className,
  testId = 'price-comparison',
}) => {
  /**
   * Sort prices by:
   * 1. In stock items first
   * 2. Then by price (ascending)
   * Find the lowest in-stock price for highlighting
   */
  const sortedPrices = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    const sorted = [...prices].sort((a, b) => {
      // In stock items first
      if (a.in_stock && !b.in_stock) return -1;
      if (!a.in_stock && b.in_stock) return 1;

      // Then sort by price
      return a.price - b.price;
    });

    return sorted;
  }, [prices]);

  /**
   * Get the effective unit price for a price entry
   */
  const getEffectivePrice = (price: Price): number => {
    if (price.quantity && price.quantity > 1 && price.total_price) {
      return price.total_price / price.quantity;
    }
    return price.price;
  };

  /**
   * Find the lowest effective price (only among in-stock items)
   */
  const lowestPrice = useMemo(() => {
    const inStockPrices = sortedPrices.filter(p => p.in_stock);
    if (inStockPrices.length === 0) return null;
    return Math.min(...inStockPrices.map(p => getEffectivePrice(p)));
  }, [sortedPrices]);

  /**
   * Get deal label for display
   */
  const getDealLabel = (price: Price): string | null => {
    if (price.notes) return price.notes;
    if (price.quantity && price.quantity > 1) {
      return `${price.quantity} por $${(price.total_price || price.price * price.quantity).toFixed(2)}`;
    }
    if (price.discount && price.discount > 0) {
      return `$${price.discount.toFixed(2)} de descuento`;
    }
    return null;
  };

  /**
   * Calculate savings percentage
   */
  const getSavingsPercentage = (price: Price): number => {
    if (!price.discount || !price.quantity) return 0;
    const regularTotal = price.price * price.quantity;
    if (regularTotal <= 0) return 0;
    return Math.round((price.discount / regularTotal) * 100);
  };

  /**
   * Format price for display
   */
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  /**
   * Handle "Ver oferta" button click
   */
  const handleViewOffer = (price: Price) => {
    if (!price.stores?.website) {
      console.warn('Store website not available');
      return;
    }

    // Open store website in new tab
    window.open(price.stores.website, '_blank', 'noopener,noreferrer');
  };

  // Show empty state if no prices
  if (!sortedPrices || sortedPrices.length === 0) {
    return (
      <ComparisonContainer className={className} data-testid={`${testId}-empty`}>
        <EmptyState
          icon={FiAlertCircle}
          title="Sin precios disponibles"
          message={emptyMessage}
        />
      </ComparisonContainer>
    );
  }

  return (
    <ComparisonContainer className={className} data-testid={testId}>
      {/* Section Title */}
      <ComparisonTitle>{title}</ComparisonTitle>

      {/* Price List */}
      <PriceList>
        {sortedPrices.map((price) => {
          const effectivePrice = getEffectivePrice(price);
          const isLowestPrice = price.in_stock && effectivePrice === lowestPrice;
          const storeName = price.stores?.name || 'Tienda desconocida';
          const storeHasWebsite = !!price.stores?.website;
          const dealLabel = getDealLabel(price);
          const savingsPercentage = getSavingsPercentage(price);
          const isPromotion = price.is_promotion || !!dealLabel;
          const showEffectivePrice = price.quantity && price.quantity > 1;

          return (
            <PriceItem
              key={price.id}
              $isOutOfStock={!price.in_stock}
              $isPromotion={isPromotion && price.in_stock}
              data-testid={`price-item-${price.id}`}
            >
              {/* Store Logo */}
              <StoreLogoWrapper>
                {price.stores?.logo ? (
                  <StoreLogo
                    src={price.stores.logo}
                    alt={storeName}
                    loading="lazy"
                  />
                ) : (
                  <StoreLogo
                    as="div"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </StoreLogo>
                )}
              </StoreLogoWrapper>

              {/* Price Information */}
              <PriceInfo>
                <StoreName>{storeName}</StoreName>

                <PriceRow>
                  <PriceAmount $isLowest={isLowestPrice}>
                    ${formatPrice(showEffectivePrice ? effectivePrice : price.price)}
                  </PriceAmount>

                  {/* Best Price Badge */}
                  {isLowestPrice && (
                    <BestPriceBadge>
                      Mejor precio
                    </BestPriceBadge>
                  )}

                  {/* Promotion Badge */}
                  {isPromotion && price.in_stock && !isLowestPrice && (
                    <PromotionBadge>
                      <FiTag size={12} />
                      Oferta
                    </PromotionBadge>
                  )}

                  {/* Out of Stock Badge */}
                  {!price.in_stock && (
                    <OutOfStockBadge>
                      Agotado
                    </OutOfStockBadge>
                  )}
                </PriceRow>

                {/* Deal Label */}
                {dealLabel && price.in_stock && (
                  <DealLabel>
                    <FiTag size={14} />
                    {dealLabel}
                    {savingsPercentage > 0 && (
                      <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <FiPercent size={12} /> {savingsPercentage}% ahorro
                      </span>
                    )}
                  </DealLabel>
                )}

                {/* Effective Price for multi-quantity deals */}
                {showEffectivePrice && price.in_stock && price.quantity != null && (
                  <EffectivePrice>
                    Precio unitario: ${formatPrice(price.price)} × {price.quantity} = ${formatPrice(price.total_price ?? price.price * price.quantity)}
                  </EffectivePrice>
                )}
              </PriceInfo>

              {/* View Offer Button */}
              <ViewOfferButton
                onClick={() => handleViewOffer(price)}
                disabled={!price.in_stock || !storeHasWebsite}
                $isOutOfStock={!price.in_stock}
                aria-label={`Ver oferta en ${storeName}`}
                type="button"
              >
                <span>Ver oferta</span>
                <FiExternalLink aria-hidden="true" />
              </ViewOfferButton>
            </PriceItem>
          );
        })}
      </PriceList>
    </ComparisonContainer>
  );
};

PriceComparison.displayName = 'PriceComparison';

export default PriceComparison;
