import styled from 'styled-components';
import { LoadingSpinner as BaseLoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';

export const AlertsListContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const AlertsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const AlertsTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ClearAllButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
`;

export const AlertItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease;
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.6)};
  background: ${({ theme, $isActive }) => ($isActive ? theme.colors.background.default : theme.colors.neutral[50])};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
`;

export const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  object-fit: cover;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.neutral[100]};
`;

export const TextInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const AlertDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
`;

export const DetailItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  white-space: nowrap;

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

export const AlertActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const ActionButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[2]};
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

export const LoadingText = styled.p`
  margin: 0;
`;

export const LoadingSpinner = styled(BaseLoadingSpinner)`
  color: ${({ theme }) => theme.colors.primary[500]};
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const EmptyStateIcon = styled.div`
  font-size: 64px;
  color: ${({ theme }) => theme.colors.text.hint};
`;

export const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const EmptyStateMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 500px;
`;
