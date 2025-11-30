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

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiCamera, FiX } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchAutocomplete } from './SearchAutocomplete';
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
  /** Callback when Enter key is pressed (useful for barcode search) */
  onEnterPress?: (value: string) => void;
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
  /** Enable autocomplete suggestions */
  enableAutocomplete?: boolean;
  /** Popular searches for autocomplete */
  popularSearches?: string[];
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
  onEnterPress,
  placeholder = 'Buscar productos, marcas...',
  disabled = false,
  debounceDelay = 300,
  className,
  testId = 'search-bar',
  enableAutocomplete = true,
  popularSearches,
}) => {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(value);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousValueRef = useRef(value);

  // Debounced value that triggers the onChange callback
  const debouncedValue = useDebounce(localValue, debounceDelay);

  // Sync local value when external value changes
  useEffect(() => {
    // Only update if the external value changed (not from our own onChange call)
    if (value !== previousValueRef.current) {
      previousValueRef.current = value;
      setLocalValue(value);
    }
  }, [value]);

  // Update parent when debounced value changes (only from user input)
  useEffect(() => {
    // Only call onChange if value actually changed and is different from external value
    if (debouncedValue !== previousValueRef.current && debouncedValue !== value) {
      previousValueRef.current = debouncedValue;
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    if (enableAutocomplete) {
      setIsAutocompleteOpen(true);
    }
  };

  /**
   * Handle input focus
   */
  const handleFocus = () => {
    if (enableAutocomplete) {
      setIsAutocompleteOpen(true);
    }
  };

  /**
   * Clear the search input
   */
  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setIsAutocompleteOpen(false);
    inputRef.current?.focus();
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter' && onEnterPress) {
      // Close autocomplete when Enter is pressed
      setIsAutocompleteOpen(false);
      // Trigger the Enter callback with current value
      onEnterPress(localValue);
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
          ref={inputRef}
          type="text"
          inputMode="search"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Buscar productos"
          aria-describedby="search-hint"
          aria-expanded={isAutocompleteOpen}
          aria-autocomplete="list"
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

      {/* Autocomplete Dropdown */}
      {enableAutocomplete && (
        <SearchAutocomplete
          query={localValue}
          isOpen={isAutocompleteOpen}
          onClose={() => setIsAutocompleteOpen(false)}
          onSelect={(product) => {
            setLocalValue(product.name);
            onChange(product.name);
            setIsAutocompleteOpen(false);
          }}
          onHistorySelect={(query) => {
            setLocalValue(query);
            onChange(query);
            setIsAutocompleteOpen(false);
          }}
          popularSearches={popularSearches}
        />
      )}
    </SearchBarContainer>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
