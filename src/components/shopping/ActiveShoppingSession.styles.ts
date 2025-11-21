/**
 * ActiveShoppingSession Component Styles
 */

import styled, { keyframes } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.colors.background.default};
`;

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[12]} 0;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${({ theme }) => theme.colors.border.light};
  border-top-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Header = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface StatValueProps {
  $highlight?: boolean;
  $primary?: boolean;
}

export const StatValue = styled.span<StatValueProps>`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $highlight, $primary }) => {
    if ($highlight) return theme.colors.functional.bestPrice.main;
    if ($primary) return theme.colors.primary[500];
    return theme.colors.text.primary;
  }};
`;

export const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ProgressLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ProgressPercentage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.functional.bestPrice.main};
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
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

export const ItemsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const AddProductButton = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.background.paper};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

// Modal Content Styles
export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]} 0;
`;

interface ModalIconProps {
  $success?: boolean;
  $error?: boolean;
}

export const ModalIcon = styled.div<ModalIconProps>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $success, $error }) => {
    if ($success) return `${theme.colors.functional.bestPrice.light}20`;
    if ($error) return `${theme.colors.functional.highPrice.light}20`;
    return theme.colors.background.default;
  }};

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme, $success, $error }) => {
      if ($success) return theme.colors.functional.bestPrice.main;
      if ($error) return theme.colors.functional.highPrice.main;
      return theme.colors.text.primary;
    }};
  }
`;

export const ModalText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin: 0;
`;

export const ModalStats = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const ModalStatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }
`;

export const ModalWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.secondary[200]}20;
  border: 1px solid ${({ theme }) => theme.colors.secondary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.secondary[700]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;
