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
 * - Integrates SearchAutocomplete for product suggestions
 *
 * @example
 * ```tsx
 * // Basic usage with autocomplete
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onScanClick={() => console.log('Open scanner')}
 *   onSearchAutocomplete={(product) => navigate(`/product/${product.id}`)}
 *   placeholder="Buscar productos..."
 * />
 * ```
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiCamera, FiX } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductSearchQuery } from '@/hooks/useProducts';
import type { Product } from '@/types/product';
import SearchAutocomplete from './SearchAutocomplete'; // Import the new component
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
  /** Callback when an autocomplete suggestion is selected */
  onSearchAutocomplete?: (product: Product) => void; // New prop for autocomplete selection
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
 * SearchBar component with debounced input, barcode scanner and autocomplete
 *
 * Features:
 * - Debounced input (300ms default)
 * - Search icon (FiSearch)
 * - Barcode scanner button (FiCamera)
 * - Clear button (X) when text is present
 * - Responsive full-width on mobile
 * - Keyboard shortcuts support (Escape to clear)
 * - Proper ARIA labels for accessibility
 * - Integrates SearchAutocomplete for live product suggestions
 *
 * @component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onScanClick,
  onSearchAutocomplete, // Destructure new prop
  placeholder = 'Buscar productos, marcas...',
  disabled = false,
  debounceDelay = 300,
  className,
  testId = 'search-bar',
}) => {
  // Local state for immediate UI updates and autocomplete visibility
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null); // Ref for click outside detection

  // Debounced value that triggers the onChange callback
  const debouncedValue = useDebounce(localValue, debounceDelay);

  // Use hook to fetch product suggestions
  const { data: suggestions = [] } = useProductSearchQuery(debouncedValue, {
    enabled: showSuggestions && !!debouncedValue && debouncedValue.length >= 2, // Only fetch if suggestions are shown and query is valid
  });

  // Update parent when debounced value changes
  useEffect(() => {
    // Only trigger onChange if the debounced value actually changed and it's not from an autocomplete selection
    if (debouncedValue !== value && !isSelectingSuggestion.current) {
      onChange(debouncedValue);
    }
    // Reset the flag
    isSelectingSuggestion.current = false;
  }, [debouncedValue, onChange, value]);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Flag to prevent onChange from firing immediately after autocomplete selection
  const isSelectingSuggestion = useRef(false);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setShowSuggestions(true); // Show suggestions when user types
  };

  /**
   * Clear the search input
   */
  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setShowSuggestions(false); // Hide suggestions when cleared
  };

  /**
   * Handle autocomplete suggestion selection
   */
  const handleSelectSuggestion = (product: Product) => {
    isSelectingSuggestion.current = true; // Set flag
    setLocalValue(product.name); // Update input with selected product name
    onChange(product.name); // Trigger parent onChange for immediate consistency
    setShowSuggestions(false); // Hide suggestions
    onSearchAutocomplete?.(product); // Trigger the prop callback
  };

  /**
   * Handle keyboard shortcuts for accessibility (e.g., Escape to close suggestions)
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
      // Allow SearchAutocomplete to handle its own keyboard navigation
    },
    [handleClear]
  );

  /**
   * Handle scan button click
   */
  const handleScanClick = () => {
    if (onScanClick && !disabled) {
      onScanClick();
      setShowSuggestions(false); // Hide suggestions when scanner opens
    }
  };

  /**
   * Close suggestions when clicking outside the search bar, but not if clicking on a suggestion itself
   */
  const handleCloseSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return (
    <SearchBarContainer className={className} data-testid={testId} ref={searchBarRef}>
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
          onFocus={() => setShowSuggestions(true)} // Show suggestions when input is focused
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

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && localValue.length >= 2 && (
        <SearchAutocomplete
          suggestions={suggestions}
          onSelect={handleSelectSuggestion}
          query={debouncedValue} // Use debounced value for highlighting
          onClose={handleCloseSuggestions}
        />
      )}

      {/* Screen reader hint */}
      <span id="search-hint" className="sr-only">
        Escribe para buscar productos. Presiona Escape para limpiar.
      </span>
    </SearchBarContainer>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;

