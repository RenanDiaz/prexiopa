/**
 * Layout - Componente de layout principal
 * Envuelve todas las páginas con Navbar, Footer y estructura común
 */

import { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './layout/Footer';
import { trackPageView } from '../lib/analytics';

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
 * Incluye la navegación, contenido y footer
 */
const Layout = () => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <LayoutContainer>
      <Navbar />
      <MainContent>
        <Outlet />
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;
