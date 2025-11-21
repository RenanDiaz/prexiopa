/**
 * SearchAutocomplete Component Styles
 */

import styled from 'styled-components';

export const Container = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const Dropdown = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-height: 480px;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral[100]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral[400]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};

    &:hover {
      background: ${({ theme }) => theme.colors.neutral[500]};
    }
  }
`;

export const Section = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

export const ItemsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const LoadingText = styled.div`
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[4]}`};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Product Suggestions
interface ItemProps {
  $isSelected?: boolean;
}

export const SuggestionItem = styled.li<ItemProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  cursor: pointer;
  transition: background-color 0.15s ease;
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary[50] : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[50]};
  }

  &:active {
    background: ${({ theme }) => theme.colors.primary[100]};
  }
`;

export const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.neutral[100]};
  flex-shrink: 0;
`;

export const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const ProductName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProductBrand = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProductCategory = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.primary[600]};
  background: ${({ theme }) => theme.colors.primary[50]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
`;

// History Items
export const HistoryItem = styled.li<ItemProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  cursor: pointer;
  transition: background-color 0.15s ease;
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.neutral[100] : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }

  &:active {
    background: ${({ theme }) => theme.colors.neutral[200]};
  }
`;

export const HistoryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-shrink: 0;

  svg {
    font-size: 16px;
  }
`;

export const HistoryText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`;

// Popular Items
export const PopularItem = styled.li<ItemProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  cursor: pointer;
  transition: background-color 0.15s ease;
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.secondary[50] : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary[50]};
  }

  &:active {
    background: ${({ theme }) => theme.colors.secondary[100]};
  }
`;

export const PopularIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.secondary[100]};
  color: ${({ theme }) => theme.colors.secondary[700]};
  flex-shrink: 0;

  svg {
    font-size: 16px;
  }
`;

export const PopularText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  flex: 1;
`;

// No Results
export const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[8]} ${theme.spacing[4]}`};
  text-align: center;
`;

export const NoResultsIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.text.hint};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  svg {
    font-size: 24px;
  }
`;

export const NoResultsText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const NoResultsHint = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
