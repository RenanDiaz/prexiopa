/**
 * ActiveShoppingSession Component
 * Interfaz principal para gestionar una sesión de compras activa
 */

import { useState, useMemo } from 'react';
import {
  FiShoppingCart,
  FiCheck,
  FiX,
  FiPlus,
  FiMapPin,
  FiAlertCircle,
} from 'react-icons/fi';
import { ShoppingItemCard } from './ShoppingItemCard';
import { TaxBreakdownComponent } from './TaxBreakdown';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import EmptyState from '../common/EmptyState';
import {
  useActiveSessionQuery,
  useShoppingItemsQuery,
  useCompleteSessionMutation,
  useCancelSessionMutation,
  useToggleItemPurchasedMutation,
  useIncrementItemQuantityMutation,
  useDecrementItemQuantityMutation,
  useDeleteItemMutation,
  useEditItemMutation,
} from '@/hooks/useShoppingLists';
import { calculateSessionTaxSummary, DEFAULT_TAX_RATE_CODE, DEFAULT_TAX_RATE } from '@/types/tax';
import type { TaxRateCode } from '@/types/tax';
import * as S from './ActiveShoppingSession.styles';

export interface ActiveShoppingSessionProps {
  onAddProduct?: () => void;
  className?: string;
}

export const ActiveShoppingSession = ({
  onAddProduct,
  className,
}: ActiveShoppingSessionProps) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Queries
  const { data: session, isLoading: isLoadingSession } = useActiveSessionQuery();
  const { data: items = [], isLoading: isLoadingItems } = useShoppingItemsQuery(
    session?.id || '',
    { enabled: !!session?.id }
  );

  // Mutations
  const completeMutation = useCompleteSessionMutation();
  const cancelMutation = useCancelSessionMutation();
  const togglePurchasedMutation = useToggleItemPurchasedMutation();
  const incrementMutation = useIncrementItemQuantityMutation();
  const decrementMutation = useDecrementItemQuantityMutation();
  const deleteMutation = useDeleteItemMutation();
  const editMutation = useEditItemMutation();

  // Calcular estadísticas
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.purchased).length;
  const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate tax summary using useMemo for performance
  const taxSummary = useMemo(() => {
    if (items.length === 0) {
      return {
        subtotalBeforeTax: 0,
        totalTax: 0,
        grandTotal: 0,
        breakdown: {},
      };
    }

    // Map items to the format expected by calculateSessionTaxSummary
    const taxItems = items.map((item) => {
      const taxRateCode = (item.tax_rate_code as TaxRateCode) || DEFAULT_TAX_RATE_CODE;
      const taxRate = item.tax_rate ?? DEFAULT_TAX_RATE;
      const basePrice = item.base_price ?? item.price;
      const taxAmount = item.tax_amount ?? 0;

      return {
        basePrice,
        taxRate,
        taxRateCode,
        taxAmount,
        quantity: item.quantity,
        subtotal: item.subtotal,
      };
    });

    return calculateSessionTaxSummary(taxItems);
  }, [items]);

  // Handlers
  const handleTogglePurchased = (itemId: string, purchased: boolean) => {
    if (!session) return;
    togglePurchasedMutation.mutate({ itemId, purchased, sessionId: session.id });
  };

  const handleIncrementQuantity = (itemId: string) => {
    if (!session) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    incrementMutation.mutate({
      itemId,
      sessionId: session.id,
      currentQuantity: item.quantity,
    });
  };

  const handleDecrementQuantity = (itemId: string) => {
    if (!session) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    decrementMutation.mutate({
      itemId,
      sessionId: session.id,
      currentQuantity: item.quantity,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!session) return;
    deleteMutation.mutate({ itemId, sessionId: session.id });
  };

  const handleEditItem = async (itemId: string, quantity: number, price: number) => {
    if (!session) return;

    return new Promise<void>((resolve, reject) => {
      editMutation.mutate(
        { itemId, sessionId: session.id, quantity, price },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        }
      );
    });
  };

  const handleCompleteSession = () => {
    if (!session) return;
    completeMutation.mutate(session.id, {
      onSuccess: () => setShowCompleteModal(false),
    });
  };

  const handleCancelSession = () => {
    if (!session) return;
    cancelMutation.mutate(session.id, {
      onSuccess: () => setShowCancelModal(false),
    });
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Loading state
  if (isLoadingSession || isLoadingItems) {
    return (
      <S.Container className={className}>
        <S.LoadingWrapper>
          <S.Spinner />
          <S.LoadingText>Cargando sesión...</S.LoadingText>
        </S.LoadingWrapper>
      </S.Container>
    );
  }

  // No active session
  if (!session) {
    return (
      <S.Container className={className}>
        <EmptyState
          icon={FiShoppingCart}
          title="No hay sesión activa"
          message="Inicia una nueva sesión de compras para comenzar a agregar productos"
        />
      </S.Container>
    );
  }

  return (
    <S.Container className={className}>
      {/* Header */}
      <S.Header>
        <S.HeaderTop>
          <S.Title>
            <FiShoppingCart />
            <span>Sesión de Compras</span>
          </S.Title>

          <S.Actions>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<FiX />}
              onClick={() => setShowCancelModal(true)}
            >
              Cancelar
            </Button>

            <Button
              variant="primary"
              size="sm"
              iconLeft={<FiCheck />}
              onClick={() => setShowCompleteModal(true)}
              disabled={totalItems === 0}
            >
              Completar
            </Button>
          </S.Actions>
        </S.HeaderTop>

        {session.store_name && (
          <S.StoreInfo>
            <FiMapPin />
            <span>{session.store_name}</span>
          </S.StoreInfo>
        )}

        {/* Stats */}
        <S.Stats>
          <S.StatItem>
            <S.StatLabel>Productos</S.StatLabel>
            <S.StatValue>{totalItems}</S.StatValue>
          </S.StatItem>

          <S.StatItem>
            <S.StatLabel>Comprados</S.StatLabel>
            <S.StatValue $highlight>{purchasedItems}</S.StatValue>
          </S.StatItem>

          <S.StatItem>
            <S.StatLabel>Total</S.StatLabel>
            <S.StatValue $primary>{formatPrice(total)}</S.StatValue>
          </S.StatItem>
        </S.Stats>

        {/* Progress */}
        {totalItems > 0 && (
          <S.ProgressSection>
            <S.ProgressHeader>
              <S.ProgressLabel>Progreso</S.ProgressLabel>
              <S.ProgressPercentage>{Math.round(progress)}%</S.ProgressPercentage>
            </S.ProgressHeader>
            <S.ProgressBarContainer>
              <S.ProgressBar $progress={progress} />
            </S.ProgressBarContainer>
          </S.ProgressSection>
        )}

        {/* Tax Breakdown */}
        {totalItems > 0 && (
          <TaxBreakdownComponent
            subtotalBeforeTax={taxSummary.subtotalBeforeTax}
            totalTax={taxSummary.totalTax}
            grandTotal={taxSummary.grandTotal}
            breakdown={taxSummary.breakdown}
          />
        )}
      </S.Header>

      {/* Items List */}
      <S.ItemsList>
        {totalItems === 0 ? (
          <EmptyState
            icon={FiShoppingCart}
            title="Lista vacía"
            message="Agrega productos a tu lista de compras"
          />
        ) : (
          items.map((item) => (
            <ShoppingItemCard
              key={item.id}
              item={item}
              onTogglePurchased={handleTogglePurchased}
              onIncrementQuantity={handleIncrementQuantity}
              onDecrementQuantity={handleDecrementQuantity}
              onDelete={handleDeleteItem}
              onEdit={handleEditItem}
            />
          ))
        )}
      </S.ItemsList>

      {/* Add Product Button */}
      {onAddProduct && (
        <S.AddProductButton>
          <Button
            variant="primary"
            fullWidth
            iconLeft={<FiPlus />}
            onClick={onAddProduct}
          >
            Agregar Producto
          </Button>
        </S.AddProductButton>
      )}

      {/* Complete Modal */}
      <Modal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
      >
        <Modal.Header>
          Completar Compra
        </Modal.Header>

        <Modal.Body>
          <S.ModalContent>
            <S.ModalIcon $success>
              <FiCheck />
            </S.ModalIcon>

            <S.ModalText>
              ¿Estás seguro que deseas marcar esta sesión como completada?
            </S.ModalText>

            <S.ModalStats>
              <S.ModalStatRow>
                <span>Total de productos:</span>
                <strong>{totalItems}</strong>
              </S.ModalStatRow>
              <S.ModalStatRow>
                <span>Productos comprados:</span>
                <strong>{purchasedItems}</strong>
              </S.ModalStatRow>
              <S.ModalStatRow>
                <span>Subtotal (sin ITBMS):</span>
                <strong>{formatPrice(taxSummary.subtotalBeforeTax)}</strong>
              </S.ModalStatRow>
              <S.ModalStatRow>
                <span>Total ITBMS:</span>
                <strong>{formatPrice(taxSummary.totalTax)}</strong>
              </S.ModalStatRow>
              <S.ModalStatRow>
                <span>Total a pagar:</span>
                <strong>{formatPrice(taxSummary.grandTotal)}</strong>
              </S.ModalStatRow>
            </S.ModalStats>

            {purchasedItems < totalItems && (
              <S.ModalWarning>
                <FiAlertCircle />
                <span>
                  Tienes {totalItems - purchasedItems} productos sin marcar como
                  comprados
                </span>
              </S.ModalWarning>
            )}
          </S.ModalContent>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCompleteSession}
            loading={completeMutation.isPending}
          >
            Completar Compra
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      >
        <Modal.Header>
          Cancelar Sesión
        </Modal.Header>

        <Modal.Body>
          <S.ModalContent>
            <S.ModalIcon $error>
              <FiX />
            </S.ModalIcon>

            <S.ModalText>
              ¿Estás seguro que deseas cancelar esta sesión de compras?
            </S.ModalText>

            <S.ModalWarning>
              <FiAlertCircle />
              <span>
                Esta acción no se puede deshacer. Se perderá la información de
                esta sesión.
              </span>
            </S.ModalWarning>
          </S.ModalContent>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>
            Volver
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelSession}
            loading={cancelMutation.isPending}
          >
            Cancelar Sesión
          </Button>
        </Modal.Footer>
      </Modal>
    </S.Container>
  );
};
