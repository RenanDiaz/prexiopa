/**
 * Profile - Página de perfil de usuario
 * Muestra información real del usuario autenticado
 */

import { useNavigate } from 'react-router-dom';
import { AlertsList } from '../components/alerts';
import { useActiveAlertsCountQuery } from '../hooks/useAlerts';
import { useFavoriteIdsQuery } from '../hooks/useFavorites';
import { useAuthStore } from '../store/authStore';
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

const LogoutButton = styled(Button)`
  background: ${({ theme }) => theme.colors.functional.error.main};
  margin-top: ${({ theme }) => theme.spacing[6]};

  &:hover {
    background: ${({ theme }) => theme.colors.functional.error.dark || '#c62828'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { data: alertsCount = 0 } = useActiveAlertsCountQuery();
  const { data: favoriteIds = [] } = useFavoriteIdsQuery();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <ProfileContainer>
        <LoadingContainer>Cargando...</LoadingContainer>
      </ProfileContainer>
    );
  }

  // Extract user metadata
  const userMetadata = user?.user_metadata || {};
  const displayName = userMetadata.full_name || userMetadata.name || user?.email?.split('@')[0] || 'Usuario';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const email = user?.email || '';
  const phone = userMetadata.phone || 'No especificado';
  const location = userMetadata.location || 'Panamá';
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <ProfileContainer>
      <ContentWrapper>
        <Header>
          <Title>Mi Perfil</Title>
          <Subtitle>Gestiona tu información y preferencias</Subtitle>
        </Header>

        <Grid>
          <Sidebar>
            <Avatar>{initials}</Avatar>
            <UserName>{displayName}</UserName>
            <UserEmail>{email}</UserEmail>

            <StatsList>
              <StatItem>
                <StatLabel>Favoritos</StatLabel>
                <StatValue>{favoriteIds.length}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Alertas activas</StatLabel>
                <StatValue>{alertsCount}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Miembro desde</StatLabel>
                <StatValue style={{ fontSize: '14px' }}>{createdAt}</StatValue>
              </StatItem>
            </StatsList>

            <LogoutButton onClick={handleLogout}>Cerrar Sesión</LogoutButton>
          </Sidebar>

          <MainContent>
            <Section>
              <SectionTitle>Información de la Cuenta</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Nombre</InfoLabel>
                  <InfoValue>{displayName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Correo electrónico</InfoLabel>
                  <InfoValue>{email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Teléfono</InfoLabel>
                  <InfoValue>{phone}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Ubicación</InfoLabel>
                  <InfoValue>{location}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>ID de usuario</InfoLabel>
                  <InfoValue style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {user?.id?.slice(0, 8)}...
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Última conexión</InfoLabel>
                  <InfoValue>
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('es-PA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
            </Section>

            <Section>
              <SectionTitle>Mis Alertas de Precio</SectionTitle>
              <AlertsList />
            </Section>
          </MainContent>
        </Grid>
      </ContentWrapper>
    </ProfileContainer>
  );
};

export default Profile;
