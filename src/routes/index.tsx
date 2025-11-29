/**
 * Router Configuration - Sistema de rutas de Prexiopá
 * Configuración de todas las rutas usando React Router v7
 * Incluye lazy loading para optimizar el performance
 */

import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import styled from 'styled-components';

// Layout
import Layout from '../components/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Páginas con lazy loading para mejor performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const StorePage = lazy(() => import('../pages/StorePage'));
const Favorites = lazy(() => import('../pages/Favorites'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const Shopping = lazy(() => import('../pages/Shopping'));
const Stores = lazy(() => import('../pages/Stores'));
const ScannerDemo = lazy(() => import('../pages/ScannerDemo'));
// const ProductsDemo = lazy(() => import('../pages/ProductsDemo'));
const Admin = lazy(() => import('../pages/Admin'));
const AuthCallback = lazy(() => import('../pages/AuthCallback'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading component para las transiciones
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.default};
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${({ theme }) => theme.colors.neutral[200]};
  border-top-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  position: absolute;
  margin-top: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingFallback = () => (
  <LoadingContainer>
    <div style={{ position: 'relative' }}>
      <LoadingSpinner />
      <LoadingText>Cargando...</LoadingText>
    </div>
  </LoadingContainer>
);

/**
 * Wrapper para Suspense que muestra un loading mientras carga la página
 */
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

/**
 * Configuración del router con todas las rutas de la aplicación
 * Utiliza createBrowserRouter de React Router v7
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        // Dashboard - Página principal
        index: true,
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        // Búsqueda de productos
        path: 'search',
        element: (
          <SuspenseWrapper>
            <SearchResults />
          </SuspenseWrapper>
        ),
      },
      {
        // Detalle de producto con parámetro ID
        path: 'product/:id',
        element: (
          <SuspenseWrapper>
            <ProductDetail />
          </SuspenseWrapper>
        ),
      },
      {
        // Página de tienda con parámetro ID
        path: 'store/:id',
        element: (
          <SuspenseWrapper>
            <StorePage />
          </SuspenseWrapper>
        ),
      },
      {
        // Favoritos del usuario - Ruta protegida
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <Favorites />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        // Lista de compras - Ruta protegida
        path: 'shopping',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <Shopping />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        // Tiendas disponibles
        path: 'stores',
        element: (
          <SuspenseWrapper>
            <Stores />
          </SuspenseWrapper>
        ),
      },
      {
        // Perfil de usuario - Ruta protegida
        path: 'profile',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <Profile />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        // Demo del escáner de códigos de barras
        // Ruta de desarrollo para probar el componente BarcodeScanner
        path: 'scanner-demo',
        element: (
          <SuspenseWrapper>
            <ScannerDemo />
          </SuspenseWrapper>
        ),
      },
      {
        // Panel de administración - Ruta protegida para moderadores/admins
        // No usa ProtectedRoute porque Admin.tsx tiene su propia validación de roles
        path: 'admin',
        element: (
          <SuspenseWrapper>
            <Admin />
          </SuspenseWrapper>
        ),
      },
      // {
      //   // Demo de componentes de productos
      //   // Ruta de desarrollo para ver los componentes en acción
      //   path: 'products-demo',
      //   element: (
      //     <SuspenseWrapper>
      //       <ProductsDemo />
      //     </SuspenseWrapper>
      //   ),
      // },
    ],
  },
  {
    // Login - Sin layout (página independiente)
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    // Registro - Sin layout (página independiente)
    path: '/register',
    element: (
      <SuspenseWrapper>
        <Register />
      </SuspenseWrapper>
    ),
  },
  {
    // Callback de OAuth - Sin layout (página de procesamiento)
    path: '/auth/callback',
    element: (
      <SuspenseWrapper>
        <AuthCallback />
      </SuspenseWrapper>
    ),
  },
  {
    // 404 - Not Found
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
]);

export default router;
