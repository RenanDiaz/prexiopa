/**
 * Modal Styles
 * Styled-components for Modal component using theme system
 */

import styled, { css, keyframes } from 'styled-components';
import type { ModalProps } from './Modal';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.overlay};
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 200ms ease-out;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[2]};
    align-items: flex-end;
  }
`;

const sizeStyles = {
  sm: css`
    max-width: 400px;
  `,
  md: css`
    max-width: 600px;
  `,
  lg: css`
    max-width: 800px;
  `,
  full: css`
    max-width: 95vw;
    max-height: 95vh;
  `,
};

interface ModalWrapperProps {
  size: NonNullable<ModalProps['size']>;
}

export const ModalWrapper = styled.div<ModalWrapperProps>`
  position: relative;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.modal};
  box-shadow: ${({ theme }) => theme.shadows.modal};
  animation: ${slideUp} 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
  overflow: hidden;

  ${({ size }) => sizeStyles[size]}

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    max-height: 85vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[200]};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

export const CloseIcon = styled.span`
  font-size: 1.5rem;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

export const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[6]};
  padding-right: ${({ theme }) => theme.spacing[12]}; /* Space for close button */
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
    padding-right: ${({ theme }) => theme.spacing[10]};
  }
`;

export const ModalBody = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]};
  overflow-y: auto;
  color: ${({ theme }) => theme.colors.text.primary};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral[300]};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.neutral[400]};
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;
