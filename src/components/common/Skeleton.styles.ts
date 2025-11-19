/**
 * Skeleton Styles
 *
 * Styled components for the Skeleton component.
 * Uses shimmer animation from the theme system.
 */

import styled, { css, keyframes } from 'styled-components';
import { type SkeletonVariant } from './Skeleton';

/**
 * Default heights for each variant
 */
const defaultHeights: Record<SkeletonVariant, string> = {
  text: '1rem',
  circle: '48px',
  rectangle: '200px',
};

/**
 * Pulse animation for skeleton
 */
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

/**
 * Shimmer animation for skeleton loading
 */
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

/**
 * Get animation based on type
 */
const getAnimation = (animationType: 'shimmer' | 'pulse') => {
  if (animationType === 'pulse') {
    return css`
      animation: ${pulse} 1.5s ease-in-out infinite;
    `;
  }

  return css`
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.neutral[200]} 0%,
      ${({ theme }) => theme.colors.neutral[100]} 50%,
      ${({ theme }) => theme.colors.neutral[200]} 100%
    );
    background-size: 2000px 100%;
    animation: ${shimmer} 2s linear infinite;
  `;
};

/**
 * Base skeleton styles
 */
const baseSkeletonStyles = css<{
  width?: string;
  height?: string;
  animation: 'shimmer' | 'pulse';
}>`
  display: block;
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height};

  background-color: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.base};

  ${(props) => getAnimation(props.animation)}

  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

/**
 * Wrapper for multiple skeleton lines
 */
export const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;

  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

/**
 * Single skeleton element with variant support
 */
export const SkeletonElement = styled.div<{
  variant: SkeletonVariant;
  width?: string;
  height?: string;
  animation: 'shimmer' | 'pulse';
}>`
  ${baseSkeletonStyles}

  /* Variant-specific styles */
  ${(props) => {
    switch (props.variant) {
      case 'text':
        return css`
          height: ${props.height || defaultHeights.text};
          border-radius: ${({ theme }) => theme.borderRadius.sm};
        `;
      case 'circle':
        return css`
          width: ${props.width || defaultHeights.circle};
          height: ${props.height || props.width || defaultHeights.circle};
          border-radius: ${({ theme }) => theme.borderRadius.full};
          flex-shrink: 0;
        `;
      case 'rectangle':
        return css`
          height: ${props.height || defaultHeights.rectangle};
          border-radius: ${({ theme }) => theme.borderRadius.base};
        `;
      default:
        return '';
    }
  }}
`;

/**
 * Skeleton line for text variant with multiple lines
 */
export const SkeletonLine = styled.div<{
  width?: string;
  height?: string;
  animation: 'shimmer' | 'pulse';
  isLast?: boolean;
}>`
  ${baseSkeletonStyles}

  height: ${(props) => props.height || defaultHeights.text};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  /* Last line is typically shorter */
  ${(props) =>
    props.isLast &&
    css`
      width: ${props.width ? `calc(${props.width} * 0.8)` : '80%'};
    `}
`;
