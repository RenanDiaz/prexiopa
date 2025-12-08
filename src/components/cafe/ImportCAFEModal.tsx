/**
 * ImportCAFEModal Component
 *
 * Main modal for importing electronic invoices (CAFE) from DGI.
 * Combines CUFE input, fetching, preview, and import flow.
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Receipt, CheckCircle, History } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CUFEInput } from './CUFEInput';
import { CAFEPreviewModal } from './CAFEPreviewModal';
import { useCAFEStore, selectIsLoading, selectImportComplete } from '@/store/cafeStore';

// Styled Components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.semantic.success.light};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.semantic.success.main};

  svg {
    width: 48px;
    height: 48px;
  }
`;

const SuccessTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SuccessMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  max-width: 400px;
`;

const PreviouslyImportedBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.semantic.warning.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.warning.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PreviouslyImportedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.semantic.warning.dark};
`;

const PreviouslyImportedInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  p {
    margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
  }
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.6;

  a {
    color: ${({ theme }) => theme.colors.primary[500]};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Component Props
export interface ImportCAFEModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when import is successful (with session ID) */
  onImportSuccess?: (sessionId: string) => void;
}

export const ImportCAFEModal: React.FC<ImportCAFEModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  // Store state
  const {
    status,
    cufe,
    invoice,
    error,
    matchedStore,
    previouslyImported,
    shoppingSessionId,
    setCUFE,
    fetchInvoice,
    importToShopping,
    reset,
  } = useCAFEStore();

  const isLoading = useCAFEStore(selectIsLoading);
  const importComplete = useCAFEStore(selectImportComplete);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow close animation
      const timer = setTimeout(() => {
        reset();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);

  // Handle successful import
  useEffect(() => {
    if (importComplete && shoppingSessionId && onImportSuccess) {
      onImportSuccess(shoppingSessionId);
    }
  }, [importComplete, shoppingSessionId, onImportSuccess]);

  // Handle CUFE submit
  const handleCUFESubmit = async (value: string) => {
    await fetchInvoice(value);
  };

  // Handle import with selected items
  const handleImport = async (selectedItems?: number[]) => {
    await importToShopping({ selectedItems });
  };

  // Handle closing the modal
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Format date for display
  const formatImportDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Render success state
  if (importComplete && shoppingSessionId) {
    return (
      <Modal open={isOpen} onClose={handleClose} size="md">
        <Modal.Header>
          <Receipt size={24} />
          Importación Exitosa
        </Modal.Header>

        <Modal.Body>
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle />
            </SuccessIcon>
            <SuccessTitle>¡Factura Importada!</SuccessTitle>
            <SuccessMessage>
              Tu factura ha sido importada exitosamente como una sesión de compras.
              Puedes ver los detalles en tu historial de compras.
            </SuccessMessage>
          </SuccessContainer>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleClose} fullWidth>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // Render preview state
  if ((status === 'preview' || status === 'importing') && invoice) {
    return (
      <CAFEPreviewModal
        isOpen={isOpen}
        onClose={handleClose}
        invoice={invoice}
        onImport={handleImport}
        loading={isLoading}
        matchedStore={matchedStore}
      />
    );
  }

  // Render input state (default)
  return (
    <Modal open={isOpen} onClose={handleClose} size="md" closeOnBackdrop={!isLoading}>
      <Modal.Header>
        <Receipt size={24} />
        Importar Factura (CAFE)
      </Modal.Header>

      <Modal.Body>
        <ModalContent>
          <StepIndicator>
            <Receipt size={18} />
            <span>
              Ingresa el <strong>CUFE</strong> de tu factura electrónica o escanea el{' '}
              <strong>código QR</strong> del CAFE
            </span>
          </StepIndicator>

          <CUFEInput
            value={cufe || ''}
            onChange={setCUFE}
            onSubmit={handleCUFESubmit}
            loading={isLoading}
            error={error}
            autoFocus
          />

          {/* Previously imported warning */}
          {previouslyImported?.isImported && (
            <PreviouslyImportedBox>
              <PreviouslyImportedHeader>
                <History size={18} />
                Esta factura ya fue importada
              </PreviouslyImportedHeader>
              <PreviouslyImportedInfo>
                <p>
                  Esta factura fue importada el{' '}
                  {formatImportDate(previouslyImported.importedAt)}.
                </p>
                {previouslyImported.shoppingSessionId && (
                  <p>
                    Puedes ver los detalles en tu historial de compras.
                  </p>
                )}
              </PreviouslyImportedInfo>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reset()}
              >
                Importar otra factura
              </Button>
            </PreviouslyImportedBox>
          )}

          <InfoText>
            El CUFE es el Código Único de Factura Electrónica que aparece en todos los
            comprobantes fiscales de Panamá. Lo puedes encontrar impreso en tu ticket
            o en el código QR del CAFE.
          </InfoText>
        </ModalContent>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportCAFEModal;
