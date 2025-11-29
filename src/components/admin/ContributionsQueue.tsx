/**
 * ContributionsQueue - Cola de contribuciones pendientes
 * Lista todas las contribuciones pendientes con filtros y paginación
 */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/common/Button';
import { ContributionReviewCard } from './ContributionReviewCard';
import { usePendingContributions, useModerationActions } from '@/hooks/useUserRole';
import type { PendingContributionForReview } from '@/types/role';
import type { ContributionType } from '@/types/contribution';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

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
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const ContributionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[4]};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  opacity: 0.5;
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

// Modal styles
const ModalOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  max-width: 500px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
`;

const ModalMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.paper};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const ContributionsQueue: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<ContributionType | 'all'>('all');
  const [selectedContribution, setSelectedContribution] =
    useState<PendingContributionForReview | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { contributions, isLoading, error, refresh } = usePendingContributions(100);
  const { approveContribution, rejectContribution, isProcessing } = useModerationActions();

  // Filter contributions by type
  const filteredContributions =
    typeFilter === 'all'
      ? contributions
      : contributions.filter((c) => c.contributionType === typeFilter);

  const handleApproveClick = (contribution: PendingContributionForReview) => {
    setSelectedContribution(contribution);
    setModalType('approve');
  };

  const handleRejectClick = (contribution: PendingContributionForReview) => {
    setSelectedContribution(contribution);
    setRejectionReason('');
    setModalType('reject');
  };

  const handleConfirmApprove = async () => {
    if (!selectedContribution) return;

    const success = await approveContribution({
      contributionId: selectedContribution.id,
      productId: selectedContribution.productId, // Pasar productId para invalidar cache
    });

    if (success) {
      showSuccessNotification('Contribución aprobada exitosamente');
      setModalType(null);
      setSelectedContribution(null);
      refresh(); // Reload contributions
    } else {
      showErrorNotification('Error al aprobar la contribución');
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedContribution || !rejectionReason.trim()) {
      showErrorNotification('Por favor, proporciona una razón de rechazo');
      return;
    }

    const success = await rejectContribution({
      contributionId: selectedContribution.id,
      reason: rejectionReason.trim(),
    });

    if (success) {
      showSuccessNotification('Contribución rechazada');
      setModalType(null);
      setSelectedContribution(null);
      setRejectionReason('');
      refresh(); // Reload contributions
    } else {
      showErrorNotification('Error al rechazar la contribución');
    }
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalType(null);
      setSelectedContribution(null);
      setRejectionReason('');
    }
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isProcessing && !modalType) {
        refresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isProcessing, modalType, refresh]);

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>Cargando contribuciones pendientes...</LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyTitle>Error al cargar contribuciones</EmptyTitle>
          <EmptyMessage>{error}</EmptyMessage>
          <Button onClick={refresh} iconLeft={<FiRefreshCw />}>
            Reintentar
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Toolbar>
          <FiltersContainer>
            <FiFilter />
            <FilterLabel>Filtrar por tipo:</FilterLabel>
            <FilterSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ContributionType | 'all')}
            >
              <option value="all">Todos ({contributions.length})</option>
              <option value="barcode">
                Código de Barras (
                {contributions.filter((c) => c.contributionType === 'barcode').length})
              </option>
              <option value="image">
                Imagen ({contributions.filter((c) => c.contributionType === 'image').length})
              </option>
              <option value="price">
                Precio ({contributions.filter((c) => c.contributionType === 'price').length})
              </option>
              <option value="info">
                Información ({contributions.filter((c) => c.contributionType === 'info').length})
              </option>
            </FilterSelect>
          </FiltersContainer>

          <Button variant="outline" iconLeft={<FiRefreshCw />} onClick={refresh}>
            Actualizar
          </Button>
        </Toolbar>

        {filteredContributions.length === 0 ? (
          <EmptyState>
            <EmptyIcon>✅</EmptyIcon>
            <EmptyTitle>No hay contribuciones pendientes</EmptyTitle>
            <EmptyMessage>
              {typeFilter === 'all'
                ? 'Todas las contribuciones han sido revisadas.'
                : `No hay contribuciones de tipo "${typeFilter}" pendientes.`}
            </EmptyMessage>
          </EmptyState>
        ) : (
          <ContributionsList>
            {filteredContributions.map((contribution) => (
              <ContributionReviewCard
                key={contribution.id}
                contribution={contribution}
                onApprove={() => handleApproveClick(contribution)}
                onReject={() => handleRejectClick(contribution)}
                isProcessing={
                  isProcessing && selectedContribution?.id === contribution.id
                }
              />
            ))}
          </ContributionsList>
        )}
      </Container>

      {/* Approve Modal */}
      <ModalOverlay $open={modalType === 'approve'} onClick={handleCloseModal}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Aprobar Contribución</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <ModalMessage>
              ¿Estás seguro de que deseas aprobar esta contribución?
              <br />
              <br />
              Los datos serán aplicados al producto:{' '}
              <strong>{selectedContribution?.productName}</strong>
            </ModalMessage>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmApprove} loading={isProcessing}>
              Aprobar
            </Button>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>

      {/* Reject Modal */}
      <ModalOverlay $open={modalType === 'reject'} onClick={handleCloseModal}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Rechazar Contribución</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <ModalMessage>
              Por favor, proporciona una razón para rechazar esta contribución. El usuario
              recibirá esta información.
            </ModalMessage>
            <TextArea
              placeholder="Ejemplo: Los datos no coinciden con el producto, la imagen es de baja calidad, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={isProcessing}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={handleConfirmReject}
              loading={isProcessing}
              disabled={!rejectionReason.trim()}
            >
              Rechazar
            </Button>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </>
  );
};
