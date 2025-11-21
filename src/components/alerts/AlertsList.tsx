/**
 * AlertsList Component
 *
 * Displays a list of user's price alerts with management actions.
 * Shows current price vs target price, savings, and alert status.
 *
 * @example
 * ```tsx
 * <AlertsList />
 * ```
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaBellSlash, FaEdit, FaTrash, FaStore, FaChartLine } from 'react-icons/fa';
import { useAlertsSummaryQuery, useDeleteAlertMutation, useToggleAlertActiveMutation } from '../../hooks/useAlerts';
import EmptyState from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
// import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PriceAlert } from './PriceAlert';
import type { AlertSummary } from '../../services/supabase/alerts';
import * as S from './AlertsList.styles';

/**
 * AlertsList Component
 */
export const AlertsList: React.FC = () => {
  const { data: alerts = [], isLoading, error } = useAlertsSummaryQuery();
  const deleteMutation = useDeleteAlertMutation();
  const toggleMutation = useToggleAlertActiveMutation();

  const [editingAlert, setEditingAlert] = useState<AlertSummary | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle delete alert
  const handleDelete = async (alertId: string, productName: string) => {
    if (window.confirm(`¿Eliminar alerta para "${productName}"?`)) {
      await deleteMutation.mutateAsync(alertId);
    }
  };

  // Handle toggle alert
  const handleToggle = async (alertId: string) => {
    await toggleMutation.mutateAsync(alertId);
  };

  // Handle edit alert
  const handleEdit = (alert: AlertSummary) => {
    setEditingAlert(alert);
    setIsEditModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <S.Container>
        <S.LoadingWrapper>
          <LoadingSpinner size="lg" />
          <S.LoadingText>Cargando alertas...</S.LoadingText>
        </S.LoadingWrapper>
      </S.Container>
    );
  }

  // Error state
  if (error) {
    return (
      <S.Container>
        <EmptyState
          icon={FaBell}
          title="Error al cargar alertas"
          message={error.message || 'Ocurrió un error al cargar tus alertas'}
        />
      </S.Container>
    );
  }

  // Empty state
  if (alerts.length === 0) {
    return (
      <S.Container>
        <EmptyState
          icon={FaBell}
          title="No tienes alertas"
          message="Crea alertas de precio para recibir notificaciones cuando los productos lleguen a tu precio objetivo"
        />
      </S.Container>
    );
  }

  // Calculate stats
  const activeAlerts = alerts.filter((a) => a.should_notify);
  const totalSavings = alerts.reduce((sum, alert) => {
    return sum + (alert.price_diff > 0 ? alert.price_diff : 0);
  }, 0);

  return (
    <>
      <S.Container>
        {/* Stats Header */}
        <S.StatsBar>
          <S.StatCard>
            <S.StatIcon $color="primary">
              <FaBell />
            </S.StatIcon>
            <S.StatContent>
              <S.StatValue>{alerts.length}</S.StatValue>
              <S.StatLabel>Alertas Totales</S.StatLabel>
            </S.StatContent>
          </S.StatCard>

          <S.StatCard>
            <S.StatIcon $color="success">
              <FaChartLine />
            </S.StatIcon>
            <S.StatContent>
              <S.StatValue>{activeAlerts.length}</S.StatValue>
              <S.StatLabel>Listas para activar</S.StatLabel>
            </S.StatContent>
          </S.StatCard>

          <S.StatCard>
            <S.StatIcon $color="warning">
              <FaStore />
            </S.StatIcon>
            <S.StatContent>
              <S.StatValue>${totalSavings.toFixed(2)}</S.StatValue>
              <S.StatLabel>Ahorro potencial</S.StatLabel>
            </S.StatContent>
          </S.StatCard>
        </S.StatsBar>

        {/* Alerts List */}
        <S.AlertsGrid>
          {alerts.map((alert) => {
            const priceMet = alert.current_price <= alert.target_price;
            const savingsAmount = alert.target_price - alert.current_price;
            const savingsPercentage = alert.current_price > 0
              ? ((savingsAmount / alert.current_price) * 100).toFixed(0)
              : 0;

            return (
              <S.AlertCard key={alert.alert_id}>
                {/* Product Info */}
                <S.ProductSection>
                  <S.ProductImage
                    src={alert.product_image}
                    alt={alert.product_name}
                    loading="lazy"
                  />
                  <S.ProductInfo>
                    <S.ProductName
                      as={Link}
                      to={`/products/${alert.alert_id.split('_')[0]}`}
                    >
                      {alert.product_name}
                    </S.ProductName>
                    {alert.store_name && (
                      <S.StoreBadge>
                        <FaStore />
                        {alert.store_name}
                      </S.StoreBadge>
                    )}
                  </S.ProductInfo>
                </S.ProductSection>

                {/* Price Info */}
                <S.PriceSection>
                  <S.PriceRow>
                    <S.PriceLabel>Precio actual:</S.PriceLabel>
                    <S.CurrentPrice>${alert.current_price.toFixed(2)}</S.CurrentPrice>
                  </S.PriceRow>
                  <S.PriceRow>
                    <S.PriceLabel>Precio objetivo:</S.PriceLabel>
                    <S.TargetPrice>${alert.target_price.toFixed(2)}</S.TargetPrice>
                  </S.PriceRow>
                </S.PriceSection>

                {/* Status Badge */}
                <S.StatusSection>
                  {priceMet ? (
                    <Badge variant="success" size="md">
                      ¡Precio alcanzado!
                    </Badge>
                  ) : savingsAmount > 0 ? (
                    <S.SavingsInfo>
                      <S.SavingsLabel>Falta:</S.SavingsLabel>
                      <S.SavingsAmount>
                        ${Math.abs(savingsAmount).toFixed(2)}
                        <S.SavingsPercent>({savingsPercentage}%)</S.SavingsPercent>
                      </S.SavingsAmount>
                    </S.SavingsInfo>
                  ) : (
                    <Badge variant="warning" size="md">
                      Precio por encima
                    </Badge>
                  )}
                </S.StatusSection>

                {/* Actions */}
                <S.Actions>
                  <S.ActionButton
                    onClick={() => handleEdit(alert)}
                    title="Editar alerta"
                    aria-label="Editar alerta"
                  >
                    <FaEdit />
                  </S.ActionButton>

                  <S.ActionButton
                    onClick={() => handleToggle(alert.alert_id)}
                    disabled={toggleMutation.isPending}
                    title={priceMet ? 'Desactivar alerta' : 'Activar alerta'}
                    aria-label={priceMet ? 'Desactivar alerta' : 'Activar alerta'}
                  >
                    {priceMet ? <FaBellSlash /> : <FaBell />}
                  </S.ActionButton>

                  <S.ActionButton
                    $variant="danger"
                    onClick={() => handleDelete(alert.alert_id, alert.product_name)}
                    disabled={deleteMutation.isPending}
                    title="Eliminar alerta"
                    aria-label="Eliminar alerta"
                  >
                    <FaTrash />
                  </S.ActionButton>
                </S.Actions>

                {/* Created date */}
                <S.AlertDate>
                  Creada: {new Date(alert.created_at).toLocaleDateString('es-PA')}
                </S.AlertDate>
              </S.AlertCard>
            );
          })}
        </S.AlertsGrid>
      </S.Container>

      {/* Edit Modal */}
      {editingAlert && (
        <PriceAlert
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAlert(null);
          }}
          productId={editingAlert.alert_id.split('_')[0]} // Extract product ID
          productName={editingAlert.product_name}
          currentPrice={editingAlert.current_price}
          storeName={editingAlert.store_name}
          initialAlert={{
            id: editingAlert.alert_id,
            user_id: '',
            product_id: editingAlert.alert_id.split('_')[0],
            store_id: null,
            target_price: editingAlert.target_price,
            active: true,
            notified_at: null,
            created_at: editingAlert.created_at,
            updated_at: editingAlert.created_at,
          }}
          mode="edit"
        />
      )}
    </>
  );
};

export default AlertsList;
