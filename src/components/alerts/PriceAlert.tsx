/**
 * PriceAlert Component
 *
 * Modal form to create or edit price alerts for products.
 * Allows users to set target prices and get notified when prices drop.
 *
 * @example
 * ```tsx
 * // Create new alert
 * <PriceAlert
 *   open={isOpen}
 *   onClose={handleClose}
 *   productId="123"
 *   productName="Leche Super99"
 *   currentPrice={3.50}
 * />
 *
 * // Edit existing alert
 * <PriceAlert
 *   open={isOpen}
 *   onClose={handleClose}
 *   productId="123"
 *   productName="Leche Super99"
 *   currentPrice={3.50}
 *   initialAlert={existingAlert}
 *   mode="edit"
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FaBell, FaChartLine } from 'react-icons/fa';
import { useCreateAlertMutation, useUpdateAlertMutation } from '../../hooks/useAlerts';
import type { Alert, CreateAlertInput, UpdateAlertInput } from '../../services/supabase/alerts';
import * as S from './PriceAlert.styles';

export interface PriceAlertProps {
  /**
   * Controls modal visibility
   */
  open: boolean;

  /**
   * Callback when modal closes
   */
  onClose: () => void;

  /**
   * Product ID to create alert for
   */
  productId: string;

  /**
   * Product name for display
   */
  productName: string;

  /**
   * Current lowest price for reference
   */
  currentPrice?: number;

  /**
   * Store ID (optional, for store-specific alerts)
   */
  storeId?: string | null;

  /**
   * Store name for display
   */
  storeName?: string;

  /**
   * Existing alert for editing
   */
  initialAlert?: Alert;

  /**
   * Mode: create or edit
   */
  mode?: 'create' | 'edit';
}

/**
 * PriceAlert Modal Component
 */
export const PriceAlert: React.FC<PriceAlertProps> = ({
  open,
  onClose,
  productId,
  productName,
  currentPrice,
  storeId = null,
  storeName,
  initialAlert,
  mode = 'create',
}) => {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ targetPrice?: string }>({});

  const createMutation = useCreateAlertMutation();
  const updateMutation = useUpdateAlertMutation();

  const isEditing = mode === 'edit' && initialAlert;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Initialize form with existing alert data
  useEffect(() => {
    if (initialAlert && mode === 'edit') {
      setTargetPrice(initialAlert.target_price?.toString() || '');
      setActive(initialAlert.active);
    } else {
      // Default to 10% below current price
      if (currentPrice) {
        const suggested = (currentPrice * 0.9).toFixed(2);
        setTargetPrice(suggested);
      }
      setActive(true);
    }
  }, [initialAlert, mode, currentPrice, open]);

  // Validate target price
  const validatePrice = (value: string): boolean => {
    const price = parseFloat(value);

    if (!value || isNaN(price)) {
      setErrors({ targetPrice: 'Ingresa un precio válido' });
      return false;
    }

    if (price <= 0) {
      setErrors({ targetPrice: 'El precio debe ser mayor a $0' });
      return false;
    }

    if (currentPrice && price >= currentPrice) {
      setErrors({ targetPrice: 'El precio objetivo debe ser menor al precio actual' });
      return false;
    }

    setErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePrice(targetPrice)) {
      return;
    }

    try {
      if (isEditing && initialAlert) {
        // Update existing alert
        const updateInput: UpdateAlertInput = {
          target_price: parseFloat(targetPrice),
          active,
        };

        await updateMutation.mutateAsync({
          id: initialAlert.id,
          input: updateInput,
        });
      } else {
        // Create new alert
        const createInput: CreateAlertInput = {
          product_id: productId,
          store_id: storeId,
          target_price: parseFloat(targetPrice),
        };

        await createMutation.mutateAsync(createInput);
      }

      handleClose();
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  };

  // Reset form and close
  const handleClose = () => {
    setTargetPrice('');
    setActive(true);
    setErrors({});
    onClose();
  };

  // Calculate potential savings
  const potentialSavings = currentPrice && targetPrice
    ? currentPrice - parseFloat(targetPrice)
    : 0;

  const savingsPercentage = currentPrice && potentialSavings > 0
    ? ((potentialSavings / currentPrice) * 100).toFixed(0)
    : 0;

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <Modal.Header>
        <S.HeaderContent>
          <S.IconWrapper>
            <FaBell />
          </S.IconWrapper>
          <div>
            <S.Title>
              {isEditing ? 'Editar Alerta de Precio' : 'Crear Alerta de Precio'}
            </S.Title>
            <S.Subtitle>{productName}</S.Subtitle>
            {storeName && <S.StoreTag>{storeName}</S.StoreTag>}
          </div>
        </S.HeaderContent>
      </Modal.Header>

      <Modal.Body>
        <S.Form onSubmit={handleSubmit}>
          {/* Current Price Info */}
          {currentPrice && (
            <S.PriceInfo>
              <S.PriceLabel>Precio actual más bajo:</S.PriceLabel>
              <S.CurrentPrice>${currentPrice.toFixed(2)}</S.CurrentPrice>
            </S.PriceInfo>
          )}

          {/* Target Price Input */}
          <S.InputGroup>
            <S.Label htmlFor="targetPrice">
              Precio objetivo <S.Required>*</S.Required>
            </S.Label>
            <S.InputWrapper>
              <S.CurrencySymbol>$</S.CurrencySymbol>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                min="0"
                value={targetPrice}
                onChange={(e) => {
                  setTargetPrice(e.target.value);
                  if (errors.targetPrice) {
                    validatePrice(e.target.value);
                  }
                }}
                onBlur={() => validatePrice(targetPrice)}
                placeholder="0.00"
                disabled={isLoading}
                aria-invalid={!!errors.targetPrice}
                aria-describedby={errors.targetPrice ? 'price-error' : undefined}
              />
            </S.InputWrapper>
            {errors.targetPrice && (
              <S.ErrorMessage id="price-error" role="alert">
                {errors.targetPrice}
              </S.ErrorMessage>
            )}
            <S.HelpText>
              Te notificaremos cuando el precio llegue o baje de este valor
            </S.HelpText>
          </S.InputGroup>

          {/* Potential Savings Display */}
          {potentialSavings > 0 && (
            <S.SavingsCard>
              <S.SavingsIcon>
                <FaChartLine />
              </S.SavingsIcon>
              <div>
                <S.SavingsLabel>Ahorro potencial:</S.SavingsLabel>
                <S.SavingsAmount>
                  ${potentialSavings.toFixed(2)}
                  <S.SavingsPercentage>({savingsPercentage}%)</S.SavingsPercentage>
                </S.SavingsAmount>
              </div>
            </S.SavingsCard>
          )}

          {/* Active Toggle (only in edit mode) */}
          {isEditing && (
            <S.ToggleGroup>
              <S.ToggleLabel>
                <S.Checkbox
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Alerta activa</span>
              </S.ToggleLabel>
              <S.ToggleHelpText>
                {active
                  ? 'Recibirás notificaciones cuando el precio llegue a tu objetivo'
                  : 'La alerta está pausada, no recibirás notificaciones'}
              </S.ToggleHelpText>
            </S.ToggleGroup>
          )}
        </S.Form>
      </Modal.Body>

      <Modal.Footer>
        <S.Actions>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!targetPrice || !!errors.targetPrice}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Alerta'}
          </Button>
        </S.Actions>
      </Modal.Footer>
    </Modal>
  );
};

export default PriceAlert;
