import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'
import App from './App.tsx'
import { useAuthStore } from './store/authStore'

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

// Verificar sesión al iniciar la aplicación
useAuthStore.getState().checkAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles theme={theme} />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
