/**
 * ShoppingListCard Component
 * Tarjeta para mostrar el resumen de una sesión de compras
 */

import React from 'react';
import { FiShoppingCart, FiMapPin, FiCalendar, FiDollarSign, FiCheck, FiX } from 'react-icons/fi';
import type { ShoppingSession } from '@/services/supabase/shopping';
import * as S from './ShoppingListCard.styles';

export interface ShoppingListCardProps {
  session: ShoppingSession;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  session,
  onClick,
  onDelete,
  className,
}) => {
  // Calcular estadísticas
  const totalItems = session.items?.length || 0;
  const purchasedItems = session.items?.filter((item) => item.purchased).length || 0;
  const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Verificar si es hoy
    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Verificar si es ayer
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Otra fecha
    return date.toLocaleDateString('es-PA', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Obtener icono de estado
  const getStatusIcon = () => {
    switch (session.status) {
      case 'completed':
        return <FiCheck />;
      case 'cancelled':
        return <FiX />;
      default:
        return <FiShoppingCart />;
    }
  };

  // Obtener texto de estado
  const getStatusText = () => {
    switch (session.status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'En progreso';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <S.Card onClick={onClick} $clickable={!!onClick} className={className}>
      <S.Header>
        <S.StatusBadge $status={session.status}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </S.StatusBadge>

        {session.status !== 'in_progress' && onDelete && (
          <S.DeleteButton onClick={handleDelete} aria-label="Eliminar sesión">
            <FiX />
          </S.DeleteButton>
        )}
      </S.Header>

      <S.Body>
        {session.store_name && (
          <S.StoreInfo>
            <FiMapPin />
            <S.StoreName>{session.store_name}</S.StoreName>
          </S.StoreInfo>
        )}

        <S.DateInfo>
          <FiCalendar />
          <S.DateText>{formatDate(session.created_at)}</S.DateText>
        </S.DateInfo>

        <S.ItemsInfo>
          <S.ItemsCount>
            <FiShoppingCart />
            <span>
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
          </S.ItemsCount>

          {session.status === 'in_progress' && totalItems > 0 && (
            <S.PurchasedCount>
              {purchasedItems}/{totalItems} comprados
            </S.PurchasedCount>
          )}
        </S.ItemsInfo>

        {session.status === 'in_progress' && totalItems > 0 && (
          <S.ProgressBarContainer>
            <S.ProgressBar $progress={progress} />
          </S.ProgressBarContainer>
        )}
      </S.Body>

      <S.Footer>
        <S.TotalLabel>
          <FiDollarSign />
          <span>Total:</span>
        </S.TotalLabel>
        <S.TotalAmount>{formatPrice(session.total || 0)}</S.TotalAmount>
      </S.Footer>
    </S.Card>
  );
};
