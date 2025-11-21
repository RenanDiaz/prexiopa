/**
 * LoadingState Styles
 *
 * Styled components for the LoadingState component.
 * Includes overlay, content container, and text styling.
 */

import styled, { css, keyframes } from 'styled-components';
import { type SpinnerSize } from './LoadingSpinner';

/**
 * Fade in animation for loading state
 */
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Text animation with opacity pulse
 */
const textPulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

/**
 * Base container for inline loading states
 */
export const LoadingStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  width: 100%;
  min-height: 200px;
  animation: ${fadeIn} 0.3s ease-out;
`;

/**
 * Full-screen overlay with backdrop
 */
export const LoadingStateOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.background.overlay};
  backdrop-filter: blur(4px);

  animation: ${fadeIn} 0.2s ease-out;

  /* Prevent scrolling when overlay is active */
  overflow: hidden;
`;

/**
 * Content wrapper for spinner and text
 */
export const LoadingStateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};

  /* Ensure content stays above backdrop */
  position: relative;
  z-index: 1;
`;

/**
 * Loading text with size-based styling
 */
export const LoadingStateText = styled.p<{
  size: SpinnerSize;
  fullScreen: boolean;
}>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-align: center;

  /* Size-based font size */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`
          font-size: 0.75rem; /* 12px */
        `;
      case 'md':
        return css`
          font-size: 0.875rem; /* 14px */
        `;
      case 'lg':
        return css`
          font-size: 1rem; /* 16px */
        `;
      case 'xl':
        return css`
          font-size: 1.125rem; /* 18px */
        `;
      default:
        return css`
          font-size: 1rem;
        `;
    }
  }}

  /* Color based on context */
  ${({ theme, fullScreen }) =>
    fullScreen
      ? css`
          color: ${theme.colors.text.inverse};
        `
      : css`
          color: ${theme.colors.text.secondary};
        `}

  /* Subtle pulse animation */
  animation: ${textPulse} 2s ease-in-out infinite;

  /* Max width for long messages */
  max-width: 300px;

  /* Line height for readability */
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};

  @media (min-width: 768px) {
    max-width: 400px;
  }
`;
