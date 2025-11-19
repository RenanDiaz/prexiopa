/**
 * ProductCard Styled Components
 *
 * Professional styling for product cards with smooth interactions,
 * responsive design, and theme integration.
 */

import styled, { css, keyframes } from 'styled-components';

interface ProductCardWrapperProps {
  variant?: 'default' | 'compact';
}

export const ProductCardWrapper = styled.div<ProductCardWrapperProps>`
  width: 100%;
  height: 100%;
  min-height: ${props => props.variant === 'compact' ? '320px' : '420px'};

  /* Smooth transitions */
  transition: transform 0.2s ease-in-out;

  /* Hover effect - subtle lift */
  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    min-height: ${props => props.variant === 'compact' ? '300px' : '380px'};
  }
`;

/**
 * Image Section - Top of card
 */
export const ImageSection = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing[4]};

  /* Smooth background transition */
  transition: background 0.2s ease-in-out;

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }

  /* Focus state for accessibility */
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: ${props => props.theme.spacing[4]};

  /* Smooth opacity transition on load */
  transition: opacity 0.3s ease-in-out;

  &[src=""] {
    opacity: 0;
  }
`;

/**
 * Discount Badge - Positioned top-right
 */
export const DiscountBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  right: ${props => props.theme.spacing[3]};
  z-index: 2;

  /* Badge content alignment */
  > span {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[1]};
  }

  /* Animation on mount */
  animation: slideInRight 0.3s ease-out;

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

/**
 * Favorite Button - Animated heart
 */
interface FavoriteButtonProps {
  isFavorite: boolean;
  isAnimating: boolean;
}

// Heart pulse animation
const heartPulse = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(0.95);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

export const FavoriteButton = styled.button<FavoriteButtonProps>`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  left: ${props => props.theme.spacing[3]};
  z-index: 3;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  padding: 0;

  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.full};

  color: ${props =>
    props.isFavorite
      ? props.theme.colors.functional.favorite.main
      : props.theme.colors.text.secondary};

  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* Hover effect */
  &:hover {
    background: ${props => props.theme.colors.functional.favorite.light};
    border-color: ${props => props.theme.colors.functional.favorite.main};
    color: ${props => props.theme.colors.functional.favorite.main};
    transform: scale(1.1);
  }

  /* Active state */
  &:active {
    transform: scale(0.95);
  }

  /* Animation when toggled */
  ${props =>
    props.isAnimating &&
    css`
      animation: ${heartPulse} 0.6s ease-in-out;
    `}

  /* Focus state */
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

/**
 * Content Section - Product info
 */
export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

export const CategoryText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
`;

export const ProductName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: ${props => props.theme.typography.lineHeight.snug};

  /* Clamp to 2 lines with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  min-height: 2.75em; /* Reserve space for 2 lines */

  transition: color 0.2s ease-in-out;

  ${ContentSection}:hover & {
    color: ${props => props.theme.colors.primary[500]};
  }

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

export const BrandText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.normal};

  span {
    font-weight: ${props => props.theme.typography.fontWeight.regular};
  }

  strong {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
  }
`;

/**
 * Price Section - Best price display
 */
export const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.functional.bestPrice.light};
  border-radius: ${props => props.theme.borderRadius.base};
  margin-top: ${props => props.theme.spacing[2]};
`;

export const BestPriceLabel = styled.div`
  display: flex;
  align-items: center;
`;

export const PriceDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing[2]};
`;

export const CurrentPrice = styled.span`
  font-size: ${props => props.theme.typography.variants.price.fontSize};
  font-weight: ${props => props.theme.typography.variants.price.fontWeight};
  font-family: ${props => props.theme.typography.variants.price.fontFamily};
  color: ${props => props.theme.colors.functional.bestPrice.dark};
  line-height: ${props => props.theme.typography.variants.price.lineHeight};
`;

export const OriginalPrice = styled.span`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.regular};
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: line-through;
`;

export const DiscountPrice = styled.span`
  font-size: ${props => props.theme.typography.variants.price.fontSize};
  font-weight: ${props => props.theme.typography.variants.price.fontWeight};
  font-family: ${props => props.theme.typography.variants.price.fontFamily};
  color: ${props => props.theme.colors.functional.bestPrice.dark};
  line-height: ${props => props.theme.typography.variants.price.lineHeight};
`;

export const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    flex-shrink: 0;
  }

  span {
    line-height: ${props => props.theme.typography.lineHeight.normal};
  }
`;

/**
 * No Price State
 */
export const NoPriceAvailable = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.neutral[100]};
  border-radius: ${props => props.theme.borderRadius.base};
  margin-top: ${props => props.theme.spacing[2]};

  span {
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
    font-style: italic;
  }
`;

/**
 * Action Section - Button area
 */
export const ActionSection = styled.div`
  margin-top: auto;
`;

/**
 * Skeleton Loading States
 */
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const skeletonBase = css`
  background: linear-gradient(
    to right,
    ${props => props.theme.colors.neutral[200]} 0%,
    ${props => props.theme.colors.neutral[300]} 20%,
    ${props => props.theme.colors.neutral[200]} 40%,
    ${props => props.theme.colors.neutral[200]} 100%
  );
  background-size: 800px 104px;
  animation: ${shimmer} 1.5s linear infinite;
  border-radius: ${props => props.theme.borderRadius.base};
`;

export const SkeletonImage = styled.div`
  ${skeletonBase}
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

export const SkeletonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

interface SkeletonTextProps {
  width?: string;
  height?: string;
  marginTop?: string;
}

export const SkeletonText = styled.div<SkeletonTextProps>`
  ${skeletonBase}
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '14px'};
  margin-top: ${props => props.marginTop || '0'};
`;

export const SkeletonPriceSection = styled.div`
  ${skeletonBase}
  padding: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[2]};
  min-height: 80px;
`;

export const SkeletonButton = styled.div`
  ${skeletonBase}
  width: 100%;
  height: 40px;
`;
