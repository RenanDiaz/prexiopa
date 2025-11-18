/**
 * Skeleton Component
 *
 * A skeleton loader for placeholder content while data is loading.
 * Provides smooth shimmer animation for better perceived performance.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="200px" />
 * <Skeleton variant="circle" width="48px" height="48px" />
 * <Skeleton variant="rectangle" width="100%" height="200px" />
 * <Skeleton variant="text" count={3} />
 * ```
 */

import React from 'react';
import {
  SkeletonWrapper,
  SkeletonElement,
  SkeletonLine,
} from './Skeleton.styles';

/**
 * Skeleton variant types
 */
export type SkeletonVariant = 'text' | 'circle' | 'rectangle';

export interface SkeletonProps {
  /**
   * Visual variant of the skeleton
   * @default 'text'
   */
  variant?: SkeletonVariant;

  /**
   * Width of the skeleton
   * Can be any valid CSS width value
   * @default '100%'
   */
  width?: string | number;

  /**
   * Height of the skeleton
   * Can be any valid CSS height value
   * @default Determined by variant
   */
  height?: string | number;

  /**
   * Number of skeleton lines to render (for text variant)
   * @default 1
   */
  count?: number;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Animation type
   * @default 'shimmer'
   */
  animation?: 'shimmer' | 'pulse';
}

/**
 * Skeleton component for loading placeholders
 *
 * Features:
 * - Multiple variants (text, circle, rectangle)
 * - Customizable dimensions
 * - Multiple line support for text
 * - Shimmer and pulse animations
 * - Theme-integrated styling
 * - Fully accessible
 *
 * Use Cases:
 * - Loading product cards
 * - Loading user profiles
 * - Loading text content
 * - Loading images
 * - Loading list items
 *
 * @component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  className,
  animation = 'shimmer',
}) => {
  // Normalize dimensions
  const normalizedWidth = typeof width === 'number' ? `${width}px` : width;
  const normalizedHeight = height
    ? typeof height === 'number'
      ? `${height}px`
      : height
    : undefined;

  // For text variant with multiple lines
  if (variant === 'text' && count > 1) {
    return (
      <SkeletonWrapper className={className} role="status" aria-label="Loading content">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonLine
            key={index}
            width={normalizedWidth}
            height={normalizedHeight}
            animation={animation}
            isLast={index === count - 1}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </SkeletonWrapper>
    );
  }

  // Single skeleton element
  return (
    <SkeletonElement
      className={className}
      variant={variant}
      width={normalizedWidth}
      height={normalizedHeight}
      animation={animation}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </SkeletonElement>
  );
};

Skeleton.displayName = 'Skeleton';

export default Skeleton;
