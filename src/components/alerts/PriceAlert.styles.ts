import styled from 'styled-components';
import { LoadingSpinner as BaseLoadingSpinner } from '@/components/common/LoadingSpinner';

export const PriceAlertForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

export const LoadingSpinner = styled(BaseLoadingSpinner)`
  color: ${({ theme }) => theme.colors.primary[500]};
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.semantic.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;
