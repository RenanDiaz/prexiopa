/**
 * AlertsList Component
 *
 * Displays a list of user's price alerts with their details.
 * Allows editing, toggling active status, and deleting alerts.
 *
 * @example
 * ```tsx
 * <AlertsList />
 * ```
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FiBell, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiTag } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Components
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { PriceAlert } from './PriceAlert'; // Re-use PriceAlert for editing

// Hooks
import { useAlertsManager, alertsKeys } from '@/hooks/useAlerts';
import { useQueryClient } from '@tanstack/react-query';

const AlertsListContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const AlertsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const AlertsTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AlertItem = styled.div<{ $isActive: boolean }>`
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

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  object-fit: cover;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.neutral[100]};
`;

const TextInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const AlertDetails = styled.div`
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

const DetailItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  white-space: nowrap;

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const AlertActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const ActionButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[2]};
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

export interface AlertsListProps {
  /** Test ID for testing */
  testId?: string;
  /** Filter alerts by product ID */
  productId?: string;
}

/**
 * AlertsList component for displaying and managing user's price alerts
 *
 * Features:
 * - Lists active and inactive alerts
 * - Allows toggling alert status (active/inactive)
 * - Allows editing alert target price/store
 * - Allows deleting alerts
 * - Integrated with React Query hooks for alerts management
 * - Empty state for no alerts
 * - Loading state with spinner
 * - Responsive design
 *
 * @component
 */
export const AlertsList: React.FC<AlertsListProps> = ({ testId = 'alerts-list', productId }) => {
  const { alerts, isLoading, isError, deleteAlert, toggleAlert } = useAlertsManager({ productId });
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleEdit = (alertId: string) => {
    setEditingAlertId(alertId);
  };

  const handleDelete = async (alertId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta alerta?')) {
      try {
        await deleteAlert(alertId);
        toast.success('Alerta eliminada con éxito.');
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar la alerta.');
      }
    }
  };

  const handleToggle = async (alertId: string) => {
    try {
      await toggleAlert(alertId);
      toast.success('Estado de alerta actualizado.');
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado de la alerta.');
    }
  };

  const handleAlertSave = (alertId: string) => {
    setEditingAlertId(null);
    queryClient.invalidateQueries({ queryKey: alertsKeys.list() }); // Refresh alerts list
  };

  if (isLoading) {
    return (
      <AlertsListContainer data-testid={`${testId}-loading`}>
        <LoadingWrapper>
          <LoadingSpinner />
          Cargando alertas...
        </LoadingWrapper>
      </AlertsListContainer>
    );
  }

  if (isError) {
    return (
      <AlertsListContainer data-testid={`${testId}-error`}>
        <EmptyState
          icon={FiAlertCircle}
          title="Error al cargar alertas"
          message="No pudimos cargar tus alertas. Por favor, inténtalo de nuevo más tarde."
        />
      </AlertsListContainer>
    );
  }

  if (alerts.length === 0) {
    return (
      <AlertsListContainer data-testid={`${testId}-empty`}>
        <EmptyState
          icon={FiBell}
          title="No tienes alertas de precio"
          message="Crea una alerta para recibir notificaciones cuando tus productos favoritos bajen de precio."
        />
      </AlertsListContainer>
    );
  }

  return (
    <AlertsListContainer data-testid={testId}>
      {alerts.map((alert) => (
        <AlertItem key={alert.id} $isActive={alert.active}>
          <ProductInfo>
            {alert.product?.image ? (
              <ProductImage src={alert.product.image} alt={alert.product.name} />
            ) : (
              <ProductImage as="div" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', color: '#666' }}>
                📦
              </ProductImage>
            )}
            <TextInfo>
              <ProductName>{alert.product?.name || 'Producto desconocido'}</ProductName>
              <AlertDetails>
                <DetailItem>
                  <FiTag />
                  Precio objetivo: <strong>${alert.target_price.toFixed(2)}</strong>
                </DetailItem>
                <DetailItem>
                  <FiTag />
                  Tienda: <strong>{alert.store?.name || 'Todas'}</strong>
                </DetailItem>
                <DetailItem>
                  <FiTag />
                  Creada: <strong>{format(new Date(alert.created_at), 'dd/MM/yyyy', { locale: es })}</strong>
                </DetailItem>
              </AlertDetails>
            </TextInfo>
          </ProductInfo>
          <AlertActions>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(alert.id)}
              aria-label="Editar alerta"
              title="Editar alerta"
            >
              <FiEdit />
            </ActionButton>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={() => handleToggle(alert.id)}
              aria-label={alert.active ? 'Desactivar alerta' : 'Activar alerta'}
              title={alert.active ? 'Desactivar alerta' : 'Activar alerta'}
            >
              {alert.active ? <FiToggleRight /> : <FiToggleLeft />}
            </ActionButton>
            <ActionButton
              variant="danger"
              size="sm"
              onClick={() => handleDelete(alert.id)}
              aria-label="Eliminar alerta"
              title="Eliminar alerta"
            >
              <FiTrash2 />
            </ActionButton>
          </AlertActions>
        </AlertItem>
      ))}

      {editingAlertId && (
        <PriceAlert
          productId={alerts.find(a => a.id === editingAlertId)?.product_id || ''}
          alertId={editingAlertId}
          onClose={() => setEditingAlertId(null)}
          onSave={handleAlertSave}
          isOpen={!!editingAlertId}
        />
      )}
    </AlertsListContainer>
  );
};

AlertsList.displayName = 'AlertsList';

export default AlertsList;
