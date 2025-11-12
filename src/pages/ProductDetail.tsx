/**
 * ProductDetail - Página de detalle de producto
 * Muestra: información del producto, precios por tienda, historial, comparación
 */

import styled from 'styled-components';
import { useParams } from 'react-router-dom';

const ProductContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
  grid-template-columns: 1fr;

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
`;

const ProductImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['6xl']};
  color: ${({ theme }) => theme.colors.text.hint};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ProductTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ProductBrand = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  height: ${({ theme }) => theme.components.button.size.medium.height};
  padding: ${({ theme }) => theme.components.button.size.medium.padding};
  background: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? theme.colors.background.paper
      : theme.colors.primary[500]};
  color: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? theme.colors.text.primary
      : theme.colors.primary.contrast};
  border: ${({ theme, $variant }) =>
    $variant === 'secondary' ? `2px solid ${theme.colors.border.main}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.medium.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'secondary'
        ? theme.colors.neutral[100]
        : theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
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

const PriceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const PriceCard = styled.div<{ $isBest?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  border: 2px solid
    ${({ theme, $isBest }) =>
      $isBest ? theme.colors.primary[500] : theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $isBest }) =>
    $isBest ? theme.colors.primary[50] : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    transform: translateX(4px);
  }
`;

const StoreInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StoreName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StoreLocation = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

const Badge = styled.span<{ $variant?: 'success' | 'info' }>`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  background: ${({ theme, $variant }) =>
    $variant === 'success'
      ? theme.colors.semantic.success.light
      : theme.colors.semantic.info.light};
  color: ${({ theme, $variant }) =>
    $variant === 'success'
      ? theme.colors.semantic.success.dark
      : theme.colors.semantic.info.dark};
`;

const ChartPlaceholder = styled.div`
  width: 100%;
  height: 300px;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.hint};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <ProductContainer>
      <ContentWrapper>
        <Grid>
          <ImageSection>
            <ProductImage>📦</ProductImage>
            <ProductTitle>Producto de Ejemplo</ProductTitle>
            <ProductBrand>Marca Genérica</ProductBrand>
            <ProductBrand>ID: {id}</ProductBrand>

            <ActionButtons>
              <Button $variant="primary">Agregar a Favoritos</Button>
              <Button $variant="secondary">Crear Alerta</Button>
            </ActionButtons>
          </ImageSection>

          <MainContent>
            <Section>
              <SectionTitle>Precios por Tienda</SectionTitle>
              <PriceList>
                <PriceCard $isBest>
                  <StoreInfo>
                    <StoreName>Super 99</StoreName>
                    <StoreLocation>Vía Brasil</StoreLocation>
                  </StoreInfo>
                  <PriceInfo>
                    <Price>$12.99</Price>
                    <Badge $variant="success">Mejor Precio</Badge>
                  </PriceInfo>
                </PriceCard>

                <PriceCard>
                  <StoreInfo>
                    <StoreName>El Rey</StoreName>
                    <StoreLocation>Costa del Este</StoreLocation>
                  </StoreInfo>
                  <PriceInfo>
                    <Price>$14.49</Price>
                    <Badge $variant="info">+$1.50</Badge>
                  </PriceInfo>
                </PriceCard>

                <PriceCard>
                  <StoreInfo>
                    <StoreName>Riba Smith</StoreName>
                    <StoreLocation>Albrook Mall</StoreLocation>
                  </StoreInfo>
                  <PriceInfo>
                    <Price>$15.99</Price>
                    <Badge $variant="info">+$3.00</Badge>
                  </PriceInfo>
                </PriceCard>
              </PriceList>
            </Section>

            <Section>
              <SectionTitle>Historial de Precios</SectionTitle>
              <ChartPlaceholder>
                Gráfico de historial de precios (próximamente)
              </ChartPlaceholder>
            </Section>
          </MainContent>
        </Grid>
      </ContentWrapper>
    </ProductContainer>
  );
};

export default ProductDetail;
