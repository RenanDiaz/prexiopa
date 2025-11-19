/**
 * GoogleButton Component
 *
 * Botón estilizado para iniciar sesión con Google OAuth.
 * Maneja la autenticación con Supabase y muestra estados de carga y error.
 */

import { useState } from 'react';
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

const StyledGoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.neutral[50]};
    border-color: ${({ theme }) => theme.colors.neutral[400]};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const ButtonText = styled.span`
  flex: 1;
  text-align: center;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${({ theme }) => theme.colors.neutral[300]};
  border-top-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export interface GoogleButtonProps {
  /**
   * Texto del botón
   * @default 'Continuar con Google'
   */
  text?: string;

  /**
   * Callback cuando se inicia el proceso de autenticación
   */
  onStart?: () => void;

  /**
   * Callback cuando la autenticación es exitosa
   */
  onSuccess?: () => void;

  /**
   * Callback cuando hay un error
   */
  onError?: (error: Error) => void;
}

/**
 * GoogleButton Component
 *
 * Botón para iniciar sesión con Google OAuth
 */
export const GoogleButton: React.FC<GoogleButtonProps> = ({
  text = 'Continuar con Google',
  onStart,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      onStart?.();

      const { error, url } = await authService.loginWithGoogle();

      if (error) {
        console.error('[GoogleButton] Error al iniciar sesión con Google:', error);
        toast.error('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
        onError?.(error);
        setIsLoading(false);
        return;
      }

      if (url) {
        // Redirigir a Google para autenticación
        window.location.href = url;
        onSuccess?.();
      } else {
        throw new Error('No se pudo obtener la URL de autenticación');
      }
    } catch (error) {
      console.error('[GoogleButton] Error inesperado:', error);
      toast.error('Error inesperado. Por favor, intenta de nuevo.');
      onError?.(error as Error);
      setIsLoading(false);
    }
  };

  return (
    <StyledGoogleButton
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      aria-label="Iniciar sesión con Google"
    >
      {isLoading ? (
        <>
          <Spinner />
          <ButtonText>Conectando...</ButtonText>
        </>
      ) : (
        <>
          <FcGoogle />
          <ButtonText>{text}</ButtonText>
        </>
      )}
    </StyledGoogleButton>
  );
};

export default GoogleButton;
