/**
 * Input Component
 *
 * A flexible input component with validation states, icons, and helper text.
 * Supports all standard input types and is fully accessible.
 *
 * @example
 * ```tsx
 * // Basic text input
 * <Input label="Nombre" placeholder="Ingresa tu nombre" />
 *
 * // With error state
 * <Input
 *   label="Email"
 *   type="email"
 *   error="Email inválido"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * // Search with icon and clear button
 * <Input
 *   type="search"
 *   placeholder="Buscar productos..."
 *   iconLeft={<SearchIcon />}
 *   clearable
 * />
 *
 * // With helper text
 * <Input
 *   label="Contraseña"
 *   type="password"
 *   helperText="Mínimo 8 caracteres"
 * />
 * ```
 */

import React, { useState, useRef } from 'react';
import * as S from './Input.styles';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Success state indicator
   */
  success?: boolean;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Icon to display on the left side
   */
  iconLeft?: React.ReactNode;

  /**
   * Icon to display on the right side
   */
  iconRight?: React.ReactNode;

  /**
   * Shows clear button when input has value
   */
  clearable?: boolean;

  /**
   * Input size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Makes input full width
   */
  fullWidth?: boolean;

  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;
}

/**
 * Flexible input component with validation and icons
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      error,
      success = false,
      helperText,
      iconLeft,
      iconRight,
      clearable = false,
      size = 'md',
      fullWidth = false,
      disabled = false,
      value,
      onChange,
      onClear,
      id,
      className,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>('');
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = ref || inputRef;

    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue !== '' && currentValue !== null && currentValue !== undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('');
      }
      onClear?.();

      // Focus input after clearing
      if (typeof combinedRef === 'object' && combinedRef?.current) {
        combinedRef.current.focus();
      }
    };

    const showClearButton = clearable && hasValue && !disabled && type !== 'password';

    return (
      <S.InputWrapper fullWidth={fullWidth} className={className}>
        {label && (
          <S.Label htmlFor={inputId} disabled={disabled}>
            {label}
          </S.Label>
        )}

        <S.InputContainer
          hasError={!!error}
          hasSuccess={success}
          disabled={disabled}
          size={size}
        >
          {iconLeft && (
            <S.IconWrapper position="left">
              {iconLeft}
            </S.IconWrapper>
          )}

          <S.StyledInput
            ref={combinedRef}
            id={inputId}
            type={type}
            value={currentValue}
            onChange={handleChange}
            disabled={disabled}
            hasIconLeft={!!iconLeft}
            hasIconRight={!!iconRight || showClearButton}
            aria-invalid={!!error}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...rest}
          />

          {showClearButton && (
            <S.ClearButton
              type="button"
              onClick={handleClear}
              aria-label="Limpiar"
              tabIndex={-1}
            >
              <S.ClearIcon>×</S.ClearIcon>
            </S.ClearButton>
          )}

          {iconRight && !showClearButton && (
            <S.IconWrapper position="right">
              {iconRight}
            </S.IconWrapper>
          )}
        </S.InputContainer>

        {error && (
          <S.HelperText id={errorId} error role="alert">
            {error}
          </S.HelperText>
        )}

        {!error && helperText && (
          <S.HelperText id={helperId}>
            {helperText}
          </S.HelperText>
        )}
      </S.InputWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
