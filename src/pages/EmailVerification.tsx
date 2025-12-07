/**
 * EmailVerification - Página de verificación de email
 * Maneja el proceso de verificación de correo electrónico después del registro
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

const VerificationContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.secondary[500]} 0%,
    ${({ theme }) => theme.colors.primary[500]} 100%
  );
`;

const VerificationCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[10]};
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const IconWrapper = styled.div<{ $status: 'loading' | 'success' | 'error' }>`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  ${({ $status }) => $status === 'loading' && `
    animation: spin 1s linear infinite;
  `}

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Button = styled.button`
  height: ${({ theme }) => theme.components.button.size.large.height};
  padding: ${({ theme }) => theme.components.button.size.large.padding};
  background: ${({ theme }) => theme.colors.secondary[500]};
  color: ${({ theme }) => theme.colors.secondary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.large.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.secondary};
  }

  &:active {
    transform: translateY(0);
  }
`;

type VerificationStatus = 'loading' | 'success' | 'error';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Obtener los tokens de la URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        // Verificar que tengamos los parámetros necesarios
        if (!token_hash || type !== 'email') {
          setStatus('error');
          setErrorMessage('Link de verificación inválido o expirado');
          showErrorNotification('Link de verificación inválido', 'Error');
          return;
        }

        // Verificar el email usando el token hash
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          console.error('Error verificando email:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Error al verificar el correo electrónico');
          showErrorNotification(
            'No se pudo verificar tu correo electrónico. El link puede haber expirado.',
            'Error de verificación'
          );
          return;
        }

        // Verificación exitosa
        setStatus('success');
        showSuccessNotification(
          'Tu correo ha sido verificado exitosamente. Ahora puedes usar todas las funciones de Prexiopá.',
          '¡Email verificado!'
        );

        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error inesperado en verificación:', error);
        setStatus('error');
        setErrorMessage('Ocurrió un error inesperado');
        showErrorNotification('Ocurrió un error inesperado', 'Error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verificando tu correo...';
      case 'success':
        return '¡Email verificado!';
      case 'error':
        return 'Error de verificación';
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'loading':
        return 'Por favor espera mientras verificamos tu correo electrónico.';
      case 'success':
        return 'Tu correo ha sido verificado exitosamente. Serás redirigido al inicio en unos segundos.';
      case 'error':
        return errorMessage || 'No pudimos verificar tu correo. Por favor, intenta solicitar un nuevo link de verificación.';
    }
  };

  const handleAction = () => {
    if (status === 'success') {
      navigate('/');
    } else if (status === 'error') {
      navigate('/login');
    }
  };

  return (
    <VerificationContainer>
      <VerificationCard>
        <IconWrapper $status={status}>{getIcon()}</IconWrapper>
        <Title>{getTitle()}</Title>
        <Message>{getMessage()}</Message>
        {status !== 'loading' && (
          <Button onClick={handleAction}>
            {status === 'success' ? 'Ir al inicio' : 'Volver al login'}
          </Button>
        )}
      </VerificationCard>
    </VerificationContainer>
  );
};

export default EmailVerification;
