/**
 * PromotionsQueue - Cola de promociones pendientes de moderación
 * Lista todas las promociones pendientes o sin verificar para revisión
 */

import { useState } from 'react';
import styled from 'styled-components';
import { FiFilter, FiRefreshCw, FiCheckCircle, FiPercent, FiTag, FiGift, FiAlertCircle } from 'react-icons/fi';
import { Button } from '@/components/common/Button';
import {
  usePendingPromotions,
  useApprovePromotion,
  useRejectPromotion,
  usePromotionStats,
} from '@/hooks/usePromotions';
import type { PromotionType, PromotionWithProducts } from '@/types/promotion';
import {
  PROMOTION_TYPE_LABELS,
  getPromotionShortDescription,
} from '@/types/promotion';

// =====================================================
// STYLED COMPONENTS
// =====================================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.paper};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const PromotionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[4]};
`;

const EmptyIcon = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.hint};
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const EmptyMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Promotion Card Styles
const PromotionCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const CardHeaderContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TypeIcon = styled.div<{ $type: PromotionType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme }) => theme.colors.primary[50]};
  color: ${({ theme }) => theme.colors.primary[600]};
`;

const CardTitleSection = styled.div``;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ $status }) => {
    if ($status === 'pending') return '#FFF3E0';
    if ($status === 'unverified') return '#FFF8E1';
    return '#F5F5F5';
  }};
  color: ${({ $status }) => {
    if ($status === 'pending') return '#E65100';
    if ($status === 'unverified') return '#F57C00';
    return '#757575';
  }};
`;

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
`;

const DetailRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailItem = styled.div`
  flex: 1;
  min-width: 150px;
`;

const DetailLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.hint};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ProductsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ProductTag = styled.span`
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.default};
`;

// Modal styles
const ModalOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 500px;
  width: 90%;
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ModalText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
  resize: vertical;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
`;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getTypeIcon(type: PromotionType): React.ReactNode {
  switch (type) {
    case 'percentage':
    case 'fixed_amount':
      return <FiPercent size={24} />;
    case 'buy_x_get_y':
    case 'bulk_price':
      return <FiTag size={24} />;
    case 'bundle_free':
    case 'coupon':
    case 'loyalty':
      return <FiGift size={24} />;
    default:
      return <FiPercent size={24} />;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No especificada';
  return new Date(dateStr).toLocaleDateString('es-PA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// =====================================================
// COMPONENT
// =====================================================

export const PromotionsQueue: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<PromotionType | 'all'>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionWithProducts | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Queries & Mutations
  const { data: promotions = [], isLoading, refetch } = usePendingPromotions();
  const { data: stats } = usePromotionStats();
  const approveMutation = useApprovePromotion();
  const rejectMutation = useRejectPromotion();

  // Filter promotions
  const filteredPromotions = typeFilter === 'all'
    ? promotions
    : promotions.filter((p) => p.promotion_type === typeFilter);

  // Handle approve
  const handleApprove = async (promotion: PromotionWithProducts) => {
    try {
      await approveMutation.mutateAsync(promotion.id);
    } catch (error) {
      console.error('Error approving promotion:', error);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedPromotion || !rejectReason.trim()) return;

    try {
      await rejectMutation.mutateAsync({
        promotionId: selectedPromotion.id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setSelectedPromotion(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting promotion:', error);
    }
  };

  // Open reject modal
  const openRejectModal = (promotion: PromotionWithProducts) => {
    setSelectedPromotion(promotion);
    setShowRejectModal(true);
  };

  if (isLoading) {
    return <LoadingContainer>Cargando promociones...</LoadingContainer>;
  }

  return (
    <Container>
      {/* Toolbar */}
      <Toolbar>
        <FiltersContainer>
          <FiFilter />
          <FilterLabel>Tipo:</FilterLabel>
          <FilterSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PromotionType | 'all')}
          >
            <option value="all">Todos</option>
            <option value="percentage">Porcentual</option>
            <option value="fixed_amount">Precio especial</option>
            <option value="buy_x_get_y">Lleva X, paga Y</option>
            <option value="bulk_price">Por volumen</option>
            <option value="coupon">Cupón</option>
            <option value="loyalty">Cartilla</option>
          </FilterSelect>
        </FiltersContainer>

        <Button
          variant="outline"
          size="sm"
          iconLeft={<FiRefreshCw />}
          onClick={() => refetch()}
        >
          Actualizar
        </Button>
      </Toolbar>

      {/* Stats Summary */}
      {stats && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <DetailItem>
            <DetailLabel>Pendientes</DetailLabel>
            <DetailValue>{stats.pending}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Verificadas</DetailLabel>
            <DetailValue>{stats.verified}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Sin verificar</DetailLabel>
            <DetailValue>{stats.unverified}</DetailValue>
          </DetailItem>
        </div>
      )}

      {/* Empty State */}
      {filteredPromotions.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FiCheckCircle size={64} />
          </EmptyIcon>
          <EmptyTitle>No hay promociones pendientes</EmptyTitle>
          <EmptyMessage>
            Todas las promociones han sido revisadas. ¡Buen trabajo!
          </EmptyMessage>
        </EmptyState>
      ) : (
        <PromotionsList>
          {filteredPromotions.map((promotion) => (
            <PromotionCard key={promotion.id}>
              <CardHeader>
                <CardHeaderContent>
                  <TypeIcon $type={promotion.promotion_type}>
                    {getTypeIcon(promotion.promotion_type)}
                  </TypeIcon>
                  <CardTitleSection>
                    <CardTitle>{promotion.name}</CardTitle>
                    <CardSubtitle>
                      {PROMOTION_TYPE_LABELS[promotion.promotion_type]} •{' '}
                      {promotion.store_name || 'Tienda no especificada'}
                    </CardSubtitle>
                  </CardTitleSection>
                </CardHeaderContent>
                <StatusBadge $status={promotion.status}>
                  {promotion.status === 'pending' && (
                    <>
                      <FiAlertCircle size={12} />
                      Pendiente
                    </>
                  )}
                  {promotion.status === 'unverified' && (
                    <>
                      <FiAlertCircle size={12} />
                      Sin verificar
                    </>
                  )}
                </StatusBadge>
              </CardHeader>

              <CardBody>
                <DetailRow>
                  <DetailItem>
                    <DetailLabel>Descripción</DetailLabel>
                    <DetailValue>
                      {getPromotionShortDescription(promotion)}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Verificaciones</DetailLabel>
                    <DetailValue>{promotion.verification_count} usuarios</DetailValue>
                  </DetailItem>
                </DetailRow>

                <DetailRow>
                  <DetailItem>
                    <DetailLabel>Fecha inicio</DetailLabel>
                    <DetailValue>
                      {promotion.is_indefinite ? 'Permanente' : formatDate(promotion.start_date)}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Fecha fin</DetailLabel>
                    <DetailValue>
                      {promotion.is_indefinite ? 'Permanente' : formatDate(promotion.end_date)}
                    </DetailValue>
                  </DetailItem>
                </DetailRow>

                {promotion.products && promotion.products.length > 0 && (
                  <DetailRow>
                    <DetailItem style={{ flex: 'unset', minWidth: '100%' }}>
                      <DetailLabel>Productos</DetailLabel>
                      <ProductsList>
                        {promotion.products.map((p) => (
                          <ProductTag key={p.id}>{p.name}</ProductTag>
                        ))}
                      </ProductsList>
                    </DetailItem>
                  </DetailRow>
                )}
              </CardBody>

              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRejectModal(promotion)}
                  disabled={rejectMutation.isPending}
                >
                  Rechazar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(promotion)}
                  loading={approveMutation.isPending}
                >
                  Aprobar
                </Button>
              </CardFooter>
            </PromotionCard>
          ))}
        </PromotionsList>
      )}

      {/* Reject Modal */}
      <ModalOverlay $open={showRejectModal} onClick={() => setShowRejectModal(false)}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Rechazar Promoción</ModalTitle>
          <ModalText>
            ¿Estás seguro que deseas rechazar "{selectedPromotion?.name}"?
            Por favor, proporciona una razón para el rechazo.
          </ModalText>
          <TextArea
            placeholder="Razón del rechazo..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <ModalActions>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
            >
              Rechazar
            </Button>
          </ModalActions>
        </ModalContainer>
      </ModalOverlay>
    </Container>
  );
};

export default PromotionsQueue;
