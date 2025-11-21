/**
 * SearchBar Component
 *
 * A fully-featured search input with:
 * - Debounced input (300ms) for performance
 * - Search icon on the left
 * - Barcode scanner button on the right
 * - Clear button when text is present
 * - Full responsive design (mobile-first)
 * - Proper accessibility with ARIA labels
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onScanClick={() => console.log('Open scanner')}
 *   placeholder="Buscar productos..."
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { FiSearch, FiCamera, FiX } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import {
  SearchBarContainer,
  SearchInputWrapper,
  SearchIcon,
  SearchInput,
  ClearButton,
  ScanButton,
} from './SearchBar.styles';

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes (debounced) */
  onChange: (value: string) => void;
  /** Callback when scan button is clicked */
  onScanClick?: () => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * SearchBar component with debounced input and barcode scanner
 *
 * Features:
 * - Debounced input (300ms default)
 * - Search icon (FiSearch)
 * - Barcode scanner button (FiCamera)
 * - Clear button (X) when text is present
 * - Responsive full-width on mobile
 * - Keyboard shortcuts support (Escape to clear)
 * - Proper ARIA labels for accessibility
 *
 * @component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onScanClick,
  placeholder = 'Buscar productos, marcas...',
  disabled = false,
  debounceDelay = 300,
  className,
  testId = 'search-bar',
}) => {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(value);

  // Debounced value that triggers the onChange callback
  const debouncedValue = useDebounce(localValue, debounceDelay);

  // Update parent when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  /**
   * Clear the search input
   */
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  /**
   * Handle scan button click
   */
  const handleScanClick = () => {
    if (onScanClick && !disabled) {
      onScanClick();
    }
  };

  return (
    <SearchBarContainer className={className} data-testid={testId}>
      <SearchInputWrapper>
        {/* Search Icon */}
        <SearchIcon aria-hidden="true">
          <FiSearch />
        </SearchIcon>

        {/* Search Input */}
        <SearchInput
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Buscar productos"
          aria-describedby="search-hint"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Clear Button (visible when text is present) */}
        {localValue && !disabled && (
          <ClearButton
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            data-testid="search-clear-button"
          >
            <FiX />
          </ClearButton>
        )}

        {/* Barcode Scanner Button */}
        {onScanClick && (
          <ScanButton
            type="button"
            onClick={handleScanClick}
            disabled={disabled}
            aria-label="Escanear código de barras"
            title="Escanear código de barras"
            data-testid="search-scan-button"
          >
            <FiCamera />
          </ScanButton>
        )}
      </SearchInputWrapper>

      {/* Screen reader hint */}
      <span id="search-hint" className="sr-only">
        Escribe para buscar productos. Presiona Escape para limpiar.
      </span>
    </SearchBarContainer>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
