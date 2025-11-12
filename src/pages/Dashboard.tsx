/**
 * Dashboard - Página principal de Prexiopá
 * Muestra: productos destacados, top ofertas, tendencias de precios
 */

import styled from 'styled-components';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
`;

const ContentGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    transform: translateY(-4px);
  }
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const Badge = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <Header>
        <Title>Dashboard</Title>
        <Subtitle>Bienvenido a Prexiopá - Compara precios y ahorra en Panamá</Subtitle>
      </Header>

      <ContentGrid>
        <Card>
          <CardTitle>Productos Destacados</CardTitle>
          <CardDescription>
            Descubre los productos más buscados y compara precios entre diferentes tiendas.
          </CardDescription>
          <Badge>Próximamente</Badge>
        </Card>

        <Card>
          <CardTitle>Top Ofertas</CardTitle>
          <CardDescription>
            Las mejores ofertas del momento. Ahorra hasta 50% en productos seleccionados.
          </CardDescription>
          <Badge>Nuevo</Badge>
        </Card>

        <Card>
          <CardTitle>Tendencias de Precios</CardTitle>
          <CardDescription>
            Visualiza el historial de precios y toma decisiones inteligentes de compra.
          </CardDescription>
          <Badge>Popular</Badge>
        </Card>

        <Card>
          <CardTitle>Favoritos</CardTitle>
          <CardDescription>
            Guarda tus productos favoritos y recibe alertas cuando bajen de precio.
          </CardDescription>
          <Badge>Actualizado</Badge>
        </Card>

        <Card>
          <CardTitle>Comparador</CardTitle>
          <CardDescription>
            Compara productos lado a lado y encuentra la mejor opción para ti.
          </CardDescription>
          <Badge>Beta</Badge>
        </Card>

        <Card>
          <CardTitle>Alertas</CardTitle>
          <CardDescription>
            Configura alertas de precio y te notificaremos cuando lleguen a tu objetivo.
          </CardDescription>
          <Badge>Gratis</Badge>
        </Card>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
