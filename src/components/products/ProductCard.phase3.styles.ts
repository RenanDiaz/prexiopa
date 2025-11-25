/**
 * ProductCard Phase 3 Styled Components
 *
 * Styling for the new ProductCard component with favorites integration.
 * Uses theme system and follows responsive design principles.
 */

import styled, { css, keyframes } from 'styled-components';

/**
 * Heart pulse animation for favorite button
 */
const heartPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
`;

/**
 * Main card container
 */
export const CardContainer = styled.article`
  width: 100%;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    transform: translateY(-4px);
  }

  a {
    text-decoration: none;
    color: inherit;
    display: block;
  }
`;

/**
 * Image wrapper with 1:1 aspect ratio
 */
export const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: ${({ theme }) => theme.colors.background.default};
  overflow: hidden;
`;

/**
 * Product image
 */
export const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: ${({ theme }) => theme.spacing[4]};
  transition: transform 0.3s ease;

  ${CardContainer}:hover & {
    transform: scale(1.05);
  }
`;

/**
 * Category badge (top-left)
 */
export const CategoryBadge = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  left: ${({ theme }) => theme.spacing[3]};
  z-index: 2;

  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};

  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};

  border-radius: ${({ theme }) => theme.borderRadius.badge};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};

  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Favorite button (top-right)
 */
export const FavoriteButton = styled.button<{ $isFavorite?: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  z-index: 3;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;
  padding: 0;

  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.full};

  color: ${({ theme, $isFavorite }) =>
    $isFavorite
      ? theme.colors.functional.favorite.main
      : theme.colors.text.secondary};

  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background: ${({ theme, $isFavorite }) =>
      $isFavorite
        ? theme.colors.functional.favorite.light
        : theme.colors.neutral[100]};
    border-color: ${({ theme }) => theme.colors.functional.favorite.main};
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  ${({ $isFavorite }) =>
    $isFavorite &&
    css`
      animation: ${heartPulse} 0.6s ease;
    `}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

/**
 * Card content section
 */
export const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

/**
 * Product name (2-line clamp)
 */
export const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  margin: 0;

  /* 2-line clamp */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.4em; /* Reserve space for 2 lines */
`;

/**
 * Brand name (secondary text)
 */
export const BrandName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;

  /* Single line with ellipsis */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Product measurement (e.g., "500g", "1L", "12 un")
 */
export const ProductMeasurement = styled.span`
  display: inline-block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  width: fit-content;
`;

/**
 * Price section container
 */
export const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-top: ${({ theme }) => theme.spacing[2]};
  padding-top: ${({ theme }) => theme.spacing[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

/**
 * "Desde" label
 */
export const PriceLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

/**
 * Price amount
 */
export const PriceAmount = styled.div`
  ${({ theme }) => theme.typography.variants.priceSmall};
  color: ${({ theme }) => theme.colors.primary[500]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

/**
 * Price per unit (e.g., "$1.50/L", "$3.00/kg")
 */
export const PricePerUnit = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.secondary[600]};
  background: ${({ theme }) => theme.colors.secondary[50]};
  padding: ${({ theme }) => `${theme.spacing[0.5] || '2px'} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  width: fit-content;
`;

/**
 * Store name
 */
export const StoreName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.secondary};

  /* Single line with ellipsis */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Add to cart button
 */
export const AddToCartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};

  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};

  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};

  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

/**
 * Skeleton shimmer animation
 */
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

/**
 * Skeleton card container
 */
export const SkeletonCard = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;
`;

/**
 * Skeleton image
 */
export const SkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutral[200]} 0px,
    ${({ theme }) => theme.colors.neutral[100]} 40px,
    ${({ theme }) => theme.colors.neutral[200]} 80px
  );
  background-size: 600px;
  animation: ${shimmer} 1.5s infinite;
`;

/**
 * Skeleton content
 */
export const SkeletonContent = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

/**
 * Skeleton text line
 */
export const SkeletonText = styled.div<{ width?: string; height?: string }>`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '16px'};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutral[200]} 0px,
    ${({ theme }) => theme.colors.neutral[100]} 40px,
    ${({ theme }) => theme.colors.neutral[200]} 80px
  );
  background-size: 600px;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;
