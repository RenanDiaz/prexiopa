import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeWrapper } from './components/ThemeWrapper'
import App from './App.tsx'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeWrapper>
        <App />
      </ThemeWrapper>
    </QueryClientProvider>
  </StrictMode>,
)
