/**
 * ProductDetail - Página de detalle de producto
 * Muestra: información del producto, precios por tienda, comparación y favoritos
 * Integra componentes de comparación de precios y botón de favoritos
 */

import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight, FiPackage, FiTag, FiHash, FiBell } from 'react-icons/fi';
import { useState } from 'react';

// Components
import { PriceComparison } from '@/components/products';
import { FavoriteButton } from '@/components/favorites';
import { PriceAlert } from '@/components/alerts';
import { Button } from '@/components/common/Button';

// Hooks
import { useProductQuery, useProductPricesQuery } from '@/hooks/useProducts';
import { useHasAlertQuery } from '@/hooks/useAlerts';

const ProductContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[6]};
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BreadcrumbLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 400px 1fr;
  }
`;

const ImageSection = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  height: fit-content;
  position: sticky;
  top: 80px;
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProductImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  color: ${({ theme }) => theme.colors.text.hint};
`;

const FavoriteButtonWrapper = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
`;

const ProductHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ProductTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const MetaLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[700]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: capitalize;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  margin: ${({ theme }) => theme.spacing[4]} 0;
`;

const ProductDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 80px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  opacity: 0.5;
`;

const ErrorTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Fetch product and prices
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useProductQuery(id);

  const {
    data: prices = [],
    isLoading: isLoadingPrices,
  } = useProductPricesQuery(id);

  // Check if user has alert for this product
  const { data: hasAlert } = useHasAlertQuery(id || '', null);

  // Get lowest price for alert
  const lowestPrice = prices.length > 0
    ? Math.min(...prices.map(p => p.price))
    : undefined;

  // Loading state
  if (isLoadingProduct) {
    return (
      <ProductContainer>
        <ContentWrapper>
          <LoadingContainer>Cargando producto...</LoadingContainer>
        </ContentWrapper>
      </ProductContainer>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <ProductContainer>
        <ContentWrapper>
          <ErrorContainer>
            <ErrorIcon>📦</ErrorIcon>
            <ErrorTitle>Producto no encontrado</ErrorTitle>
            <ErrorMessage>
              No pudimos encontrar el producto que buscas. Es posible que haya sido eliminado o que
              la URL sea incorrecta.
            </ErrorMessage>
            <BackButton to="/">Volver al inicio</BackButton>
          </ErrorContainer>
        </ContentWrapper>
      </ProductContainer>
    );
  }

  return (
    <ProductContainer>
      <ContentWrapper>
        {/* Breadcrumb Navigation */}
        <Breadcrumb aria-label="Navegación">
          <BreadcrumbLink to="/">Inicio</BreadcrumbLink>
          <FiChevronRight size={16} />
          {product.category && (
            <>
              <BreadcrumbLink to={`/?category=${product.category}`}>
                {product.category}
              </BreadcrumbLink>
              <FiChevronRight size={16} />
            </>
          )}
          <BreadcrumbCurrent>{product.name}</BreadcrumbCurrent>
        </Breadcrumb>

        {/* Main Grid */}
        <Grid>
          {/* Left Column - Product Image & Details */}
          <ImageSection>
            <ProductImageWrapper>
              {product.images?.[0]?.url ? (
                <ProductImage src={product.images[0].url} alt={product.images[0].alt || product.name} />
              ) : (
                <ProductImagePlaceholder>📦</ProductImagePlaceholder>
              )}
              <FavoriteButtonWrapper>
                <FavoriteButton productId={product.id} size="lg" />
              </FavoriteButtonWrapper>
            </ProductImageWrapper>

            <ProductHeader>
              <ProductTitle>{product.name}</ProductTitle>

              <ProductMeta>
                {product.brand && (
                  <MetaItem>
                    <FiTag size={16} />
                    <MetaLabel>Marca:</MetaLabel>
                    {product.brand}
                  </MetaItem>
                )}

                {product.category && (
                  <MetaItem>
                    <FiPackage size={16} />
                    <MetaLabel>Categoría:</MetaLabel>
                    <CategoryBadge>{product.category}</CategoryBadge>
                  </MetaItem>
                )}

                {product.barcode && (
                  <MetaItem>
                    <FiHash size={16} />
                    <MetaLabel>Código de barras:</MetaLabel>
                    {product.barcode}
                  </MetaItem>
                )}
              </ProductMeta>
            </ProductHeader>

            {product.description && (
              <>
                <Divider />
                <ProductDescription>{product.description}</ProductDescription>
              </>
            )}

            <Divider />

            {/* Alert Button */}
            <Button
              variant={hasAlert ? 'outline' : 'secondary'}
              fullWidth
              iconLeft={<FiBell />}
              onClick={() => setIsAlertModalOpen(true)}
            >
              {hasAlert ? 'Editar Alerta de Precio' : 'Crear Alerta de Precio'}
            </Button>
          </ImageSection>

          {/* Right Column - Price Comparison */}
          <MainContent>
            <Section>
              <SectionTitle>Comparación de Precios</SectionTitle>
              <PriceComparison prices={prices} />
              {isLoadingPrices && (
                <LoadingContainer>Cargando precios...</LoadingContainer>
              )}
            </Section>
          </MainContent>
        </Grid>
      </ContentWrapper>

      {/* Price Alert Modal */}
      {product && (
        <PriceAlert
          open={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          productId={product.id}
          productName={product.name}
          currentPrice={lowestPrice}
        />
      )}
    </ProductContainer>
  );
};

export default ProductDetail;
