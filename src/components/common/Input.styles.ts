/**
 * Input Styles
 * Styled-components for Input component using theme system
 */

import styled, { css } from 'styled-components';

export const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

export const Label = styled.label<{ disabled?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.text.disabled : theme.colors.text.primary};
  transition: color 200ms ease;
`;

const sizeStyles = {
  sm: css`
    height: ${({ theme }) => theme.components.input.height.small};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  md: css`
    height: ${({ theme }) => theme.components.input.height.medium};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  `,
  lg: css`
    height: ${({ theme }) => theme.components.input.height.large};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
};

export const InputContainer = styled.div<{
  hasError?: boolean;
  hasSuccess?: boolean;
  disabled?: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  ${({ size }) => sizeStyles[size]}
  background: ${({ theme }) => theme.colors.background.paper};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  transition: all 200ms ease;

  ${({ hasError, theme }) => hasError && css`
    border-color: ${theme.colors.semantic.error.main};
  `}

  ${({ hasSuccess, theme }) => hasSuccess && css`
    border-color: ${theme.colors.semantic.success.main};
  `}

  ${({ disabled, theme }) => disabled && css`
    background: ${theme.colors.background.disabled};
    border-color: ${theme.colors.border.light};
    cursor: not-allowed;
  `}

  &:focus-within:not([disabled]) {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.semantic.error.main : theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${({ theme, hasError }) =>
      hasError ? theme.colors.semantic.error.main + '20' : theme.colors.border.focus + '20'};
  }

  &:hover:not(:focus-within):not([disabled]) {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

export const StyledInput = styled.input<{
  hasIconLeft?: boolean;
  hasIconRight?: boolean;
}>`
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 ${({ theme }) => theme.components.input.padding};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  background: transparent;
  border: none;
  outline: none;

  ${({ hasIconLeft }) => hasIconLeft && css`
    padding-left: 0;
  `}

  ${({ hasIconRight }) => hasIconRight && css`
    padding-right: 0;
  `}

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }

  /* Remove spinner from number inputs */
  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }

  /* Remove default search input styles */
  &[type="search"]::-webkit-search-decoration,
  &[type="search"]::-webkit-search-cancel-button,
  &[type="search"]::-webkit-search-results-button,
  &[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }
`;

export const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ position, theme }) =>
    position === 'left' ? `0 0 0 ${theme.spacing[3]}` : `0 ${theme.spacing[3]} 0 0`};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.25em;
  line-height: 0;
  pointer-events: none;
`;

export const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: ${({ theme }) => theme.spacing[2]};
  padding: 0;
  background: ${({ theme }) => theme.colors.neutral[300]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.neutral[0]};
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[400]};
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

export const ClearIcon = styled.span`
  font-size: 1.25rem;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

export const HelperText = styled.span<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, error }) =>
    error ? theme.colors.semantic.error.main : theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  padding: 0 ${({ theme }) => theme.spacing[1]};
`;
