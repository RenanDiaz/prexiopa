/**
 * PriceInput Component
 *
 * ATM-style price input that only shows numbers and formats currency automatically.
 * Optimized for mobile with numeric keyboard.
 *
 * Features:
 * - ATM-style input (appends digits, backspace removes last digit)
 * - Auto-formats as currency ($X.XX)
 * - Numeric keyboard on mobile (inputMode="numeric")
 * - Auto-focus support
 * - Disabled state
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * <PriceInput
 *   value={price}
 *   onChange={setPrice}
 *   placeholder="$0.00"
 *   label="Precio del producto"
 * />
 * ```
 */

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import styled from 'styled-components';
import { FiDollarSign } from 'react-icons/fi';

// Types
export interface PriceInputProps {
  /** Current price value in dollars (e.g., 5.99) */
  value: number;
  /** Callback when price changes */
  onChange: (value: number) => void;
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
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
}

// Styled Components
const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 56px;
  padding: 0 ${({ theme }) => theme.spacing[4]} 0 ${({ theme }) => theme.spacing[12]};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  transition: all 0.2s ease;
  text-align: right;
  letter-spacing: 0.5px;
  caret-color: ${({ theme }) => theme.colors.primary[500]};

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
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary[400]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const DollarIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.primary[500]};
  pointer-events: none;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
`;

/**
 * PriceInput Component
 */
export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder = '$0.00',
      id,
      disabled = false,
      autoFocus = false,
      className,
      required = false,
      min = 0,
      max = 999999,
    },
    ref
  ) => {
    // Internal state for display value (in cents)
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize display value from prop
    useEffect(() => {
      const cents = Math.round(value * 100);
      setDisplayValue(cents.toString());
    }, [value]);

    /**
     * Format cents to dollar string ($X.XX)
     */
    const formatCentsToDollars = (cents: number): string => {
      const dollars = cents / 100;
      return `$${dollars.toFixed(2)}`;
    };

    /**
     * Handle keyboard input (ATM-style)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'Enter'
      ) {
        if (e.key === 'Backspace') {
          e.preventDefault();
          const newValue = displayValue.slice(0, -1) || '0';
          const cents = parseInt(newValue, 10);
          const dollars = cents / 100;

          // Check min/max
          if (dollars < min || dollars > max) return;

          setDisplayValue(newValue);
          onChange(dollars);
        }
        return;
      }

      // Allow only digits 0-9
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      // Prevent adding more digits if at max value
      const potentialValue = displayValue + e.key;
      const potentialCents = parseInt(potentialValue, 10);
      const potentialDollars = potentialCents / 100;

      if (potentialDollars > max) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const newValue = displayValue === '0' ? e.key : displayValue + e.key;
      const cents = parseInt(newValue, 10);
      const dollars = cents / 100;

      setDisplayValue(newValue);
      onChange(dollars);
    };

    /**
     * Handle paste (extract numbers only)
     */
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const numbersOnly = pastedText.replace(/\D/g, '');

      if (numbersOnly) {
        const cents = parseInt(numbersOnly, 10);
        const dollars = cents / 100;

        if (dollars >= min && dollars <= max) {
          setDisplayValue(cents.toString());
          onChange(dollars);
        }
      }
    };

    /**
     * Handle input change (fallback for mobile keyboards)
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Extract numbers only
      const numbersOnly = e.target.value.replace(/\D/g, '');

      if (numbersOnly === '') {
        setDisplayValue('0');
        onChange(0);
        return;
      }

      const cents = parseInt(numbersOnly, 10);
      const dollars = cents / 100;

      if (dollars >= min && dollars <= max) {
        setDisplayValue(cents.toString());
        onChange(dollars);
      }
    };

    // Format display value
    const cents = parseInt(displayValue, 10) || 0;
    const formattedValue = formatCentsToDollars(cents);

    return (
      <InputWrapper className={className}>
        <DollarIcon>
          <FiDollarSign />
        </DollarIcon>
        <StyledInput
          ref={ref || inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={formattedValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          aria-label={label || 'Precio'}
          aria-required={required}
          aria-invalid={value < min || value > max}
          autoComplete="off"
        />
      </InputWrapper>
    );
  }
);

PriceInput.displayName = 'PriceInput';

export default PriceInput;
