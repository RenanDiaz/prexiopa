/**
 * EditItemModal Component
 * Modal para editar cantidad y precio unitario de un item de la lista de compras
 */

import { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { ShoppingItem } from '@/services/supabase/shopping';

const ModalContent = styled.div`
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

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
`;

const CalculationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const CalculationLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CalculationValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

const WarningText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.warning.main};
  margin: 0;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.semantic.warning.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.semantic.warning.main};
`;

export interface EditItemModalProps {
  isOpen: boolean;
  item: ShoppingItem;
  onClose: () => void;
  onSave: (itemId: string, quantity: number, price: number) => Promise<void>;
}

export const EditItemModal = ({
  isOpen,
  item,
  onClose,
  onSave,
}: EditItemModalProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [price, setPrice] = useState(item.price);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ quantity?: string; price?: string }>({});

  // Reset form cuando cambia el item
  useEffect(() => {
    setQuantity(item.quantity);
    setPrice(item.price);
    setErrors({});
  }, [item]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const validateForm = (): boolean => {
    const newErrors: { quantity?: string; price?: string } = {};

    if (quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (price <= 0) {
      newErrors.price = 'El precio debe ser mayor a $0';
    }

    if (price > 10000) {
      newErrors.price = 'El precio parece ser demasiado alto. Verifica el valor.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(item.id, quantity, price);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setQuantity(num);
      setErrors((prev) => ({ ...prev, quantity: undefined }));
    }
  };

  const handlePriceChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setPrice(num);
      setErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const subtotal = quantity * price;
  const hasChanges = quantity !== item.quantity || price !== item.price;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header>
        <FiEdit2 /> Editar Producto
      </Modal.Header>

      <Modal.Body>
        <ModalContent>
          <ProductName>{item.product_name}</ProductName>

          {item.store_name && (
            <WarningText>
              <strong>Tienda:</strong> {item.store_name}
            </WarningText>
          )}

          <FormGroup>
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              min="0.01"
              step="1"
              error={errors.quantity}
              placeholder="Ej: 2"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="price">Precio Unitario</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              min="0.01"
              step="0.01"
              error={errors.price}
              placeholder="Ej: 5.99"
            />
            {item.price !== price && (
              <WarningText>
                Precio original: {formatPrice(item.price)}
              </WarningText>
            )}
          </FormGroup>

          <CalculationRow>
            <CalculationLabel>Subtotal de línea:</CalculationLabel>
            <CalculationValue>{formatPrice(subtotal)}</CalculationValue>
          </CalculationRow>

          {hasChanges && (
            <WarningText>
              <strong>Nota:</strong> Al guardar, se actualizará el total de la sesión de compras.
            </WarningText>
          )}
        </ModalContent>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!hasChanges}
        >
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
