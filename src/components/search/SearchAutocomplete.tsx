/**
 * SearchAutocomplete Component
 *
 * Displays a dropdown list of search suggestions for products.
 *
 * @example
 * ```tsx
 * <SearchAutocomplete
 *   suggestions={[{ id: '1', name: 'Product A' }]}
 *   onSelect={(product) => console.log(product)}
 * />
 * ```
 */

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { Product } from '@/types/product';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const AutocompleteContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-height: 300px;
  overflow-y: auto;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const SuggestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SuggestionItem = styled.li<{ $isHighlighted?: boolean }>`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }

  background: ${({ theme, $isHighlighted }) =>
    $isHighlighted ? theme.colors.neutral[50] : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const SuggestionImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  object-fit: cover;
  flex-shrink: 0;
`;

const SuggestionText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Highlight = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

export interface SearchAutocompleteProps {
  /** Array of product suggestions */
  suggestions: Product[];
  /** Callback when a suggestion is selected */
  onSelect: (product: Product) => void;
  /** The current search query for highlighting */
  query: string;
  /** Callback to close the autocomplete when clicked outside */
  onClose: () => void;
  /** Test ID for testing */
  testId?: string;
}

/**
 * SearchAutocomplete component
 *
 * Features:
 * - Displays a list of product suggestions
 * - Highlights the search query within suggestions
 * - Handles keyboard navigation (up, down, enter)
 * - Closes when clicked outside
 *
 * @component
 */
export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  suggestions,
  onSelect,
  query,
  onClose,
  testId = 'search-autocomplete',
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, onClose);

  useEffect(() => {
    setHighlightedIndex(-1); // Reset highlight when suggestions or query change
  }, [suggestions, query]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prevIndex) =>
            Math.min(prevIndex + 1, suggestions.length - 1)
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex !== -1 && suggestions[highlightedIndex]) {
            onSelect(suggestions[highlightedIndex]);
          } else if (suggestions.length > 0 && highlightedIndex === -1 && query) {
            // If enter is pressed without highlighting but there are suggestions, select the first one
            onSelect(suggestions[0]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [highlightedIndex, suggestions, onSelect, onClose, query]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Render text with highlighting
   */
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <SuggestionText>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Highlight key={i}>{part}</Highlight>
          ) : (
            part
          )
        )}
      </SuggestionText>
    );
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <AutocompleteContainer ref={containerRef} data-testid={testId}>
      <SuggestionList>
        {suggestions.map((product, index) => (
          <SuggestionItem
            key={product.id}
            onClick={() => onSelect(product)}
            onMouseEnter={() => setHighlightedIndex(index)}
            $isHighlighted={index === highlightedIndex}
            role="option"
            aria-selected={index === highlightedIndex}
          >
            {product.images && product.images.length > 0 ? (
              <SuggestionImage src={product.images[0].url} alt={product.name} />
            ) : (
              <SuggestionImage
                as="div"
                style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                📦
              </SuggestionImage>
            )}
            {renderHighlightedText(product.name, query)}
          </SuggestionItem>
        ))}
      </SuggestionList>
    </AutocompleteContainer>
  );
};

SearchAutocomplete.displayName = 'SearchAutocomplete';

export default SearchAutocomplete;
