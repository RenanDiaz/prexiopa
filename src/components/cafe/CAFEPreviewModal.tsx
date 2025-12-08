/**
 * CAFEPreviewModal Component
 *
 * Modal to preview imported CAFE invoice data before importing to shopping session.
 * Shows invoice details, items, and totals with option to select which items to import.
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Receipt,
  Package,
  DollarSign,
  Check,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { CAFEInvoice } from '@/types/cafe';
import { formatCAFECurrency } from '@/types/cafe';

// Styled Components
const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  max-height: 70vh;
  overflow-y: auto;
`;

const Section = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ItemsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const SelectAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[50]};
    border-color: ${({ theme }) => theme.colors.primary[400]};
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ItemRow = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[50] : theme.colors.background.default};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary[300] : theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
  }
`;

const ItemCheckbox = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 2px;
  color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary[500] : theme.colors.text.disabled};
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const ItemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ItemPrice = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const ItemUnitPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ItemTotalPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TotalsSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.primary[50]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.primary[200]};
`;

const TotalsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TotalRow = styled.div<{ $bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, $bold }) =>
    $bold ? theme.colors.text.primary : theme.colors.text.secondary};
  font-weight: ${({ theme, $bold }) =>
    $bold ? theme.typography.fontWeight.bold : theme.typography.fontWeight.regular};

  ${({ $bold, theme }) =>
    $bold &&
    `
    padding-top: ${theme.spacing[2]};
    border-top: 1px solid ${theme.colors.primary[200]};
    margin-top: ${theme.spacing[1]};
    font-size: ${theme.typography.fontSize.lg};
  `}
`;

const MatchedStoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.semantic.success.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.success.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.success.dark};

  svg {
    flex-shrink: 0;
  }
`;

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.semantic.warning.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.warning.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.warning.dark};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

// Component Props
export interface CAFEPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: CAFEInvoice | null;
  onImport: (selectedItems?: number[]) => void;
  loading?: boolean;
  matchedStore?: {
    storeId: string;
    storeName: string;
    isVerified: boolean;
  } | null;
}

export const CAFEPreviewModal: React.FC<CAFEPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onImport,
  loading = false,
  matchedStore = null,
}) => {
  // State for item selection
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  // Initialize all items as selected when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setSelectedItems(new Set(invoice.items.map((item) => item.lineNumber)));
      setSelectAll(true);
    }
  }, [invoice]);

  // Calculate totals for selected items
  const selectedTotals = useMemo(() => {
    if (!invoice) return { subtotal: 0, tax: 0, total: 0, count: 0 };

    const selected = invoice.items.filter((item) => selectedItems.has(item.lineNumber));
    const subtotal = selected.reduce(
      (sum, item) => sum + item.totalPrice - item.taxAmount,
      0
    );
    const tax = selected.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = selected.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      subtotal,
      tax,
      total,
      count: selected.length,
    };
  }, [invoice, selectedItems]);

  // Toggle item selection
  const toggleItem = (lineNumber: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lineNumber)) {
        newSet.delete(lineNumber);
      } else {
        newSet.add(lineNumber);
      }

      // Update selectAll state
      if (invoice) {
        setSelectAll(newSet.size === invoice.items.length);
      }

      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (!invoice) return;

    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(invoice.items.map((item) => item.lineNumber)));
      setSelectAll(true);
    }
  };

  // Handle import
  const handleImport = () => {
    const itemsToImport = selectAll ? undefined : Array.from(selectedItems);
    onImport(itemsToImport);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (!invoice) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <Receipt size={24} />
        Vista Previa de Factura
      </Modal.Header>

      <Modal.Body>
        <PreviewContainer>
          {/* Invoice Info */}
          <Section>
            <SectionTitle>
              <FileText size={18} />
              Información de la Factura
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Número de Factura</InfoLabel>
                <InfoValue>{invoice.invoiceNumber}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Fecha de Emisión</InfoLabel>
                <InfoValue>{formatDate(invoice.issueDate)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>RUC Emisor</InfoLabel>
                <InfoValue>{invoice.emitter.ruc}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Establecimiento</InfoLabel>
                <InfoValue>{invoice.emitter.name}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </Section>

          {/* Matched Store Info */}
          {matchedStore && (
            <MatchedStoreInfo>
              <Check size={18} />
              <div>
                <strong>Tienda identificada:</strong> {matchedStore.storeName}
                {matchedStore.isVerified && ' (Verificada)'}
              </div>
            </MatchedStoreInfo>
          )}

          {!matchedStore && (
            <WarningBox>
              <AlertCircle size={18} />
              <div>
                No se encontró una tienda registrada con el RUC de esta factura.
                Los productos se importarán con el nombre "{invoice.emitter.name}".
              </div>
            </WarningBox>
          )}

          {/* Items Section */}
          <Section>
            <ItemsHeader>
              <SectionTitle style={{ margin: 0 }}>
                <Package size={18} />
                Productos ({invoice.items.length})
              </SectionTitle>
              <SelectAllButton onClick={toggleSelectAll}>
                {selectAll ? <CheckSquare size={16} /> : <Square size={16} />}
                {selectAll ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </SelectAllButton>
            </ItemsHeader>

            <ItemsList>
              {invoice.items.map((item) => (
                <ItemRow
                  key={item.lineNumber}
                  $selected={selectedItems.has(item.lineNumber)}
                  onClick={() => toggleItem(item.lineNumber)}
                >
                  <ItemCheckbox $checked={selectedItems.has(item.lineNumber)}>
                    {selectedItems.has(item.lineNumber) ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </ItemCheckbox>
                  <ItemDetails>
                    <ItemName>{item.description}</ItemName>
                    <ItemMeta>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                      <span>ITBMS: {item.taxRate}%</span>
                      {item.productCode && <span>Código: {item.productCode}</span>}
                    </ItemMeta>
                  </ItemDetails>
                  <ItemPrice>
                    <ItemUnitPrice>{formatCAFECurrency(item.unitPrice)} c/u</ItemUnitPrice>
                    <ItemTotalPrice>{formatCAFECurrency(item.totalPrice)}</ItemTotalPrice>
                  </ItemPrice>
                </ItemRow>
              ))}
            </ItemsList>
          </Section>

          {/* Totals */}
          <TotalsSection>
            <SectionTitle>
              <DollarSign size={18} />
              {selectAll
                ? 'Totales de la Factura'
                : `Totales Seleccionados (${selectedTotals.count} productos)`}
            </SectionTitle>
            <TotalsGrid>
              <TotalRow>
                <span>Subtotal (sin ITBMS)</span>
                <span>
                  {formatCAFECurrency(selectAll ? invoice.totals.subtotal : selectedTotals.subtotal)}
                </span>
              </TotalRow>
              <TotalRow>
                <span>ITBMS</span>
                <span>
                  {formatCAFECurrency(selectAll ? invoice.totals.totalTax : selectedTotals.tax)}
                </span>
              </TotalRow>
              <TotalRow $bold>
                <span>Total</span>
                <span>
                  {formatCAFECurrency(selectAll ? invoice.totals.grandTotal : selectedTotals.total)}
                </span>
              </TotalRow>
            </TotalsGrid>
          </TotalsSection>
        </PreviewContainer>
      </Modal.Body>

      <Modal.Footer>
        <ButtonGroup>
          <Button variant="outline" onClick={onClose} disabled={loading} fullWidth>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={selectedItems.size === 0 || loading}
            loading={loading}
            iconLeft={<ShoppingCart size={18} />}
            fullWidth
          >
            Importar {selectedTotals.count} productos
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
};

export default CAFEPreviewModal;
