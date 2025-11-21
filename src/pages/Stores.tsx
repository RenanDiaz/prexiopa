/**
 * Stores Page - Lista de todas las tiendas
 * Muestra todas las tiendas disponibles en Panamá
 */

import styled from 'styled-components';
import { StoreList } from '@/components/stores';

const StoresContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
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

const Stores = () => {
  return (
    <StoresContainer>
      <ContentWrapper>
        <Header>
          <Title>Tiendas en Panamá</Title>
          <Subtitle>
            Explora todas las tiendas y supermercados donde comparamos precios
          </Subtitle>
        </Header>

        <StoreList layout="grid" />
      </ContentWrapper>
    </StoresContainer>
  );
};

export default Stores;
