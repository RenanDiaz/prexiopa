/**
 * BarcodeInput Component
 *
 * Specialized input for barcode entry with numeric keyboard on mobile.
 * Validates barcode format and provides clear visual feedback.
 *
 * Features:
 * - Numeric keyboard on mobile (inputMode="numeric")
 * - Only allows digits (0-9)
 * - Optional barcode scanner button
 * - Validation for barcode length (8-14 digits typically)
 * - Auto-formats with spaces for readability (optional)
 * - Clear button when value present
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * <BarcodeInput
 *   value={barcode}
 *   onChange={setBarcode}
 *   onScanClick={() => setScannerOpen(true)}
 *   label="Código de Barras"
 * />
 * ```
 */

import React, { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { FiHash, FiCamera, FiX } from 'react-icons/fi';

// Types
export interface BarcodeInputProps {
  /** Current barcode value */
  value: string;
  /** Callback when barcode changes */
  onChange: (value: string) => void;
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Input ID for accessibility */
  id?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Required field */
  required?: boolean;
  /** Show scanner button */
  showScanButton?: boolean;
  /** Callback when scan button is clicked */
  onScanClick?: () => void;
  /** Minimum barcode length */
  minLength?: number;
  /** Maximum barcode length */
  maxLength?: number;
  /** Show validation error */
  error?: string;
}

// Styled Components
const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 44px;
  padding: 0 ${({ theme }) => theme.spacing[3]} 0 ${({ theme }) => theme.spacing[10]};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
  border: 2px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.semantic.error.main : theme.colors.border.main)};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  transition: all 0.2s ease;
  font-family: 'Monaco', 'Courier New', monospace;
  letter-spacing: 1px;

  /* Remove default number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
    opacity: 0.6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    letter-spacing: normal;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.dark : theme.colors.primary[400]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px
      ${({ theme, $hasError }) =>
        $hasError ? theme.colors.semantic.error.light : theme.colors.primary[100]};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.hint};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.neutral[200]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[300]};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const ScanButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary[500]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  color: ${({ theme }) => theme.colors.primary.contrast};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.semantic.error.main};
`;

/**
 * BarcodeInput Component
 */
export const BarcodeInput = forwardRef<HTMLInputElement, BarcodeInputProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder = '7501234567890',
      id,
      disabled = false,
      autoFocus = false,
      className,
      required = false,
      showScanButton = false,
      onScanClick,
      minLength = 8,
      maxLength = 14,
      error,
    },
    ref
  ) => {
    const [localError, setLocalError] = useState<string>('');

    /**
     * Handle input change - only allow numbers
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove all non-numeric characters
      const numericValue = inputValue.replace(/\D/g, '');

      // Enforce max length
      const truncatedValue = numericValue.slice(0, maxLength);

      // Update value
      onChange(truncatedValue);

      // Clear local error when user types
      if (localError) {
        setLocalError('');
      }
    };

    /**
     * Handle blur - validate barcode
     */
    const handleBlur = () => {
      if (!value) {
        setLocalError('');
        return;
      }

      if (value.length < minLength) {
        setLocalError(`El código debe tener al menos ${minLength} dígitos`);
      } else if (value.length > maxLength) {
        setLocalError(`El código no puede tener más de ${maxLength} dígitos`);
      } else {
        setLocalError('');
      }
    };

    /**
     * Handle clear button click
     */
    const handleClear = () => {
      onChange('');
      setLocalError('');
    };

    /**
     * Handle scan button click
     */
    const handleScan = () => {
      if (onScanClick && !disabled) {
        onScanClick();
      }
    };

    const hasError = Boolean(error || localError);
    const errorMessage = error || localError;
    const showClear = value && !showScanButton;

    return (
      <InputWrapper className={className}>
        <InputContainer>
          <IconContainer>
            <FiHash size={18} />
          </IconContainer>

          <StyledInput
            ref={ref}
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            required={required}
            aria-label={label || 'Código de barras'}
            aria-required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            $hasError={hasError}
          />

          {showClear && (
            <ClearButton type="button" onClick={handleClear} aria-label="Limpiar código">
              <FiX size={16} />
            </ClearButton>
          )}

          {showScanButton && (
            <ScanButton
              type="button"
              onClick={handleScan}
              disabled={disabled}
              aria-label="Escanear código de barras"
            >
              <FiCamera size={18} />
            </ScanButton>
          )}
        </InputContainer>

        {errorMessage && (
          <ErrorMessage id={`${id}-error`} role="alert">
            {errorMessage}
          </ErrorMessage>
        )}
      </InputWrapper>
    );
  }
);

BarcodeInput.displayName = 'BarcodeInput';

export default BarcodeInput;
