/**
 * ShoppingItemCard Component Styles
 */

import styled from 'styled-components';

interface CardProps {
  $purchased: boolean;
  $readOnly: boolean;
}

export const Card = styled.div<CardProps>`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  transition: all 0.2s ease;
  cursor: ${({ $readOnly }) => ($readOnly ? 'default' : 'pointer')};

  ${({ $purchased }) =>
    $purchased &&
    `
    opacity: 0.7;
  `}

  ${({ $readOnly, theme }) =>
    !$readOnly &&
    `
    &:hover {
      border-color: ${theme.colors.primary[500]};
      box-shadow: ${theme.shadows.sm};
    }
  `}
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const CheckboxWrapper = styled.div`
  flex-shrink: 0;
`;

interface CheckboxProps {
  $checked: boolean;
}

export const Checkbox = styled.div<CheckboxProps>`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme, $checked }) =>
    $checked ? theme.colors.functional.bestPrice.main : theme.colors.border.main};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.functional.bestPrice.main : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: white;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    border-color: ${({ theme, $checked }) =>
      $checked ? theme.colors.functional.bestPrice.main : theme.colors.functional.bestPrice.main};
  }
`;

interface ProductInfoProps {
  $purchased: boolean;
}

export const ProductInfo = styled.div<ProductInfoProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};

  ${({ $purchased }) =>
    $purchased &&
    `
    text-decoration: line-through;
  `}
`;

export const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const UnitPrice = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Subtotal = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

export const StoreTag = styled.span`
  display: inline-block;
  width: fit-content;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.primary[100]}20;
  color: ${({ theme }) => theme.colors.primary[500]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const PromotionBadge = styled.span`
  display: inline-block;
  width: fit-content;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: #D1FAE5; // Green 100
  color: #065F46; // Green 800
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid #86EFAC; // Green 300
`;

export const Notes = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.disabled};
  margin: 0;
  font-style: italic;
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
`;

export const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[1]};
`;

export const QuantityButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary[100]}20;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const Quantity = styled.span`
  min-width: 24px;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: ${({ theme }) => theme.colors.functional.highPrice.light}20;
  color: ${({ theme }) => theme.colors.functional.highPrice.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.highPrice.light}40;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
