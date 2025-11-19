/**
 * LoadingSpinner Styles
 *
 * Styled components for the LoadingSpinner component.
 * Uses the spin keyframe animation from the theme system.
 */

import styled, { css } from 'styled-components';
import type { SpinnerSize, SpinnerColor } from './LoadingSpinner';
import { keyframes } from '../../styles/animations';

/**
 * Size configuration mapping
 */
const sizeMap: Record<SpinnerSize, string> = {
  sm: '16px',
  md: '24px',
  lg: '48px',
  xl: '64px',
};

/**
 * Border width based on size
 */
const borderWidthMap: Record<SpinnerSize, string> = {
  sm: '2px',
  md: '3px',
  lg: '4px',
  xl: '5px',
};

/**
 * Color configuration mapping
 */
const getSpinnerColor = (color: SpinnerColor) => css`
  ${({ theme }) => {
    switch (color) {
      case 'primary':
        return css`
          border-color: ${theme.colors.primary[500]};
          border-top-color: transparent;
        `;
      case 'secondary':
        return css`
          border-color: ${theme.colors.secondary[500]};
          border-top-color: transparent;
        `;
      case 'white':
        return css`
          border-color: ${theme.colors.neutral[0]};
          border-top-color: transparent;
        `;
      default:
        return css`
          border-color: ${theme.colors.primary[500]};
          border-top-color: transparent;
        `;
    }
  }}
`;

/**
 * Container for spinner with flex centering
 */
export const SpinnerContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Screen reader only class for accessibility */
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
 * Spinner circle with rotation animation
 */
export const SpinnerCircle = styled.div<{
  size: SpinnerSize;
  color: SpinnerColor;
}>`
  /* Inject spin keyframes */
  ${keyframes.spin}

  /* Size configuration */
  width: ${(props) => sizeMap[props.size]};
  height: ${(props) => sizeMap[props.size]};

  /* Border styling */
  border: ${(props) => borderWidthMap[props.size]} solid;
  border-radius: ${({ theme }) => theme.borderRadius.full};

  /* Color styling */
  ${(props) => getSpinnerColor(props.color)}

  /* Animation */
  animation: spin 1s linear infinite;

  /* Performance optimization */
  will-change: transform;
`;
