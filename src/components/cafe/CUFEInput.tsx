/**
 * CUFEInput Component
 *
 * Input component for entering CUFE (Código Único de Factura Electrónica).
 * Supports manual text input and QR code scanning.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { QrCode, ScanLine, AlertCircle, Check } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { validateCUFE, extractCUFEFromUrl, isQRUrl } from '@/types/cafe';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const ScanButton = styled(Button)`
  flex-shrink: 0;
  min-width: 120px;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ValidationMessage = styled.div<{ $type: 'error' | 'success' | 'info' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  ${({ theme, $type }) => {
    switch ($type) {
      case 'error':
        return `
          background: ${theme.colors.semantic.error.light};
          color: ${theme.colors.semantic.error.dark};
          border: 1px solid ${theme.colors.semantic.error.main};
        `;
      case 'success':
        return `
          background: ${theme.colors.semantic.success.light};
          color: ${theme.colors.semantic.success.dark};
          border: 1px solid ${theme.colors.semantic.success.main};
        `;
      case 'info':
        return `
          background: ${theme.colors.semantic.info.light};
          color: ${theme.colors.semantic.info.dark};
          border: 1px solid ${theme.colors.semantic.info.main};
        `;
    }
  }}

  svg {
    flex-shrink: 0;
  }
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin: ${({ theme }) => theme.spacing[2]} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border.light};
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.disabled};
    text-transform: uppercase;
  }
`;

export interface CUFEInputProps {
  /** Current CUFE value */
  value: string;
  /** Callback when CUFE changes */
  onChange: (cufe: string) => void;
  /** Callback when user submits (Enter or button click) */
  onSubmit: (cufe: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Placeholder text */
  placeholder?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Show QR scanner button */
  showScanner?: boolean;
  /** Custom label */
  label?: string;
}

export const CUFEInput: React.FC<CUFEInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  error = null,
  placeholder = 'FE01200000045400-2-299934-09000020220505...',
  autoFocus = false,
  showScanner = true,
  label,
}) => {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [validationState, setValidationState] = useState<'valid' | 'invalid' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate CUFE on change
  useEffect(() => {
    if (!value) {
      setValidationState(null);
      return;
    }

    // Extract CUFE if user pastes a URL
    const extracted = extractCUFEFromUrl(value);
    if (extracted && extracted !== value) {
      onChange(extracted);
      return;
    }

    // Validate format
    if (value.length >= 40) {
      setValidationState(validateCUFE(value) ? 'valid' : 'invalid');
    } else {
      setValidationState(null);
    }
  }, [value, onChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  // Handle key press (Enter to submit)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value && validationState === 'valid' && !loading) {
      onSubmit(value);
    }
  };

  // Handle QR scan result
  const handleQRScan = (scannedValue: string) => {
    setShowQRScanner(false);

    // If it's a full QR URL, pass it directly (it contains jwt and digestValue for validation)
    if (isQRUrl(scannedValue)) {
      // Extract CUFE for display, but submit the full URL
      const displayCufe = extractCUFEFromUrl(scannedValue) || scannedValue;
      onChange(displayCufe);

      // Auto-submit the full QR URL for fetching
      setTimeout(() => {
        onSubmit(scannedValue);
      }, 300);
      return;
    }

    // Try to extract CUFE from scanned value (might be a URL)
    const extracted = extractCUFEFromUrl(scannedValue);
    const cufe = extracted || scannedValue;

    onChange(cufe);

    // Auto-submit if valid
    if (validateCUFE(cufe)) {
      setTimeout(() => {
        onSubmit(cufe);
      }, 300);
    }
  };

  // Handle search/submit button click
  const handleSubmitClick = () => {
    if (value && validationState === 'valid' && !loading) {
      onSubmit(value);
    }
  };

  return (
    <Container>
      {label && (
        <label
          htmlFor="cufe-input"
          style={{
            fontWeight: 500,
            fontSize: '0.875rem',
            marginBottom: '0.25rem',
          }}
        >
          {label}
        </label>
      )}

      <InputWrapper>
        <InputContainer>
          <Input
            ref={inputRef}
            id="cufe-input"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || loading}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            iconLeft={<QrCode size={18} />}
          />
        </InputContainer>

        <Button
          variant="primary"
          onClick={handleSubmitClick}
          disabled={!value || validationState !== 'valid' || loading}
          loading={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </InputWrapper>

      {showScanner && (
        <>
          <OrDivider>
            <span>o</span>
          </OrDivider>

          <ScanButton
            variant="outline"
            onClick={() => setShowQRScanner(true)}
            disabled={disabled || loading}
            iconLeft={<ScanLine size={18} />}
            fullWidth
          >
            Escanear QR del CAFE
          </ScanButton>
        </>
      )}

      {/* Validation messages */}
      {error && (
        <ValidationMessage $type="error">
          <AlertCircle size={16} />
          {error}
        </ValidationMessage>
      )}

      {!error && validationState === 'invalid' && value.length >= 10 && (
        <ValidationMessage $type="error">
          <AlertCircle size={16} />
          El formato del CUFE no es válido. Debe comenzar con FE, NC o ND.
        </ValidationMessage>
      )}

      {!error && validationState === 'valid' && (
        <ValidationMessage $type="success">
          <Check size={16} />
          Formato de CUFE válido
        </ValidationMessage>
      )}

      <HelpText>
        El CUFE (Código Único de Factura Electrónica) se encuentra en tu comprobante
        de compra. Puedes escribirlo manualmente o escanear el código QR.
      </HelpText>

      {/* QR Scanner Modal */}
      <BarcodeScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        autoClose={true}
        autoCloseDelay={500}
      />
    </Container>
  );
};

export default CUFEInput;
