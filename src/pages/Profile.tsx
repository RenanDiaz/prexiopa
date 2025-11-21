/**
 * Profile - Página de perfil de usuario
 * Muestra y permite editar información del usuario
 * TODO: Agregar autenticación - Esta ruta debe ser protegida
 */

import styled from 'styled-components';

const ProfileContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 300px 1fr;
  }
`;

const Sidebar = styled.aside`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.card};
  height: fit-content;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary[500]},
    ${({ theme }) => theme.colors.secondary[500]}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: white;
  margin: 0 auto ${({ theme }) => theme.spacing[4]};
`;

const UserName = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const UserEmail = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding-top: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary[500]};
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

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const InfoGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Button = styled.button`
  height: ${({ theme }) => theme.components.button.size.medium.height};
  padding: ${({ theme }) => theme.components.button.size.medium.padding};
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.medium.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${({ theme }) => theme.spacing[4]};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.primary};
  }
`;

const Profile = () => {
  return (
    <ProfileContainer>
      <ContentWrapper>
        <Header>
          <Title>Mi Perfil</Title>
          <Subtitle>Gestiona tu información y preferencias</Subtitle>
        </Header>

        <Grid>
          <Sidebar>
            <Avatar>JP</Avatar>
            <UserName>Juan Pérez</UserName>
            <UserEmail>juan.perez@email.com</UserEmail>

            <StatsList>
              <StatItem>
                <StatLabel>Favoritos</StatLabel>
                <StatValue>12</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Alertas activas</StatLabel>
                <StatValue>5</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Ahorro estimado</StatLabel>
                <StatValue>$245</StatValue>
              </StatItem>
            </StatsList>
          </Sidebar>

          <MainContent>
            <Section>
              <SectionTitle>Información Personal</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Nombre completo</InfoLabel>
                  <InfoValue>Juan Pérez</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Correo electrónico</InfoLabel>
                  <InfoValue>juan.perez@email.com</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Teléfono</InfoLabel>
                  <InfoValue>+507 6000-0000</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Ubicación</InfoLabel>
                  <InfoValue>Ciudad de Panamá, Panamá</InfoValue>
                </InfoItem>
              </InfoGrid>
              <Button>Editar Información</Button>
            </Section>

            <Section>
              <SectionTitle>Preferencias</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Tiendas preferidas</InfoLabel>
                  <InfoValue>Super 99, El Rey, Riba Smith</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Notificaciones</InfoLabel>
                  <InfoValue>Email y Push activadas</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Categorías favoritas</InfoLabel>
                  <InfoValue>Alimentos, Tecnología, Hogar</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Idioma</InfoLabel>
                  <InfoValue>Español</InfoValue>
                </InfoItem>
              </InfoGrid>
              <Button>Actualizar Preferencias</Button>
            </Section>
          </MainContent>
        </Grid>
      </ContentWrapper>
    </ProfileContainer>
  );
};

export default Profile;
