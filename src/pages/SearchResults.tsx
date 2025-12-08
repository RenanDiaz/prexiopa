/**
 * SearchResults - Página de resultados de búsqueda
 * Muestra productos filtrados según la búsqueda del usuario
 */

import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';

const SearchContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const SearchInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SearchQuery = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ResultCount = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary[500] : theme.colors.background.paper};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.contrast : theme.colors.text.primary};
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary[500] : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary[600] : theme.colors.primary[50]};
  }
`;

const MainLayout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: 280px 1fr;
  }
`;

const Sidebar = styled.aside`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  height: fit-content;
`;

const SidebarTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FilterSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;

const ResultsArea = styled.div``;

const ProductGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    transform: translateY(-4px);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

const PriceRange = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: ${({ theme }) => theme.spacing[2]};
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <SearchContainer>
      <ContentWrapper>
        <Header>
          <SearchInfo>
            <SearchQuery>
              Resultados para: "{query || 'búsqueda'}"
            </SearchQuery>
            <ResultCount>Se encontraron 24 productos</ResultCount>
          </SearchInfo>

          <FilterBar>
            <FilterButton $active>Todos</FilterButton>
            <FilterButton>Menor precio</FilterButton>
            <FilterButton>Mayor precio</FilterButton>
            <FilterButton>Más relevante</FilterButton>
            <FilterButton>Mejores ofertas</FilterButton>
          </FilterBar>
        </Header>

        <MainLayout>
          <Sidebar>
            <SidebarTitle>Filtros</SidebarTitle>

            <FilterSection>
              <FilterLabel>Categorías</FilterLabel>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Alimentos (12)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Bebidas (8)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Limpieza (4)
                </CheckboxLabel>
              </CheckboxGroup>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Tiendas</FilterLabel>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Super 99 (10)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  El Rey (8)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Riba Smith (6)
                </CheckboxLabel>
              </CheckboxGroup>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Rango de Precio</FilterLabel>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Menos de $10 (5)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  $10 - $25 (12)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" />
                  Más de $25 (7)
                </CheckboxLabel>
              </CheckboxGroup>
            </FilterSection>
          </Sidebar>

          <ResultsArea>
            <ProductGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <ProductCard key={item}>
                  <ProductImage><Package size={48} /></ProductImage>
                  <ProductName>Producto de Búsqueda {item}</ProductName>
                  <ProductPrice>
                    $19.99
                    <PriceRange>desde</PriceRange>
                  </ProductPrice>
                </ProductCard>
              ))}
            </ProductGrid>
          </ResultsArea>
        </MainLayout>
      </ContentWrapper>
    </SearchContainer>
  );
};

export default SearchResults;
