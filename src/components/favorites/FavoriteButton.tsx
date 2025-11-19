/**
 * FavoriteButton Component
 *
 * A standalone, reusable favorite button that can be used independently:
 * - Heart icon (outline when not favorited, filled when favorited)
 * - Multiple sizes (sm, md, lg)
 * - Multiple variants (icon-only, with-text)
 * - Loading state with spinner
 * - Requires authentication
 * - Tooltip on hover
 *
 * @example
 * ```tsx
 * // Icon only (default)
 * <FavoriteButton productId="123" />
 *
 * // With text
 * <FavoriteButton productId="123" variant="with-text" />
 *
 * // Large size
 * <FavoriteButton productId="123" size="lg" />
 * ```
 */

import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useIsFavorite, useToggleFavoriteMutation } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import {
  FavoriteButtonContainer,
  IconWrapper,
  ButtonText,
  LoadingSpinner,
} from './FavoriteButton.styles';

export type FavoriteButtonSize = 'sm' | 'md' | 'lg';
export type FavoriteButtonVariant = 'icon-only' | 'with-text';

export interface FavoriteButtonProps {
  /** Product ID to favorite/unfavorite */
  productId: string;
  /** Button size */
  size?: FavoriteButtonSize;
  /** Button variant */
  variant?: FavoriteButtonVariant;
  /** Callback when favorite status changes */
  onToggle?: (isFavorite: boolean) => void;
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * FavoriteButton - Standalone favorite button component
 *
 * Features:
 * - Heart button (outline/filled state)
 * - Multiple sizes: sm (32px), md (40px), lg (48px)
 * - Multiple variants: icon-only, with-text
 * - Uses useIsFavorite and useToggleFavoriteMutation hooks
 * - Loading state with spinner animation
 * - Requires authentication
 * - Tooltips on hover
 * - Icons: FiHeart (outline), FaHeart (filled)
 * - Accessible with ARIA labels
 *
 * @component
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  size = 'md',
  variant = 'icon-only',
  onToggle,
  className,
  testId = 'favorite-button',
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isFavorite = useIsFavorite(productId);
  const { toggleFavorite, isLoading } = useToggleFavoriteMutation();

  /**
   * Handle favorite button click
   */
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // TODO: Show login modal or redirect to login
      console.warn('[FavoriteButton] User must be authenticated to add favorites');
      // Could dispatch a custom event here for the app to handle
      window.dispatchEvent(
        new CustomEvent('prexiopa:auth-required', {
          detail: { action: 'favorite', productId },
        })
      );
      return;
    }

    try {
      await toggleFavorite(productId);
      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (error) {
      console.error('[FavoriteButton] Error toggling favorite:', error);
      // TODO: Show error toast notification
    }
  };

  /**
   * Get button label text
   */
  const getLabel = () => {
    if (!isAuthenticated) {
      return 'Inicia sesión para agregar a favoritos';
    }
    return isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos';
  };

  /**
   * Get button text for with-text variant
   */
  const getButtonText = () => {
    if (isLoading) return 'Cargando...';
    return isFavorite ? 'Favorito' : 'Agregar';
  };

  return (
    <FavoriteButtonContainer
      type="button"
      onClick={handleClick}
      disabled={isLoading || !isAuthenticated}
      aria-label={getLabel()}
      title={getLabel()}
      $size={size}
      $variant={variant}
      $isFavorite={isFavorite}
      $isLoading={isLoading}
      className={className}
      data-testid={testId}
    >
      {isLoading ? (
        <LoadingSpinner $size={size} aria-hidden="true" />
      ) : (
        <IconWrapper $size={size} $isFavorite={isFavorite}>
          {isFavorite ? (
            <FaHeart aria-hidden="true" />
          ) : (
            <FiHeart aria-hidden="true" />
          )}
        </IconWrapper>
      )}

      {variant === 'with-text' && (
        <ButtonText $size={size}>{getButtonText()}</ButtonText>
      )}
    </FavoriteButtonContainer>
  );
};

FavoriteButton.displayName = 'FavoriteButton';

export default FavoriteButton;
