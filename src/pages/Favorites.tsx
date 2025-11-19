/**
 * Favorites - Página de productos favoritos del usuario
 * Muestra la lista de productos guardados como favoritos
 * Integra el componente FavoritesList que maneja todo el estado y la UI
 * TODO: Agregar autenticación - Esta ruta debe ser protegida
 */

import styled from 'styled-components';
import { FiHeart } from 'react-icons/fi';

// Components
import { FavoritesList } from '@/components/favorites';

const FavoritesContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.spacing[6]};

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing[8]};
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  text-align: center;

  @media (min-width: 768px) {
    text-align: left;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.functional.favorite.light};
  color: ${({ theme }) => theme.colors.functional.favorite.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  @media (min-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (min-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  max-width: 600px;

  @media (min-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    margin-left: 68px; // Align with title text
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px solid ${({ theme }) => theme.colors.border.light};
  margin: ${({ theme }) => theme.spacing[6]} 0 ${({ theme }) => theme.spacing[8]};
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.info.main};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.info.dark};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0;

  strong {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }
`;

const Favorites = () => {
  return (
    <FavoritesContainer>
      <ContentWrapper>
        <Header>
          <TitleWrapper>
            <IconWrapper>
              <FiHeart size={28} />
            </IconWrapper>
            <Title>Mis Favoritos</Title>
          </TitleWrapper>
          <Subtitle>
            Productos que has guardado para seguir de cerca. Recibe notificaciones cuando bajen de
            precio.
          </Subtitle>
        </Header>

        <Divider />

        <InfoCard>
          <InfoText>
            <strong>Tip:</strong> Agrega productos a favoritos para compararlos fácilmente y recibir
            alertas de precio. Tus favoritos se guardan localmente en tu navegador.
          </InfoText>
        </InfoCard>

        {/* FavoritesList component handles everything: loading, empty, error states, and product grid */}
        <FavoritesList />
      </ContentWrapper>
    </FavoritesContainer>
  );
};

export default Favorites;
