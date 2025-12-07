/**
 * Router Configuration - Sistema de rutas de Prexiopá
 * Configuración de todas las rutas usando React Router v7
 * Incluye lazy loading para optimizar el performance
 */

import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// Layout
import Layout from '../components/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { SuspenseWrapper } from '../components/common/LoadingFallback';

// Páginas con lazy loading para mejor performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const StorePage = lazy(() => import('../pages/StorePage'));
const Favorites = lazy(() => import('../pages/Favorites'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const Shopping = lazy(() => import('../pages/Shopping'));
const Stores = lazy(() => import('../pages/Stores'));
const ScannerDemo = lazy(() => import('../pages/ScannerDemo'));
// const ProductsDemo = lazy(() => import('../pages/ProductsDemo'));
const Admin = lazy(() => import('../pages/Admin'));
const BarcodeTest = lazy(() => import('../pages/BarcodeTest'));
const AuthCallback = lazy(() => import('../pages/AuthCallback'));
const EmailVerification = lazy(() => import('../pages/EmailVerification'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const TopContributors = lazy(() => import('../pages/TopContributors'));
const NotFound = lazy(() => import('../pages/NotFound'));

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
        // Top contributors leaderboard
        path: 'contributors',
        element: (
          <SuspenseWrapper>
            <TopContributors />
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
        // Configuración de usuario - Ruta protegida
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
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
        // Usa path="admin/*" para soportar subrutas
        path: 'admin/*',
        element: (
          <SuspenseWrapper>
            <Admin />
          </SuspenseWrapper>
        ),
      },
      {
        // Validador de códigos de barras - Herramienta de testing
        path: 'barcode-test',
        element: (
          <SuspenseWrapper>
            <BarcodeTest />
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
    // Verificación de email - Sin layout (página de procesamiento)
    path: '/auth/verify-email',
    element: (
      <SuspenseWrapper>
        <EmailVerification />
      </SuspenseWrapper>
    ),
  },
  {
    // Solicitar reseteo de contraseña - Sin layout
    path: '/forgot-password',
    element: (
      <SuspenseWrapper>
        <ForgotPassword />
      </SuspenseWrapper>
    ),
  },
  {
    // Resetear contraseña - Sin layout (página de procesamiento)
    path: '/auth/reset-password',
    element: (
      <SuspenseWrapper>
        <ResetPassword />
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
