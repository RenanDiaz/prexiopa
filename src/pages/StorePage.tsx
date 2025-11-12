/**
 * StorePage - Página de tienda individual
 * Muestra: información de la tienda, productos disponibles, ubicaciones
 */

import styled from 'styled-components';
import { useParams } from 'react-router-dom';

const StoreContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[8]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
`;

const StoreLogo = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.secondary[500]},
    ${({ theme }) => theme.colors.primary[500]}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const StoreInfo = styled.div`
  flex: 1;
  min-width: 300px;
`;

const StoreName = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StoreDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const StatsGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

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
`;

const ProductCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-4px);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
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

const LocationsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LocationCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const LocationName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const LocationAddress = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const StorePage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <StoreContainer>
      <ContentWrapper>
        <Header>
          <StoreHeader>
            <StoreLogo>🏪</StoreLogo>
            <StoreInfo>
              <StoreName>Tienda de Ejemplo</StoreName>
              <StoreDescription>
                La mejor tienda para comprar productos de calidad al mejor precio
              </StoreDescription>
              <StatsGrid>
                <StatItem>
                  <StatLabel>Productos</StatLabel>
                  <StatValue>1,250+</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Ubicaciones</StatLabel>
                  <StatValue>15</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Calificación</StatLabel>
                  <StatValue>4.8</StatValue>
                </StatItem>
              </StatsGrid>
            </StoreInfo>
          </StoreHeader>
        </Header>

        <Section>
          <SectionTitle>Productos Disponibles (ID: {id})</SectionTitle>
          <ProductGrid>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ProductCard key={item}>
                <ProductImage>📦</ProductImage>
                <ProductName>Producto de Ejemplo {item}</ProductName>
                <ProductPrice>$19.99</ProductPrice>
              </ProductCard>
            ))}
          </ProductGrid>
        </Section>

        <Section>
          <SectionTitle>Ubicaciones</SectionTitle>
          <LocationsGrid>
            <LocationCard>
              <LocationName>Sucursal Vía Brasil</LocationName>
              <LocationAddress>
                Vía Brasil, Plaza Brasil Local 123<br />
                Ciudad de Panamá, Panamá<br />
                Tel: 507-123-4567
              </LocationAddress>
            </LocationCard>

            <LocationCard>
              <LocationName>Sucursal Costa del Este</LocationName>
              <LocationAddress>
                Costa del Este, Town Center Local 45<br />
                Ciudad de Panamá, Panamá<br />
                Tel: 507-234-5678
              </LocationAddress>
            </LocationCard>

            <LocationCard>
              <LocationName>Sucursal Albrook Mall</LocationName>
              <LocationAddress>
                Albrook Mall, Nivel 1 Local 234<br />
                Ciudad de Panamá, Panamá<br />
                Tel: 507-345-6789
              </LocationAddress>
            </LocationCard>

            <LocationCard>
              <LocationName>Sucursal Multiplaza</LocationName>
              <LocationAddress>
                Multiplaza Pacific, Nivel 2 Local 156<br />
                Ciudad de Panamá, Panamá<br />
                Tel: 507-456-7890
              </LocationAddress>
            </LocationCard>
          </LocationsGrid>
        </Section>
      </ContentWrapper>
    </StoreContainer>
  );
};

export default StorePage;
