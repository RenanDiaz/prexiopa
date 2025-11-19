/**
 * LoadingState Component
 *
 * A complete loading state component with spinner and customizable text.
 * Can be used inline or as a full-screen overlay.
 *
 * @example
 * ```tsx
 * <LoadingState message="Cargando productos..." />
 * <LoadingState message="Procesando..." size="lg" fullScreen />
 * ```
 */

import React from 'react';
import {
  LoadingStateContainer,
  LoadingStateOverlay,
  LoadingStateContent,
  LoadingStateText,
} from './LoadingState.styles';
import { LoadingSpinner } from './LoadingSpinner';
import type { SpinnerSize, SpinnerColor } from './LoadingSpinner';

export interface LoadingStateProps {
  /**
   * Loading message to display below the spinner
   * @default 'Cargando...'
   */
  message?: string;

  /**
   * Size of the spinner
   * @default 'lg'
   */
  size?: SpinnerSize;

  /**
   * Color variant of the spinner
   * @default 'primary'
   */
  color?: SpinnerColor;

  /**
   * If true, displays as full-screen overlay with backdrop
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Accessible label for screen readers
   * @default Uses message prop or 'Cargando'
   */
  ariaLabel?: string;
}

/**
 * LoadingState component for complete loading experiences
 *
 * Features:
 * - Spinner with customizable message
 * - Full-screen overlay option with backdrop
 * - Centered vertical and horizontal alignment
 * - Smooth opacity animations
 * - Theme-integrated styling
 * - Fully accessible
 *
 * Use Cases:
 * - Page loading states
 * - Form submissions
 * - Data fetching
 * - Modal content loading
 * - Section loading
 *
 * @component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando...',
  size = 'lg',
  color = 'primary',
  fullScreen = false,
  className,
  ariaLabel,
}) => {
  const spinnerColor: SpinnerColor = fullScreen && color === 'primary' ? 'white' : color;
  const accessibilityLabel = ariaLabel || message;

  const content = (
    <LoadingStateContent>
      <LoadingSpinner
        size={size}
        color={spinnerColor}
        ariaLabel={accessibilityLabel}
      />
      {message && (
        <LoadingStateText size={size} fullScreen={fullScreen}>
          {message}
        </LoadingStateText>
      )}
    </LoadingStateContent>
  );

  if (fullScreen) {
    return (
      <LoadingStateOverlay
        className={className}
        role="status"
        aria-label={accessibilityLabel}
        aria-live="polite"
      >
        {content}
      </LoadingStateOverlay>
    );
  }

  return (
    <LoadingStateContainer
      className={className}
      role="status"
      aria-label={accessibilityLabel}
      aria-live="polite"
    >
      {content}
    </LoadingStateContainer>
  );
};

LoadingState.displayName = 'LoadingState';

export default LoadingState;
