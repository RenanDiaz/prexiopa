/**
 * PriceComparison Styles
 * Styled components for PriceComparison component
 */

import styled from 'styled-components';

/**
 * Main container for price comparison section
 */
export const ComparisonContainer = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

/**
 * Section title
 */
export const ComparisonTitle = styled.h3`
  ${({ theme }) => theme.typography.variants.h4};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[6]} 0;
`;

/**
 * List of prices
 */
export const PriceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

/**
 * Individual price item
 */
export const PriceItem = styled.div<{ $isOutOfStock?: boolean; $isPromotion?: boolean }>`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme, $isPromotion }) =>
    $isPromotion ? theme.colors.semantic.warning.light : theme.colors.background.default};
  border: 1px solid ${({ theme, $isPromotion }) =>
    $isPromotion ? theme.colors.semantic.warning.main : theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all 0.2s ease;
  opacity: ${({ $isOutOfStock }) => ($isOutOfStock ? 0.6 : 1)};

  &:hover {
    border-color: ${({ theme, $isOutOfStock }) =>
      $isOutOfStock ? theme.colors.border.light : theme.colors.border.focus};
    box-shadow: ${({ theme, $isOutOfStock }) =>
      $isOutOfStock ? 'none' : theme.shadows.sm};
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto auto;
    gap: ${({ theme }) => theme.spacing[3]};

    /* Button spans full width on mobile */
    > button {
      grid-column: 1 / -1;
    }
  }
`;

/**
 * Store logo wrapper
 */
export const StoreLogoWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 48px;
    height: 48px;
  }
`;

/**
 * Store logo image
 */
export const StoreLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

/**
 * Price information section
 */
export const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  min-width: 0; /* Allow text truncation */
`;

/**
 * Store name
 */
export const StoreName = styled.div`
  ${({ theme }) => theme.typography.variants.subtitle2};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Row containing price and badges
 */
export const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

/**
 * Price amount
 */
export const PriceAmount = styled.div<{ $isLowest?: boolean }>`
  ${({ theme }) => theme.typography.variants.priceSmall};
  color: ${({ theme, $isLowest }) =>
    $isLowest ? theme.colors.functional.bestPrice.main : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

/**
 * Best price badge
 */
export const BestPriceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.functional.bestPrice.main};
  color: ${({ theme }) => theme.colors.functional.bestPrice.text};
  border-radius: ${({ theme }) => theme.borderRadius.badge};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

/**
 * Out of stock badge
 */
export const OutOfStockBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.neutral[200]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.badge};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

/**
 * View offer button
 */
export const ViewOfferButton = styled.button<{ $isOutOfStock?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  background: ${({ theme, $isOutOfStock }) =>
    $isOutOfStock ? theme.colors.neutral[200] : theme.colors.secondary[500]};
  color: ${({ theme, $isOutOfStock }) =>
    $isOutOfStock ? theme.colors.text.disabled : theme.colors.secondary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: ${({ $isOutOfStock }) => ($isOutOfStock ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary[600]};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

/**
 * Promotion badge - Phase 5.2
 */
export const PromotionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.semantic.warning.main};
  color: ${({ theme }) => theme.colors.semantic.warning.dark};
  border-radius: ${({ theme }) => theme.borderRadius.badge};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};

  svg {
    width: 12px;
    height: 12px;
  }
`;

/**
 * Deal label showing promotion details - Phase 5.2
 */
export const DealLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background: ${({ theme }) => theme.colors.semantic.warning.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.warning.main};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.semantic.warning.dark};
  margin-top: ${({ theme }) => theme.spacing[1]};

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

/**
 * Effective price display for multi-quantity deals - Phase 5.2
 */
export const EffectivePrice = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;
