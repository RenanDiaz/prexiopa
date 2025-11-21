/**
 * Dashboard - Página principal de Prexiopá
 * Muestra: buscador, filtros y listado de productos
 * Integra componentes de búsqueda, filtrado y escaneo de código de barras
 */

import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';

// Components
import { SearchBar, SearchFilters } from '@/components/search';
import { BarcodeScanner } from '@/components/scanner';
import { ProductList } from '@/components/products';
import { Select } from '@/components/common/Select'; // Import Select component

// Hooks
import { useProductsQuery, useCategoriesQuery } from '@/hooks/useProducts';
import { useStoresQuery } from '@/hooks/useStores';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSearchStore } from '@/store/searchStore'; // Import useSearchStore

// Types
import type { PriceRange, FilterChangePayload } from '@/components/search/SearchFilters';
import type { ProductFilters } from '@/services/supabase/products';
import type { ProductWithLowestPrice } from '@/types/product';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[6]};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  @media (min-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  @media (min-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[6]};

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;

const SidebarSection = styled.aside<{ $isOpen: boolean }>`
  @media (max-width: 1023px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.5);
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  }
`;

const FiltersWrapper = styled.div<{ $isOpen: boolean }>`
  @media (max-width: 1023px) {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 85%;
    max-width: 320px;
    background: ${({ theme }) => theme.colors.background.paper};
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
    transition: transform 0.3s ease;
    overflow-y: auto;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const MobileFiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileFiltersTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const MainSection = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const MobileFilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  height: ${({ theme }) => theme.components.button.size.medium.height};
  padding: ${({ theme }) => theme.components.button.size.medium.padding};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.medium.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
    border-color: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.primary[500]};
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ResultsCount = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  strong {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ActiveFiltersCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-left: ${({ theme }) => theme.spacing[2]};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.semantic.error.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.error.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.semantic.error.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  text-align: center;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // Search & Filter State from Zustand
  const searchQuery = useSearchStore((state) => state.query);
  const { filters, setFilters, clearFilters: zustandClearFilters } = useSearchStore();
  const { category: selectedCategory, store: selectedStores, priceRange, sortBy, sortOrder } = filters;

  // Local UI State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Data Queries
  const { data: categories = [] } = useCategoriesQuery();
  const { data: stores = [] } = useStoresQuery();

  // Build filters for products query
  const productFilters: ProductFilters = {
    query: searchQuery || undefined,
    category: selectedCategory,
    storeId: selectedStores,
    minPrice: priceRange?.min && priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange?.max && priceRange.max < 500 ? priceRange.max : undefined,
    limit: 50,
    sortBy: sortBy,
    sortOrder: sortOrder,
  };

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProductsQuery(productFilters);

  // Calculate active filters count
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedStores ? 1 : 0) + // Assuming selectedStores is a single string ID for simplicity here, adjust if it's an array
    (priceRange?.min && priceRange.min > 0 || priceRange?.max && priceRange.max < 500 ? 1 : 0);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    // This is handled by SearchBar's internal debounced onChange which will call Zustand's setQuery
    // For now, local search bar state is sufficient, `searchQuery` is from Zustand
  }, []);

  const handleAutocompleteSelect = useCallback((product: Product) => {
    navigate(`/product/${product.id}`);
  }, [navigate]);

  const handleScannerOpen = useCallback(() => {
    setIsScannerOpen(true);
  }, []);

  const handleScannerClose = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  const handleScanSuccess = useCallback(
    (barcode: string) => {
      setIsScannerOpen(false);
      // Search for product with barcode
      setFilters({ query: barcode }); // Set query via Zustand
      // TODO: Potentially trigger a search for the barcode directly here
    },
    [setFilters]
  );

  const handleFilterChange = useCallback((payload: FilterChangePayload) => {
    setFilters({
      category: payload.category !== undefined ? payload.category : filters.category,
      store: payload.stores !== undefined ? (payload.stores.length > 0 ? payload.stores[0] : undefined) : filters.store,
      priceRange: payload.priceRange !== undefined ? payload.priceRange : filters.priceRange,
    });
  }, [setFilters, filters]);

  const handleClearFilters = useCallback(() => {
    zustandClearFilters(); // Clear filters via Zustand
  }, [zustandClearFilters]);

  const handleProductClick = useCallback(
    (product: ProductWithLowestPrice) => {
      navigate(`/product/${product.id}`);
    },
    [navigate]
  );

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split(':');
    setFilters({
      sortBy: newSortBy as 'price' | 'name' | 'relevance',
      sortOrder: newSortOrder as 'asc' | 'desc',
    });
  }, [setFilters]);

  const sortOptions = [
    { value: 'relevance:asc', label: 'Relevancia' },
    { value: 'name:asc', label: 'Nombre (A-Z)' },
    { value: 'name:desc', label: 'Nombre (Z-A)' },
    { value: 'price:asc', label: 'Precio (Menor a Mayor)' },
    { value: 'price:desc', label: 'Precio (Mayor a Menor)' },
  ];

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Title>Compara Precios</Title>
          <Subtitle>Encuentra los mejores precios en supermercados de Panamá</Subtitle>
          <SearchBar
            value={searchQuery}
            onChange={(val) => useSearchStore.getState().setQuery(val)}
            onScanClick={handleScannerOpen}
            onSearchAutocomplete={handleAutocompleteSelect}
            placeholder="Buscar productos por nombre o código de barras..."
          />
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Filters Sidebar */}
        <SidebarSection $isOpen={isFiltersOpen}>
          <FiltersWrapper $isOpen={isFiltersOpen}>
            {isMobile && (
              <MobileFiltersHeader>
                <MobileFiltersTitle>Filtros</MobileFiltersTitle>
                <CloseButton onClick={() => setIsFiltersOpen(false)} aria-label="Cerrar filtros">
                  <FiX size={24} />
                </CloseButton>
              </MobileFiltersHeader>
            )}
            <SearchFilters
              categories={categories}
              stores={stores}
              selectedCategory={selectedCategory}
              selectedStores={selectedStores ? [selectedStores] : []} // Convert back to array for SearchFilters
              priceRange={priceRange || { min: 0, max: 500 }}
              maxPrice={500}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </FiltersWrapper>
        </SidebarSection>

        {/* Main Content */}
        <MainSection>
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <MobileFilterButton onClick={() => setIsFiltersOpen(true)}>
              <FiFilter size={20} />
              Filtros
              {activeFiltersCount > 0 && <ActiveFiltersCount>{activeFiltersCount}</ActiveFiltersCount>}
            </MobileFilterButton>
          )}

          {/* Results Header */}
          <ResultsHeader>
            <ResultsCount>
              {productsLoading ? (
                'Cargando productos...'
              ) : productsError ? (
                'Error al cargar productos'
              ) : (
                <>
                  Mostrando <strong>{products.length}</strong>{' '}
                  {products.length === 1 ? 'producto' : 'productos'}
                </>
              )}
            </ResultsCount>
            <Select
              label="Ordenar por"
              options={sortOptions}
              value={`${sortBy}:${sortOrder}`}
              onChange={handleSortChange}
              aria-label="Ordenar resultados por"
            />
          </ResultsHeader>

          {/* Error Message */}
          {productsError && (
            <ErrorMessage>
              Ocurrió un error al cargar los productos. Por favor, intenta de nuevo más tarde.
            </ErrorMessage>
          )}

          {/* Products Grid */}
          {!productsError && (
            <ProductList
              products={products}
              isLoading={productsLoading}
              onProductClick={handleProductClick}
              emptyMessage={
                searchQuery || activeFiltersCount > 0
                  ? 'No se encontraron productos con los filtros seleccionados'
                  : 'Usa el buscador o filtros para encontrar productos'
              }
            />
          )}
        </MainContent>
      </MainContent>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={handleScannerClose}
          onScan={handleScanSuccess}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
