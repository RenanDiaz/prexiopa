/**
 * PriceAlert Component
 *
 * A form/modal component for users to create or edit price alerts.
 * Allows setting a target price and optionally selecting a specific store.
 *
 * @example
 * ```tsx
 * // To create a new alert for a product
 * <PriceAlert productId="some-product-id" onClose={() => setShowModal(false)} />
 *
 * // To edit an existing alert
 * <PriceAlert alertId="some-alert-id" productId="some-product-id" onClose={() => setShowModal(false)} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiBell, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Components
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal'; // Assuming a Modal component exists
import { LoadingSpinner } from '@/components/common/LoadingSpinner'; // Assuming a LoadingSpinner component exists
import { Select } from '@/components/common/Select'; // Assuming a Select component exists for stores

// Hooks
import { useProductQuery } from '@/hooks/useProducts';
import { useStoresQuery } from '@/hooks/useStores';
import {
  useAlertQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
} from '@/hooks/useAlerts';
import { useAuthStore } from '@/store/authStore';

const PriceAlertForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.semantic.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

export interface PriceAlertProps {
  /** ID del producto para el cual crear/editar la alerta */
  productId: string;
  /** ID de la alerta existente para editar (opcional) */
  alertId?: string;
  /** Callback para cerrar el componente (ej. un modal) */
  onClose: () => void;
  /** Callback que se ejecuta al guardar la alerta */
  onSave?: (alertId: string) => void;
  /** Si el componente se muestra dentro de un modal (para manejar visibilidad del modal) */
  isOpen?: boolean;
}

/**
 * PriceAlert component for creating and editing price alerts.
 *
 * Features:
 * - Input for target price
 * - Dropdown to select a specific store or 'all stores'
 * - Creates a new alert or updates an existing one
 * - Integrated with React Query for mutations
 * - Uses common Input, Button, Modal, Select components
 * - Handles loading and error states
 * - Requires authentication
 *
 * @component
 */
export const PriceAlert: React.FC<PriceAlertProps> = ({
  productId,
  alertId,
  onClose,
  onSave,
  isOpen, // Used if component is rendered inside a Modal that controls its own visibility
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const { data: product, isLoading: isLoadingProduct } = useProductQuery(productId);
  const { data: stores = [], isLoading: isLoadingStores } = useStoresQuery();

  const { data: existingAlert, isLoading: isLoadingAlert } = useAlertQuery(alertId || '');

  const createMutation = useCreateAlertMutation();
  const updateMutation = useUpdateAlertMutation();

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const globalLoading = isLoadingProduct || isLoadingStores || isLoadingAlert;

  useEffect(() => {
    if (existingAlert) {
      setTargetPrice(existingAlert.target_price);
      setSelectedStore(existingAlert.store_id || null);
    }
  }, [existingAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para crear alertas.');
      return;
    }
    if (!targetPrice || targetPrice <= 0) {
      toast.error('Por favor, ingresa un precio objetivo válido.');
      return;
    }

    try {
      if (alertId && existingAlert) {
        // Update existing alert
        const updated = await updateMutation.mutateAsync({
          id: alertId,
          input: {
            target_price: targetPrice,
            store_id: selectedStore,
          },
        });
        onSave?.(updated.id);
        toast.success('Alerta actualizada con éxito.');
      } else {
        // Create new alert
        const newId = await createMutation.mutateAsync({
          product_id: productId,
          target_price: targetPrice,
          store_id: selectedStore,
        });
        onSave?.(newId.id);
        toast.success('Alerta creada con éxito.');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la alerta.');
    }
  };

  // Prepare store options for the Select component
  const storeOptions = [
    { value: '', label: 'Todas las tiendas' },
    ...stores.map((store) => ({ value: store.id, label: store.name })),
  ];

  // If used inside a Modal, control its visibility
  const modalContent = globalLoading ? (
    <LoadingWrapper>
      <LoadingSpinner />
      <p>Cargando...</p>
    </LoadingWrapper>
  ) : (
    <PriceAlertForm onSubmit={handleSubmit}>
      <Input
        label={`Precio objetivo para ${product?.name || 'producto'}`}
        type="number"
        value={targetPrice}
        onChange={(e) => setTargetPrice(parseFloat(e.target.value) || '')}
        placeholder="Ej: 15.99"
        iconLeft={<FiDollarSign />}
        min={0.01}
        step={0.01}
        fullWidth
        required
      />

      <Select
        label="Tienda específica (opcional)"
        options={storeOptions}
        value={selectedStore || ''}
        onChange={(e) => setSelectedStore(e.target.value || null)}
        fullWidth
      />

      {createMutation.error && <ErrorText>{createMutation.error.message}</ErrorText>}
      {updateMutation.error && <ErrorText>{updateMutation.error.message}</ErrorText>}

      <FormActions>
        <Button variant="ghost" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" />
              Guardando...
            </>
          ) : alertId ? (
            'Actualizar Alerta'
          ) : (
            'Crear Alerta'
          )}
        </Button>
      </FormActions>
    </PriceAlertForm>
  );

  return (
    <Modal
      isOpen={isOpen === undefined ? true : isOpen} // Assume always open if not controlled by parent
      onClose={onClose}
      title={alertId ? 'Editar Alerta de Precio' : 'Crear Alerta de Precio'}
      icon={<FiBell />}
    >
      {modalContent}
    </Modal>
  );
};

PriceAlert.displayName = 'PriceAlert';

export default PriceAlert;
