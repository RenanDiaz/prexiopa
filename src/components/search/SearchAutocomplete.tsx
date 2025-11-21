/**
 * SearchAutocomplete Component
 *
 * Autocomplete dropdown for search with:
 * - Product suggestions as user types
 * - Recent search history
 * - Popular searches
 * - Keyboard navigation (Arrow up/down, Enter, Escape)
 * - Click outside to close
 *
 * @example
 * ```tsx
 * <SearchAutocomplete
 *   query="leche"
 *   onSelect={(product) => navigate(`/products/${product.id}`)}
 *   onHistorySelect={(query) => setSearchQuery(query)}
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrendingUp, FiSearch, FiPackage } from 'react-icons/fi';
import { useProductSearchQuery } from '@/hooks/useProducts';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import type { Product } from '@/types/product.types';
import * as S from './SearchAutocomplete.styles';

export interface SearchAutocompleteProps {
  /** Current search query */
  query: string;
  /** Callback when a product is selected */
  onSelect?: (product: Product) => void;
  /** Callback when a history item is selected */
  onHistorySelect?: (query: string) => void;
  /** Show suggestions */
  isOpen?: boolean;
  /** Callback when dropdown should close */
  onClose?: () => void;
  /** Custom popular searches */
  popularSearches?: string[];
}

/**
 * SearchAutocomplete Component
 */
export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  query,
  onSelect,
  onHistorySelect,
  isOpen = true,
  onClose,
  popularSearches = ['Leche', 'Pan', 'Arroz', 'Aceite', 'Azúcar'],
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounce query for API calls
  const debouncedQuery = useDebounce(query, 300);

  // Get search history from store
  const searchHistory = useSearchStore((state) => state.searchHistory);
  const addToHistory = useSearchStore((state) => state.addToHistory);

  // Fetch product suggestions
  const { data: suggestions = [], isLoading } = useProductSearchQuery(
    debouncedQuery,
    {
      enabled: debouncedQuery.length >= 2 && isOpen,
    }
  );

  // Close on click outside
  useOnClickOutside(containerRef, () => {
    if (onClose) {
      onClose();
    }
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Determine what to show
  const showHistory = query.length === 0 && searchHistory.length > 0;
  const showPopular = query.length === 0 && !showHistory;
  const showSuggestions = query.length >= 2 && suggestions.length > 0;
  const showNoResults = query.length >= 2 && !isLoading && suggestions.length === 0;
  const showAnything = showHistory || showPopular || showSuggestions || showNoResults;

  // Don't render if nothing to show or closed
  if (!isOpen || !showAnything) {
    return null;
  }

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    addToHistory(product.name);
    if (onSelect) {
      onSelect(product);
    } else {
      navigate(`/products/${product.id}`);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle history item selection
  const handleHistorySelect = (historyQuery: string) => {
    if (onHistorySelect) {
      onHistorySelect(historyQuery);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemCount = suggestions.length || searchHistory.length || popularSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (showSuggestions && suggestions[selectedIndex]) {
            handleProductSelect(suggestions[selectedIndex]);
          } else if (showHistory && searchHistory[selectedIndex]) {
            handleHistorySelect(searchHistory[selectedIndex].query);
          } else if (showPopular && popularSearches[selectedIndex]) {
            handleHistorySelect(popularSearches[selectedIndex]);
          }
        }
        break;
      case 'Escape':
        if (onClose) {
          onClose();
        }
        break;
    }
  };

  return (
    <S.Container ref={containerRef} onKeyDown={handleKeyDown}>
      <S.Dropdown>
        {/* Loading State */}
        {isLoading && (
          <S.Section>
            <S.LoadingText>Buscando productos...</S.LoadingText>
          </S.Section>
        )}

        {/* Product Suggestions */}
        {showSuggestions && !isLoading && (
          <S.Section>
            <S.SectionTitle>
              <FiPackage />
              Productos
            </S.SectionTitle>
            <S.ItemsList>
              {suggestions.map((product, index) => (
                <S.SuggestionItem
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  $isSelected={index === selectedIndex}
                >
                  <S.ProductImage
                    src={product.image || '/placeholder-product.png'}
                    alt={product.name}
                    loading="lazy"
                  />
                  <S.ProductInfo>
                    <S.ProductName>{product.name}</S.ProductName>
                    {product.brand && (
                      <S.ProductBrand>{product.brand}</S.ProductBrand>
                    )}
                  </S.ProductInfo>
                  {product.category && (
                    <S.ProductCategory>{product.category}</S.ProductCategory>
                  )}
                </S.SuggestionItem>
              ))}
            </S.ItemsList>
          </S.Section>
        )}

        {/* No Results */}
        {showNoResults && (
          <S.Section>
            <S.NoResults>
              <S.NoResultsIcon>
                <FiSearch />
              </S.NoResultsIcon>
              <S.NoResultsText>
                No encontramos productos con "{query}"
              </S.NoResultsText>
              <S.NoResultsHint>
                Intenta con otro término de búsqueda
              </S.NoResultsHint>
            </S.NoResults>
          </S.Section>
        )}

        {/* Recent Searches */}
        {showHistory && (
          <S.Section>
            <S.SectionTitle>
              <FiClock />
              Búsquedas recientes
            </S.SectionTitle>
            <S.ItemsList>
              {searchHistory.slice(0, 5).map((item, index) => (
                <S.HistoryItem
                  key={`${item.query}-${item.timestamp}`}
                  onClick={() => handleHistorySelect(item.query)}
                  $isSelected={index === selectedIndex}
                >
                  <S.HistoryIcon>
                    <FiClock />
                  </S.HistoryIcon>
                  <S.HistoryText>{item.query}</S.HistoryText>
                </S.HistoryItem>
              ))}
            </S.ItemsList>
          </S.Section>
        )}

        {/* Popular Searches */}
        {showPopular && (
          <S.Section>
            <S.SectionTitle>
              <FiTrendingUp />
              Búsquedas populares
            </S.SectionTitle>
            <S.ItemsList>
              {popularSearches.map((search, index) => (
                <S.PopularItem
                  key={search}
                  onClick={() => handleHistorySelect(search)}
                  $isSelected={index === selectedIndex}
                >
                  <S.PopularIcon>
                    <FiTrendingUp />
                  </S.PopularIcon>
                  <S.PopularText>{search}</S.PopularText>
                </S.PopularItem>
              ))}
            </S.ItemsList>
          </S.Section>
        )}
      </S.Dropdown>
    </S.Container>
  );
};

export default SearchAutocomplete;
