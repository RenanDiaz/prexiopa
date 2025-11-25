/**
 * SearchFilters Component
 *
 * A comprehensive filtering interface with:
 * - Category dropdown selector
 * - Multi-select store checkboxes
 * - Price range slider (min/max)
 * - Clear filters button
 * - Collapsible on mobile
 * - Active filter count badge
 *
 * @example
 * ```tsx
 * <SearchFilters
 *   categories={['Alimentos', 'Bebidas', 'Limpieza']}
 *   stores={storesArray}
 *   selectedCategory={category}
 *   selectedStores={selectedStoreIds}
 *   priceRange={{ min: 0, max: 100 }}
 *   onFilterChange={(filters) => console.log(filters)}
 *   onClearFilters={() => console.log('Clear all')}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { Store } from '@/types/store.types';
import storePlaceholder from '@/assets/images/store-placeholder.svg';
import {
  FiltersContainer,
  FiltersHeader,
  FiltersTitle,
  FilterBadge,
  CollapseButton,
  ClearFiltersButton,
  FiltersContent,
  FilterSection,
  FilterLabel,
  CategorySelect,
  StoresCheckboxList,
  StoreCheckboxItem,
  StoreCheckbox,
  StoreLabel,
  StoreLogo,
  PriceRangeSection,
  PriceRangeInputs,
  PriceInput,
  PriceRangeSlider,
  PriceSlider,
} from './SearchFilters.styles';

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterChangePayload {
  category?: string;
  stores?: string[];
  priceRange?: PriceRange;
}

export interface SearchFiltersProps {
  /** Available categories for filtering */
  categories: string[];
  /** Available stores for filtering */
  stores: Store[];
  /** Currently selected category */
  selectedCategory?: string;
  /** Currently selected store IDs */
  selectedStores: string[];
  /** Current price range */
  priceRange: PriceRange;
  /** Maximum price for slider */
  maxPrice?: number;
  /** Callback when filters change */
  onFilterChange: (filters: FilterChangePayload) => void;
  /** Callback when clear filters button is clicked */
  onClearFilters: () => void;
  /** Initial collapsed state (mobile) */
  initialCollapsed?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * SearchFilters component for filtering product search results
 *
 * Features:
 * - Category dropdown with all available categories
 * - Multi-select store checkboxes with logos
 * - Price range slider with min/max inputs
 * - Clear all filters button
 * - Collapsible on mobile for better UX
 * - Active filter count badge
 * - Icons: FiFilter, FiX, FiChevronDown
 * - Responsive design
 *
 * @component
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  categories,
  stores,
  selectedCategory,
  selectedStores,
  priceRange,
  maxPrice = 1000,
  onFilterChange,
  onClearFilters,
  initialCollapsed = true,
  className,
  testId = 'search-filters',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((storeId: string) => {
    setFailedImages(prev => new Set(prev).add(storeId));
  }, []);

  /**
   * Calculate number of active filters
   */
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    selectedStores.length +
    (priceRange.min > 0 || priceRange.max < maxPrice ? 1 : 0);

  /**
   * Handle category change
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ category: value || undefined });
  };

  /**
   * Handle store checkbox toggle
   */
  const handleStoreToggle = (storeId: string) => {
    const newSelectedStores = selectedStores.includes(storeId)
      ? selectedStores.filter((id) => id !== storeId)
      : [...selectedStores, storeId];

    onFilterChange({ stores: newSelectedStores });
  };

  /**
   * Handle price range change from inputs
   */
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPriceRange: PriceRange =
      type === 'min'
        ? { min: Math.max(0, Math.min(numValue, priceRange.max)), max: priceRange.max }
        : { min: priceRange.min, max: Math.min(maxPrice, Math.max(numValue, priceRange.min)) };

    onFilterChange({ priceRange: newPriceRange });
  };

  /**
   * Handle price range change from slider
   */
  const handleSliderChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value);
    const newPriceRange: PriceRange =
      type === 'min'
        ? { min: Math.min(numValue, priceRange.max), max: priceRange.max }
        : { min: priceRange.min, max: Math.max(numValue, priceRange.min) };

    onFilterChange({ priceRange: newPriceRange });
  };

  /**
   * Toggle collapsed state
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <FiltersContainer className={className} data-testid={testId}>
      {/* Filters Header */}
      <FiltersHeader>
        <FiltersTitle>
          <FiFilter aria-hidden="true" />
          Filtros
          {activeFiltersCount > 0 && (
            <FilterBadge aria-label={`${activeFiltersCount} filtros activos`}>
              {activeFiltersCount}
            </FilterBadge>
          )}
        </FiltersTitle>

        {/* Mobile Collapse Button */}
        <CollapseButton
          type="button"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'}
          aria-expanded={!isCollapsed}
          className="mobile-only"
        >
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </CollapseButton>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <ClearFiltersButton
            type="button"
            onClick={onClearFilters}
            aria-label="Limpiar todos los filtros"
          >
            <FiX aria-hidden="true" />
            Limpiar
          </ClearFiltersButton>
        )}
      </FiltersHeader>

      {/* Filters Content */}
      <FiltersContent $isCollapsed={isCollapsed}>
        {/* Category Filter */}
        <FilterSection>
          <FilterLabel htmlFor="category-filter">Categoría</FilterLabel>
          <CategorySelect
            id="category-filter"
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </CategorySelect>
        </FilterSection>

        {/* Stores Filter */}
        <FilterSection>
          <FilterLabel>Tiendas</FilterLabel>
          <StoresCheckboxList role="group" aria-label="Filtrar por tienda">
            {stores.map((store) => (
              <StoreCheckboxItem key={store.id}>
                <StoreCheckbox
                  type="checkbox"
                  id={`store-${store.id}`}
                  checked={selectedStores.includes(store.id)}
                  onChange={() => handleStoreToggle(store.id)}
                  aria-label={`Filtrar por ${store.name}`}
                />
                <StoreLabel htmlFor={`store-${store.id}`}>
                  <StoreLogo
                    src={failedImages.has(store.id) || !store.logo ? storePlaceholder : store.logo}
                    alt=""
                    aria-hidden="true"
                    onError={() => handleImageError(store.id)}
                  />
                  {store.name}
                </StoreLabel>
              </StoreCheckboxItem>
            ))}
          </StoresCheckboxList>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection>
          <FilterLabel>Rango de precio</FilterLabel>

          {/* Price Inputs */}
          <PriceRangeSection>
            <PriceRangeInputs>
              <div>
                <label htmlFor="price-min" className="sr-only">
                  Precio mínimo
                </label>
                <PriceInput
                  type="number"
                  id="price-min"
                  value={priceRange.min}
                  onChange={(e) => handlePriceInputChange('min', e.target.value)}
                  min={0}
                  max={priceRange.max}
                  step={0.01}
                  aria-label="Precio mínimo"
                />
              </div>
              <span>-</span>
              <div>
                <label htmlFor="price-max" className="sr-only">
                  Precio máximo
                </label>
                <PriceInput
                  type="number"
                  id="price-max"
                  value={priceRange.max}
                  onChange={(e) => handlePriceInputChange('max', e.target.value)}
                  min={priceRange.min}
                  max={maxPrice}
                  step={0.01}
                  aria-label="Precio máximo"
                />
              </div>
            </PriceRangeInputs>

            {/* Price Range Sliders */}
            <PriceRangeSlider>
              <PriceSlider
                type="range"
                value={priceRange.min}
                onChange={(e) => handleSliderChange('min', e.target.value)}
                min={0}
                max={maxPrice}
                step={0.01}
                aria-label="Deslizador de precio mínimo"
                $isMin
              />
              <PriceSlider
                type="range"
                value={priceRange.max}
                onChange={(e) => handleSliderChange('max', e.target.value)}
                min={0}
                max={maxPrice}
                step={0.01}
                aria-label="Deslizador de precio máximo"
                $isMin={false}
              />
            </PriceRangeSlider>
          </PriceRangeSection>
        </FilterSection>
      </FiltersContent>
    </FiltersContainer>
  );
};

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;
