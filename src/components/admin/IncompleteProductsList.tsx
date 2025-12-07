/**
 * IncompleteProductsList - Admin component to view and manage incomplete products
 * Shows products with missing information and allows moderators to contribute data
 */

import { useState } from 'react';
import styled from 'styled-components';
import { FiAlertCircle, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  useIncompleteProductsData,
  useCompletenessStatsQuery,
} from '@/hooks/useIncompleteProducts';
import { useCategoriesQuery } from '@/hooks/useProducts';
import type { IncompleteProductsFilters } from '@/types/incomplete-product';
import {
  getFieldLabel,
  getCompletenessColor,
  getCompletenessLevel,
  sortMissingFieldsByPriority,
} from '@/types/incomplete-product';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FiltersBar = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: flex-end;
  flex-wrap: wrap;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Select = styled.select`
  height: 40px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.paper};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}1A;
  }
`;

const RefreshButton = styled.button`
  height: 40px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProductsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[5]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const ProductMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CompletenessIndicator = styled.div<{ $score: number }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ScoreBadge = styled.div<{ $score: number }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: ${({ $score }) => getCompletenessColor($score).light};
  color: ${({ $score }) => getCompletenessColor($score).dark};
  white-space: nowrap;
`;

const ProgressBar = styled.div`
  width: 120px;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $score: number }>`
  height: 100%;
  width: ${({ $score }) => $score}%;
  background: ${({ $score }) => getCompletenessColor($score).main};
  transition: width 0.3s ease;
`;

const MissingFieldsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const MissingFieldBadge = styled.div`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ theme }) => theme.colors.semantic.error.light};
  color: ${({ theme }) => theme.colors.semantic.error.dark};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const FooterInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[6]};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const IncompleteProductsList = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: stats } = useCompletenessStatsQuery();

  // Filters state
  const [filters, setFilters] = useState<IncompleteProductsFilters>({
    minCompleteness: 0,
    maxCompleteness: 80,
    categoryId: undefined,
    limit: 50,
    offset: 0,
  });

  // Query incomplete products
  const { products, totalCount, isLoading, refetch } = useIncompleteProductsData(filters);

  const handleFilterChange = (key: keyof IncompleteProductsFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container>
      <Header>
        <Title>Productos Incompletos</Title>
        <Subtitle>
          Revisa y completa la información de productos con datos faltantes
        </Subtitle>
      </Header>

      {/* Statistics */}
      {stats && (
        <StatsGrid>
          <StatCard>
            <StatLabel>Total de Productos</StatLabel>
            <StatValue>{stats.total_products}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Productos Incompletos</StatLabel>
            <StatValue>{stats.incomplete_products}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Completitud Promedio</StatLabel>
            <StatValue>{stats.avg_completeness.toFixed(1)}%</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Productos Completos</StatLabel>
            <StatValue>{stats.complete_products}</StatValue>
          </StatCard>
        </StatsGrid>
      )}

      {/* Filters */}
      <FiltersBar>
        <FilterGroup>
          <Label htmlFor="completeness">Nivel de Completitud</Label>
          <Select
            id="completeness"
            value={filters.maxCompleteness}
            onChange={(e) => handleFilterChange('maxCompleteness', Number(e.target.value))}
          >
            <option value={30}>Crítico (&lt; 30%)</option>
            <option value={50}>Bajo (&lt; 50%)</option>
            <option value={80}>Medio (&lt; 80%)</option>
            <option value={99}>Alto (&lt; 100%)</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="category">Categoría</Label>
          <Select
            id="category"
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <RefreshButton onClick={() => refetch()}>
          <FiRefreshCw />
          Actualizar
        </RefreshButton>
      </FiltersBar>

      {/* Products List */}
      {isLoading ? (
        <LoadingState>Cargando productos incompletos...</LoadingState>
      ) : products.length === 0 ? (
        <EmptyState>
          <EmptyIcon>✅</EmptyIcon>
          <EmptyTitle>¡No hay productos incompletos!</EmptyTitle>
          <EmptyText>
            Todos los productos en esta categoría tienen la información completa.
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <ProductsList>
            {products.map((product) => (
              <ProductCard key={product.id} onClick={() => handleProductClick(product.id)}>
                <ProductHeader>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductMeta>
                      {product.category || 'Sin categoría'} • {product.contribution_count}{' '}
                      contribuciones
                    </ProductMeta>
                  </ProductInfo>
                  <CompletenessIndicator $score={product.completeness_score}>
                    <ScoreBadge $score={product.completeness_score}>
                      {product.completeness_score}%
                    </ScoreBadge>
                    <ProgressBar>
                      <ProgressFill $score={product.completeness_score} />
                    </ProgressBar>
                  </CompletenessIndicator>
                </ProductHeader>

                <MissingFieldsContainer>
                  {sortMissingFieldsByPriority(product.missing_fields).map((field) => (
                    <MissingFieldBadge key={field}>
                      <FiAlertCircle size={12} />
                      {getFieldLabel(field)}
                    </MissingFieldBadge>
                  ))}
                </MissingFieldsContainer>

                <ProductFooter>
                  <FooterInfo>
                    Última actualización: {formatDate(product.last_updated)}
                  </FooterInfo>
                  <FooterInfo>Haz clic para ver y contribuir</FooterInfo>
                </ProductFooter>
              </ProductCard>
            ))}
          </ProductsList>
        </>
      )}
    </Container>
  );
};

export default IncompleteProductsList;
