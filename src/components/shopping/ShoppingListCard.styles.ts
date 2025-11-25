/**
 * ShoppingListCard Component Styles
 */

import styled from 'styled-components';

interface CardProps {
  $clickable?: boolean;
}

export const Card = styled.div<CardProps>`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  transition: all 0.2s ease;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  ${({ $clickable, theme }) =>
    $clickable &&
    `
    &:hover {
      border-color: ${theme.colors.primary[500]};
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  `}

  &:active {
    transform: ${({ $clickable }) => ($clickable ? 'translateY(0)' : 'none')};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

interface StatusBadgeProps {
  $status: 'in_progress' | 'completed' | 'cancelled';
}

export const StatusBadge = styled.div<StatusBadgeProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  ${({ $status, theme }) => {
    switch ($status) {
      case 'in_progress':
        return `
          background: ${theme.colors.primary[100]}20;
          color: ${theme.colors.primary[500]};
        `;
      case 'completed':
        return `
          background: ${theme.colors.functional.bestPrice.light}20;
          color: ${theme.colors.functional.bestPrice.main};
        `;
      case 'cancelled':
        return `
          background: ${theme.colors.functional.highPrice.light}20;
          color: ${theme.colors.functional.highPrice.main};
        `;
    }
  }}

  svg {
    width: 14px;
    height: 14px;
  }
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
    width: 18px;
    height: 18px;
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

export const StoreName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`;

export const DateText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ItemsInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ItemsCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const PurchasedCount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.functional.bestPrice.main};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

interface ProgressBarProps {
  $progress: number;
}

export const ProgressBar = styled.div<ProgressBarProps>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.colors.functional.bestPrice.main};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.3s ease;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const TotalLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const TotalAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

// Phase 5.3 - Mode Badge
interface ModeBadgeProps {
  $mode: 'planning' | 'completed';
}

export const ModeBadge = styled.span<ModeBadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ $mode, theme }) =>
    $mode === 'planning'
      ? `
        background: ${theme.colors.secondary[100]};
        color: ${theme.colors.secondary[700]};
      `
      : `
        background: ${theme.colors.functional.bestPrice.light};
        color: ${theme.colors.functional.bestPrice.main};
      `}

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const HeaderBadges = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;
