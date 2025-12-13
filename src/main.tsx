import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeWrapper } from './components/ThemeWrapper'
import { initSentry, ErrorBoundary } from './lib/sentry'
import { initAnalytics } from './lib/analytics'
import App from './App.tsx'

// Initialize error tracking and analytics
initSentry();
initAnalytics();

// Configurar React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reintentar una vez en caso de error
      refetchOnWindowFocus: false, // No refrescar automáticamente al volver a la ventana
      staleTime: 5 * 60 * 1000, // 5 minutos - considera los datos frescos por este tiempo
      gcTime: 10 * 60 * 1000, // 10 minutos - mantener datos en caché por este tiempo
    },
    mutations: {
      retry: 0, // No reintentar mutaciones automáticamente
    },
  },
});

// Error fallback component for Sentry ErrorBoundary
const ErrorFallback = () => (
  <div style={{
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <h1>Algo salió mal</h1>
    <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '1rem'
      }}
    >
      Recargar página
    </button>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <ThemeWrapper>
          <App />
        </ThemeWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
