/**
 * Select Component
 *
 * A customizable dropdown select input with label and full width option.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Select
 *   label="Ordenar por"
 *   options={[
 *     { value: 'name', label: 'Nombre' },
 *     { value: 'price', label: 'Precio' },
 *   ]}
 *   value={sortBy}
 *   onChange={(e) => setSortBy(e.target.value)}
 * />
 *
 * // With full width
 * <Select
 *   label="Categoría"
 *   options={categories}
 *   value={selectedCategory}
 *   onChange={(e) => setSelectedCategory(e.target.value)}
 *   fullWidth
 * />
 * ```
 */

import React from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

const SelectWrapper = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StyledSelect = styled.select<{ $fullWidth: boolean }>`
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  height: ${({ theme }) => theme.components.input.height.medium};
  padding: ${({ theme }) => theme.components.input.padding};
  padding-right: ${({ theme }) => theme.spacing[8]}; /* Space for caret icon */
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.components.input.fontSize};
  appearance: none; /* Remove default arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}1A;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const CaretIcon = styled(FiChevronDown)`
  position: absolute;
  right: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Make icon unclickable */
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label for the select input */
  label?: string;
  /** Array of options to display in the select */
  options: SelectOption[];
  /** Current selected value */
  value: string;
  /** Callback when select value changes */
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Makes the select input take full width */
  fullWidth?: boolean;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Custom styled Select component
 */
export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
  id,
  className,
  testId = 'custom-select',
  ...rest
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <SelectWrapper $fullWidth={fullWidth} className={className} data-testid={testId}>
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <StyledSelect
        id={selectId}
        value={value}
        onChange={onChange}
        $fullWidth={fullWidth}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      <CaretIcon size={20} aria-hidden="true" />
    </SelectWrapper>
  );
};

Select.displayName = 'Select';

export default Select;
