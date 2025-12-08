/**
 * TaxBreakdown Component
 *
 * Displays a detailed breakdown of taxes (ITBMS) for a shopping session.
 * Shows subtotal before tax, tax amounts grouped by rate, and grand total.
 */

import styled from 'styled-components';
import { FiPercent } from 'react-icons/fi';
import type { TaxBreakdown as TaxBreakdownType } from '@/types/tax';
import { formatCurrency } from '@/types/tax';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const BreakdownSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Row = styled.div<{ $highlight?: boolean; $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.text.primary : theme.colors.text.secondary};
  font-weight: ${({ theme, $highlight, $total }) =>
    $total
      ? theme.typography.fontWeight.bold
      : $highlight
        ? theme.typography.fontWeight.medium
        : theme.typography.fontWeight.regular};

  ${({ $total, theme }) =>
    $total &&
    `
    padding-top: ${theme.spacing[3]};
    margin-top: ${theme.spacing[2]};
    border-top: 2px solid ${theme.colors.border.main};
    font-size: ${theme.typography.fontSize.base};
  `}
`;

const Label = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ItemCount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.hint};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
`;

const Amount = styled.span<{ $highlight?: boolean }>`
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.primary[600] : 'inherit'};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed ${({ theme }) => theme.colors.border.light};
  margin: ${({ theme }) => theme.spacing[1]} 0;
`;

const EmptyState = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.hint};
  text-align: center;
  margin: 0;
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

export interface TaxBreakdownProps {
  /** Subtotal before tax (sum of base prices) */
  subtotalBeforeTax: number;
  /** Total tax amount */
  totalTax: number;
  /** Grand total (subtotal + tax or what user pays) */
  grandTotal: number;
  /** Breakdown by tax rate */
  breakdown: TaxBreakdownType;
  /** Whether to show a compact version */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

export const TaxBreakdownComponent: React.FC<TaxBreakdownProps> = ({
  subtotalBeforeTax,
  totalTax,
  grandTotal,
  breakdown,
  compact = false,
  className,
}) => {
  const breakdownEntries = Object.entries(breakdown).sort(
    ([a], [b]) => parseFloat(a) - parseFloat(b)
  );

  const hasItems = breakdownEntries.length > 0;

  if (!hasItems) {
    return (
      <Container className={className}>
        <Header>
          <FiPercent size={16} />
          <Title>Desglose de ITBMS</Title>
        </Header>
        <EmptyState>No hay items en la lista</EmptyState>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <Header>
        <FiPercent size={16} />
        <Title>Desglose de ITBMS</Title>
      </Header>

      <BreakdownSection>
        {/* Subtotal before tax */}
        <Row>
          <Label>Subtotal (sin ITBMS)</Label>
          <Amount>{formatCurrency(subtotalBeforeTax)}</Amount>
        </Row>

        {!compact && <Divider />}

        {/* Tax breakdown by rate */}
        {breakdownEntries.map(([rate, data]) => (
          <Row key={rate}>
            <Label>
              ITBMS {rate}%
              {!compact && data.itemCount > 0 && (
                <ItemCount>({data.itemCount} {data.itemCount === 1 ? 'item' : 'items'})</ItemCount>
              )}
            </Label>
            <Amount>{formatCurrency(data.taxAmount)}</Amount>
          </Row>
        ))}

        {!compact && totalTax > 0 && (
          <>
            <Divider />
            <Row $highlight>
              <Label>Total ITBMS</Label>
              <Amount $highlight>{formatCurrency(totalTax)}</Amount>
            </Row>
          </>
        )}

        {/* Grand total */}
        <Row $total>
          <Label>TOTAL</Label>
          <Amount>{formatCurrency(grandTotal)}</Amount>
        </Row>
      </BreakdownSection>
    </Container>
  );
};

/**
 * Compact version for inline display
 */
const CompactContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const CompactRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};

  ${({ $total, theme }) =>
    $total &&
    `
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
    padding-top: ${theme.spacing[1]};
    border-top: 1px solid ${theme.colors.border.light};
    margin-top: ${theme.spacing[1]};
  `}
`;

export interface CompactTaxBreakdownProps {
  subtotalBeforeTax: number;
  totalTax: number;
  grandTotal: number;
  className?: string;
}

export const CompactTaxBreakdown: React.FC<CompactTaxBreakdownProps> = ({
  subtotalBeforeTax,
  totalTax,
  grandTotal,
  className,
}) => {
  return (
    <CompactContainer className={className}>
      <CompactRow>
        <span>Subtotal:</span>
        <span>{formatCurrency(subtotalBeforeTax)}</span>
      </CompactRow>
      <CompactRow>
        <span>ITBMS:</span>
        <span>{formatCurrency(totalTax)}</span>
      </CompactRow>
      <CompactRow $total>
        <span>Total:</span>
        <span>{formatCurrency(grandTotal)}</span>
      </CompactRow>
    </CompactContainer>
  );
};

export default TaxBreakdownComponent;
