/**
 * ShoppingItemCard Component
 * Tarjeta para mostrar un item individual en la lista de compras
 */

import React from 'react';
import { FiCheck, FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import type { ShoppingItem } from '@/services/supabase/shopping';
import * as S from './ShoppingItemCard.styles';

export interface ShoppingItemCardProps {
  item: ShoppingItem;
  onTogglePurchased?: (itemId: string, purchased: boolean) => void;
  onIncrementQuantity?: (itemId: string) => void;
  onDecrementQuantity?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  item,
  onTogglePurchased,
  onIncrementQuantity,
  onDecrementQuantity,
  onDelete,
  readOnly = false,
  className,
}) => {
  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Calcular subtotal
  const subtotal = item.price * item.quantity;

  const handleTogglePurchased = () => {
    if (!readOnly && onTogglePurchased) {
      onTogglePurchased(item.id, !item.purchased);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly && onIncrementQuantity) {
      onIncrementQuantity(item.id);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly && onDecrementQuantity && item.quantity > 1) {
      onDecrementQuantity(item.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly && onDelete) {
      onDelete(item.id);
    }
  };

  return (
    <S.Card
      $purchased={item.purchased}
      $readOnly={readOnly}
      onClick={handleTogglePurchased}
      className={className}
    >
      <S.Content>
        {!readOnly && (
          <S.CheckboxWrapper>
            <S.Checkbox $checked={item.purchased}>
              {item.purchased && <FiCheck />}
            </S.Checkbox>
          </S.CheckboxWrapper>
        )}

        <S.ProductInfo $purchased={item.purchased}>
          <S.ProductName>{item.product_name}</S.ProductName>

          <S.PriceRow>
            <S.UnitPrice>
              {formatPrice(item.price)} × {item.quantity}
            </S.UnitPrice>
            <S.Subtotal>{formatPrice(subtotal)}</S.Subtotal>
          </S.PriceRow>

          {item.store_name && (
            <S.StoreTag>{item.store_name}</S.StoreTag>
          )}

          {item.notes && (
            <S.Notes>{item.notes}</S.Notes>
          )}
        </S.ProductInfo>

        {!readOnly && (
          <S.Actions onClick={(e) => e.stopPropagation()}>
            <S.QuantityControls>
              <S.QuantityButton
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                aria-label="Disminuir cantidad"
              >
                <FiMinus />
              </S.QuantityButton>

              <S.Quantity>{item.quantity}</S.Quantity>

              <S.QuantityButton
                onClick={handleIncrement}
                aria-label="Aumentar cantidad"
              >
                <FiPlus />
              </S.QuantityButton>
            </S.QuantityControls>

            <S.DeleteButton
              onClick={handleDelete}
              aria-label="Eliminar producto"
            >
              <FiTrash2 />
            </S.DeleteButton>
          </S.Actions>
        )}
      </S.Content>
    </S.Card>
  );
};
