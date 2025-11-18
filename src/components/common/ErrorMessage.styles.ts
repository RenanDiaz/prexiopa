/**
 * Styled Components para ErrorMessage
 *
 * Estilos para mensajes de error, warning e info con variantes
 */

import styled from 'styled-components';

export interface ErrorContainerProps {
  $variant: 'error' | 'warning' | 'info';
}

const variantStyles = {
  error: {
    background: '#FEE',
    border: '#F44336',
    text: '#C62828',
    icon: '#F44336',
  },
  warning: {
    background: '#FFF8E1',
    border: '#FF9800',
    text: '#E65100',
    icon: '#FF9800',
  },
  info: {
    background: '#E3F2FD',
    border: '#2196F3',
    text: '#1565C0',
    icon: '#2196F3',
  },
};

export const ErrorContainer = styled.div<ErrorContainerProps>`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $variant }) => variantStyles[$variant].border};
  background-color: ${({ $variant }) => variantStyles[$variant].background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    padding: ${({ theme }) => theme.spacing[3]};
    gap: ${({ theme }) => theme.spacing[2]};
  }
`;

export const IconWrapper = styled.div<ErrorContainerProps>`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  color: ${({ $variant }) => variantStyles[$variant].icon};
  font-size: 1.25rem;
  margin-top: 2px;

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 640px) {
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0; /* Para permitir text-overflow */
`;

export const ErrorTitle = styled.h4<ErrorContainerProps>`
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  color: ${({ $variant }) => variantStyles[$variant].text};

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

export const ErrorText = styled.p<ErrorContainerProps>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ $variant }) => variantStyles[$variant].text};
  word-wrap: break-word;

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

export const ActionsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;

  @media (max-width: 640px) {
    margin-top: ${({ theme }) => theme.spacing[2]};
  }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.semantic.error.main : 'transparent'};
  color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.semantic.error.contrast : theme.colors.semantic.error.main};
  border: 1px solid ${({ theme }) => theme.colors.semantic.error.main};

  &:hover:not(:disabled) {
    background-color: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.semantic.error.dark : 'rgba(244, 67, 54, 0.08)'};
    border-color: ${({ theme }) => theme.colors.semantic.error.dark};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.semantic.error.main};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 640px) {
    padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

export const DismissButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.12);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
