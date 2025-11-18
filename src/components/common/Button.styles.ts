/**
 * Button Styles
 * Styled-components for Button component using theme system
 */

import styled, { css, keyframes } from 'styled-components';
import type { ButtonProps } from './Button';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Base button styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all ${({ theme }) => theme.spacing[0]} ease;
  user-select: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Size variants
const sizeStyles = {
  sm: css`
    height: ${({ theme }) => theme.components.button.size.small.height};
    padding: ${({ theme }) => theme.components.button.size.small.padding};
    font-size: ${({ theme }) => theme.components.button.size.small.fontSize};
    border-radius: ${({ theme }) => theme.borderRadius.button};
  `,
  md: css`
    height: ${({ theme }) => theme.components.button.size.medium.height};
    padding: ${({ theme }) => theme.components.button.size.medium.padding};
    font-size: ${({ theme }) => theme.components.button.size.medium.fontSize};
    border-radius: ${({ theme }) => theme.borderRadius.button};
  `,
  lg: css`
    height: ${({ theme }) => theme.components.button.size.large.height};
    padding: ${({ theme }) => theme.components.button.size.large.padding};
    font-size: ${({ theme }) => theme.components.button.size.large.fontSize};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,
};

// Variant styles
const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.primary.contrast};
    box-shadow: ${({ theme }) => theme.shadows.sm};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[600]};
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[700]};
      box-shadow: ${({ theme }) => theme.shadows.sm};
      transform: translateY(0);
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary[500]};
    color: ${({ theme }) => theme.colors.secondary.contrast};
    box-shadow: ${({ theme }) => theme.shadows.sm};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.secondary[600]};
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.secondary[700]};
      box-shadow: ${({ theme }) => theme.shadows.sm};
      transform: translateY(0);
    }
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary[500]};
    border: 2px solid ${({ theme }) => theme.colors.primary[500]};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[50]};
      border-color: ${({ theme }) => theme.colors.primary[600]};
      color: ${({ theme }) => theme.colors.primary[600]};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[100]};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.neutral[100]};
    }

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.neutral[200]};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.semantic.error.main};
    color: ${({ theme }) => theme.colors.semantic.error.contrast};
    box-shadow: ${({ theme }) => theme.shadows.sm};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.semantic.error.dark};
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      box-shadow: ${({ theme }) => theme.shadows.sm};
      transform: translateY(0);
    }
  `,
};

interface StyledButtonProps {
  variant: NonNullable<ButtonProps['variant']>;
  size: NonNullable<ButtonProps['size']>;
  fullWidth?: boolean;
  loading?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  ${baseButtonStyles}
  ${({ size }) => sizeStyles[size]}
  ${({ variant }) => variantStyles[variant]}
  ${({ fullWidth }) => fullWidth && css`width: 100%;`}
  ${({ loading }) => loading && css`
    pointer-events: none;
  `}
`;

export const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25em;
  line-height: 0;
`;

export const ButtonText = styled.span<{ loading?: boolean }>`
  display: inline-flex;
  align-items: center;
  transition: opacity 200ms ease;
  ${({ loading }) => loading && css`
    opacity: 0;
  `}
`;

export const LoadingSpinner = styled.span`
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const Spinner = styled.span`
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;
