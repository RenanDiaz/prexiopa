/**
 * PriceEntryForm Component
 * Formulario para registrar un nuevo precio con soporte para deals y promociones
 * Fase 5.2 - Enhanced Price Tracking
 */

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiTag, FiPercent, FiInfo } from 'react-icons/fi';
import { Input, PriceInput, Button } from '@/components/common';
import type { CreatePriceEntry } from '@/types/price.types';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const TotalDisplay = styled.div`
  background: ${({ theme }) => theme.colors.primary[50]};
  border: 2px solid ${({ theme }) => theme.colors.primary[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TotalAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[600]};
`;

const EffectivePrice = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.secondary[600]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const DealBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: ${({ theme }) => theme.colors.semantic.success.light};
  color: ${({ theme }) => theme.colors.semantic.success.dark};
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.info.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.info.dark};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export interface PriceEntryFormProps {
  productId: string;
  storeId: string;
  storeName?: string;
  onSubmit: (data: CreatePriceEntry) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialPrice?: number;
}

export const PriceEntryForm: React.FC<PriceEntryFormProps> = ({
  productId,
  storeId,
  storeName,
  onSubmit,
  onCancel,
  isLoading = false,
  initialPrice,
}) => {
  const [unitPrice, setUnitPrice] = useState<number>(initialPrice || 0);
  const [quantity, setQuantity] = useState<string>('1');
  const [discount, setDiscount] = useState<number>(0);
  const [isPromotion, setIsPromotion] = useState(false);
  const [notes, setNotes] = useState('');

  // Calculate totals
  const parsedQuantity = parseInt(quantity) || 1;

  const subtotal = unitPrice * parsedQuantity;
  const totalPrice = Math.max(0, subtotal - discount);
  const effectiveUnitPrice = parsedQuantity > 0 ? totalPrice / parsedQuantity : unitPrice;
  const savingsPercentage = subtotal > 0 && discount > 0
    ? Math.round((discount / subtotal) * 100)
    : 0;

  const isDeal = parsedQuantity > 1 || discount > 0 || isPromotion;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitPrice || unitPrice <= 0) {
      return;
    }

    const data: CreatePriceEntry = {
      product_id: productId,
      store_id: storeId,
      price: unitPrice,
      quantity: parsedQuantity,
      discount: discount,
      total_price: totalPrice,
      is_promotion: isPromotion,
      notes: notes.trim() || undefined,
    };

    await onSubmit(data);
  }, [productId, storeId, unitPrice, parsedQuantity, discount, totalPrice, isPromotion, notes, onSubmit]);

  // Auto-detect promotion based on discount or quantity
  useEffect(() => {
    if (parsedQuantity > 1 || discount > 0) {
      setIsPromotion(true);
    }
  }, [parsedQuantity, discount]);

  return (
    <FormContainer onSubmit={handleSubmit}>
      {storeName && (
        <InfoBox>
          <FiInfo size={16} />
          <span>Registrando precio en <strong>{storeName}</strong></span>
        </InfoBox>
      )}

      <Row>
        <FormGroup style={{ flex: 2 }}>
          <Label htmlFor="unit-price">Precio unitario ($) *</Label>
          <PriceInput
            id="unit-price"
            value={unitPrice}
            onChange={setUnitPrice}
            placeholder="$0.00"
            disabled={isLoading}
            autoFocus
            required
            label="Precio unitario"
          />
          <HelpText>Precio por unidad del producto</HelpText>
        </FormGroup>

        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            step="1"
            disabled={isLoading}
          />
          <HelpText>Para deals "2x1"</HelpText>
        </FormGroup>
      </Row>

      <Row>
        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="discount">Descuento ($)</Label>
          <PriceInput
            id="discount"
            value={discount}
            onChange={setDiscount}
            placeholder="$0.00"
            disabled={isLoading}
            label="Descuento"
          />
          <HelpText>Descuento aplicado al total</HelpText>
        </FormGroup>

        <FormGroup style={{ flex: 1 }}>
          <Label htmlFor="notes">Notas del deal</Label>
          <Input
            id="notes"
            type="text"
            placeholder="Ej: 2x1, 3 por $10"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
          <HelpText>Descripción de la oferta</HelpText>
        </FormGroup>
      </Row>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={isPromotion}
            onChange={(e) => setIsPromotion(e.target.checked)}
            disabled={isLoading}
          />
          <FiTag size={16} />
          Es precio promocional / oferta
        </CheckboxLabel>
      </FormGroup>

      {unitPrice > 0 && (
        <TotalDisplay>
          <TotalLabel>Precio total</TotalLabel>
          <TotalAmount>${totalPrice.toFixed(2)}</TotalAmount>

          {parsedQuantity > 1 && (
            <EffectivePrice>
              Precio efectivo: ${effectiveUnitPrice.toFixed(2)} por unidad
            </EffectivePrice>
          )}

          {isDeal && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {parsedQuantity > 1 && (
                <DealBadge>
                  <FiTag size={12} />
                  {parsedQuantity} por ${totalPrice.toFixed(2)}
                </DealBadge>
              )}
              {savingsPercentage > 0 && (
                <DealBadge>
                  <FiPercent size={12} />
                  {savingsPercentage}% de ahorro
                </DealBadge>
              )}
              {isPromotion && !discount && parsedQuantity === 1 && (
                <DealBadge>
                  <FiTag size={12} />
                  Oferta
                </DealBadge>
              )}
            </div>
          )}
        </TotalDisplay>
      )}

      <ButtonGroup>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            fullWidth
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={!unitPrice || unitPrice <= 0 || isLoading}
          loading={isLoading}
          fullWidth
        >
          Registrar Precio
        </Button>
      </ButtonGroup>
    </FormContainer>
  );
};

export default PriceEntryForm;
