/**
 * LoadingSpinner Component
 *
 * A circular animated spinner for loading states.
 * Uses the spin animation from the theme system for smooth, continuous rotation.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" color="primary" />
 * <LoadingSpinner size="lg" color="white" />
 * ```
 */

import React from 'react';
import { SpinnerContainer, SpinnerCircle } from './LoadingSpinner.styles';

/**
 * Spinner size variants
 */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spinner color variants
 */
export type SpinnerColor = 'primary' | 'secondary' | 'white';

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Color variant of the spinner
   * @default 'primary'
   */
  color?: SpinnerColor;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Accessible label for screen readers
   * @default 'Loading'
   */
  ariaLabel?: string;
}

/**
 * LoadingSpinner component for indicating loading states
 *
 * Features:
 * - Multiple size options (sm: 16px, md: 24px, lg: 48px, xl: 64px)
 * - Color variants (primary, secondary, white)
 * - Smooth continuous animation using keyframes
 * - Fully accessible with ARIA labels
 * - Theme-integrated styling
 *
 * @component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  ariaLabel = 'Loading',
}) => {
  return (
    <SpinnerContainer
      className={className}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <SpinnerCircle size={size} color={color} />
      <span className="sr-only">{ariaLabel}</span>
    </SpinnerContainer>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
