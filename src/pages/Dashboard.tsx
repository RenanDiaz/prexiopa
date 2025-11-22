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
import { ProductList, CreateProductModal } from '@/components/products';

// Hooks
import { useProductsQuery, useCategoriesQuery } from '@/hooks/useProducts';
import { useStoresQuery } from '@/hooks/useStores';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Types
import type { PriceRange, FilterChangePayload } from '@/components/search/SearchFilters';
import type { ProductFilters, CreateProductInput } from '@/services/supabase/products';
import type { Product } from '@/types/product.types';

// Services
import { createProduct } from '@/services/supabase/products';
import { toast } from 'react-toastify';

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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 500 });

  // UI State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');

  // Data Queries
  const { data: categories = [] } = useCategoriesQuery();
  const { data: stores = [] } = useStoresQuery();

  // Build filters for products query
  const filters: ProductFilters = {
    query: searchQuery || undefined,
    category: selectedCategory,
    storeId: selectedStores.length === 1 ? selectedStores[0] : undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 500 ? priceRange.max : undefined,
    limit: 50,
  };

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProductsQuery(filters);

  // Calculate active filters count
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    selectedStores.length +
    (priceRange.min > 0 || priceRange.max < 500 ? 1 : 0);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleScannerOpen = useCallback(() => {
    setIsScannerOpen(true);
  }, []);

  const handleScannerClose = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  const handleScanSuccess = useCallback((barcode: string) => {
    setIsScannerOpen(false);
    setScannedBarcode(barcode);
    // Always show the modal when a barcode is scanned
    // The modal can check if the product exists and show appropriate UI
    setIsCreateProductModalOpen(true);
  }, []);

  const handleCreateProduct = useCallback(async (productData: CreateProductInput) => {
    try {
      const newProduct = await createProduct(productData);
      toast.success(`Producto "${newProduct.name}" creado exitosamente`);
      setIsCreateProductModalOpen(false);
      setScannedBarcode('');
      // Refresh products
      setSearchQuery('');
      setTimeout(() => setSearchQuery(productData.barcode), 100);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto. Inténtalo de nuevo.');
    }
  }, []);

  const handleFilterChange = useCallback((payload: FilterChangePayload) => {
    if (payload.category !== undefined) {
      setSelectedCategory(payload.category || undefined);
    }
    if (payload.stores !== undefined) {
      setSelectedStores(payload.stores);
    }
    if (payload.priceRange !== undefined) {
      setPriceRange(payload.priceRange);
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setSelectedStores([]);
    setPriceRange({ min: 0, max: 500 });
  }, []);

  const handleProductClick = useCallback(
    (product: Product) => {
      navigate(`/product/${product.id}`);
    },
    [navigate]
  );

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Title>Compara Precios</Title>
          <Subtitle>Encuentra los mejores precios en supermercados de Panamá</Subtitle>
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            onScanClick={handleScannerOpen}
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
              selectedStores={selectedStores}
              priceRange={priceRange}
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
        </MainSection>
      </MainContent>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={handleScannerClose}
        onScan={handleScanSuccess}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        barcode={scannedBarcode}
        onClose={() => {
          setIsCreateProductModalOpen(false);
          setScannedBarcode('');
        }}
        onCreateProduct={handleCreateProduct}
      />
    </DashboardContainer>
  );
};

export default Dashboard;
