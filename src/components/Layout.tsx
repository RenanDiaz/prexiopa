/**
 * Layout - Componente de layout principal
 * Envuelve todas las páginas con Navbar y estructura común
 */

import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.default};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

/**
 * Layout principal de la aplicación
 * Incluye la navegación y el área de contenido
 */
const Layout = () => {
  return (
    <LayoutContainer>
      <Navbar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
