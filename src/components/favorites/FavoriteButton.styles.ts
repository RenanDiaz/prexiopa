/**
 * FavoriteButton Styled Components
 * Theme-integrated styles for the favorite button
 */

import styled, { keyframes } from 'styled-components';
import type { FavoriteButtonSize, FavoriteButtonVariant } from './FavoriteButton';

// Size configurations
const sizeConfig = {
  sm: {
    height: '32px',
    iconSize: '16px',
    padding: '0 8px',
    fontSize: '0.75rem',
  },
  md: {
    height: '40px',
    iconSize: '20px',
    padding: '0 12px',
    fontSize: '0.875rem',
  },
  lg: {
    height: '48px',
    iconSize: '24px',
    padding: '0 16px',
    fontSize: '1rem',
  },
};

// Spin animation for loading state
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Heart beat animation
const heartbeat = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
`;

interface ButtonProps {
  $size: FavoriteButtonSize;
  $variant: FavoriteButtonVariant;
  $isFavorite: boolean;
  $isLoading: boolean;
}

export const FavoriteButtonContainer = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  height: ${({ $size }) => sizeConfig[$size].height};
  padding: ${({ $variant, $size }) =>
    $variant === 'icon-only' ? '0' : sizeConfig[$size].padding};
  min-width: ${({ $variant, $size }) =>
    $variant === 'icon-only' ? sizeConfig[$size].height : 'auto'};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ $size }) => sizeConfig[$size].fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $isFavorite }) =>
    $isFavorite
      ? theme.colors.functional.favorite.main
      : theme.colors.text.secondary};
  background-color: ${({ theme, $isFavorite, $variant }) =>
    $variant === 'with-text'
      ? $isFavorite
        ? theme.colors.functional.favorite.light + '33'
        : theme.colors.neutral[50]
      : 'transparent'};
  border: ${({ theme, $variant, $isFavorite }) =>
    $variant === 'with-text'
      ? `1px solid ${
          $isFavorite
            ? theme.colors.functional.favorite.main
            : theme.colors.border.main
        }`
      : 'none'};
  border-radius: ${({ theme, $variant }) =>
    $variant === 'with-text' ? theme.borderRadius.full : theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: ${({ theme, $isFavorite }) =>
      $isFavorite
        ? theme.colors.functional.favorite.dark
        : theme.colors.functional.favorite.main};
    background-color: ${({ theme, $variant }) =>
      $variant === 'with-text'
        ? theme.colors.functional.favorite.light + '44'
        : theme.colors.neutral[100]};
    transform: ${({ $variant }) =>
      $variant === 'icon-only' ? 'scale(1.1)' : 'translateY(-1px)'};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
    animation: ${heartbeat} 0.3s ease-in-out;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    background-color: ${({ theme, $variant }) =>
      $variant === 'with-text' ? theme.colors.background.disabled : 'transparent'};
    border-color: ${({ theme, $variant }) =>
      $variant === 'with-text' ? theme.colors.border.light : 'transparent'};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* Animation when favorited */
  ${({ $isFavorite }) =>
    $isFavorite &&
    `
    animation: ${heartbeat} 0.3s ease-in-out;
  `}
`;

interface IconWrapperProps {
  $size: FavoriteButtonSize;
  $isFavorite: boolean;
}

export const IconWrapper = styled.span<IconWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => sizeConfig[$size].iconSize};
  height: ${({ $size }) => sizeConfig[$size].iconSize};

  svg {
    width: 100%;
    height: 100%;
    fill: ${({ $isFavorite, theme }) =>
      $isFavorite ? theme.colors.functional.favorite.main : 'none'};
    stroke: currentColor;
    stroke-width: ${({ $isFavorite }) => ($isFavorite ? '0' : '2')};
  }
`;

interface ButtonTextProps {
  $size: FavoriteButtonSize;
}

export const ButtonText = styled.span<ButtonTextProps>`
  line-height: 1;
`;

interface LoadingSpinnerProps {
  $size: FavoriteButtonSize;
}

export const LoadingSpinner = styled.div<LoadingSpinnerProps>`
  width: ${({ $size }) => sizeConfig[$size].iconSize};
  height: ${({ $size }) => sizeConfig[$size].iconSize};
  border: 2px solid ${({ theme }) => theme.colors.neutral[200]};
  border-top-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
