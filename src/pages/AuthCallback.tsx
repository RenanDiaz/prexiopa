/**
 * AuthCallback Page
 *
 * Página de callback para manejar la redirección después de la autenticación con OAuth.
 * Procesa la sesión de Supabase y redirige al dashboard o muestra un error.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.background.default};
`;

const CallbackContent = styled.div`
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

/**
 * AuthCallback Component
 *
 * Procesa el callback de OAuth y redirige al usuario
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase usa hash fragments (#access_token=...) en el implicit flow
        // Necesitamos obtener la sesión después de que Supabase procese el hash
        const { user, error } = await authService.handleOAuthCallback();

        if (error || !user) {
          console.error('[AuthCallback] Error en callback:', error);
          setError(error?.message || 'Error al procesar la autenticación');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        console.log('[AuthCallback] Usuario autenticado:', user);

        // Guardar usuario en el store (type assertion porque los tipos de Supabase son diferentes)
        setUser(user as any);

        // Obtener la ruta a la que el usuario intentaba acceder antes del login
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');

        // Limpiar el hash de la URL y redirigir
        window.history.replaceState({}, document.title, redirectPath);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Error inesperado:', err);
        setError('Error inesperado al procesar la autenticación');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    // Pequeño delay para asegurar que Supabase procese el hash
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate, setUser]);

  if (error) {
    return (
      <CallbackContainer>
        <CallbackContent>
          <ErrorMessage
            variant="error"
            title="Error de autenticación"
            message={error}
            onRetry={() => navigate('/login')}
          />
        </CallbackContent>
      </CallbackContainer>
    );
  }

  return (
    <CallbackContainer>
      <CallbackContent>
        <LoadingState
          message="Procesando autenticación..."
          size="lg"
        />
      </CallbackContent>
    </CallbackContainer>
  );
};

export default AuthCallback;
