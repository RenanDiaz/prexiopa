/**
 * VerificationBanner - Banner de verificación de email
 * Se muestra en el dashboard cuando el usuario no ha verificado su email
 */

import { useState } from 'react';
import styled from 'styled-components';
import { FiMail, FiX } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

const BannerContainer = styled.div<{ $dismissed: boolean }>`
  background: ${({ theme }) => theme.colors.semantic.warning.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.warning.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  display: ${({ $dismissed }) => ($dismissed ? 'none' : 'flex')};
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const IconWrapper = styled.div`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.semantic.warning.dark};
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.semantic.warning.dark};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const Text = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ResendButton = styled.button<{ disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.neutral[300] : theme.colors.semantic.warning.main};
  color: ${({ theme }) => theme.colors.background.paper};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.semantic.warning.dark};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const DismissButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[1]};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: ${({ theme }) => theme.borderRadius.base};

  &:hover {
    background: ${({ theme }) => theme.colors.semantic.warning.main}33;
    color: ${({ theme }) => theme.colors.semantic.warning.dark};
  }
`;

const Countdown = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface VerificationBannerProps {
  userEmail: string;
}

export const VerificationBanner = ({ userEmail }: VerificationBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResendVerification = async () => {
    if (isResending || countdown > 0) return;

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;

      showSuccessNotification(
        'Hemos enviado un nuevo correo de verificación a tu email',
        '¡Correo enviado!'
      );

      // Iniciar countdown de 60 segundos
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Error reenviando verificación:', error);

      let errorMessage = 'No se pudo reenviar el correo de verificación';

      if (error.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Has solicitado demasiados correos. Por favor, espera unos minutos.';
      }

      showErrorNotification(errorMessage, 'Error');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Guardar en sessionStorage para no mostrar hasta refresh
    sessionStorage.setItem('verification-banner-dismissed', 'true');
  };

  // Verificar si ya fue dismissed en esta sesión
  if (sessionStorage.getItem('verification-banner-dismissed') === 'true') {
    return null;
  }

  return (
    <BannerContainer $dismissed={dismissed}>
      <IconWrapper>
        <FiMail />
      </IconWrapper>

      <Content>
        <Title>Verifica tu correo electrónico</Title>
        <Text>
          Te hemos enviado un correo a <strong>{userEmail}</strong>.
          Por favor, verifica tu cuenta para acceder a todas las funciones de Prexiopá.
        </Text>
      </Content>

      <Actions>
        {countdown > 0 ? (
          <Countdown>Reenviar en {countdown}s</Countdown>
        ) : (
          <ResendButton onClick={handleResendVerification} disabled={isResending}>
            {isResending ? 'Enviando...' : 'Reenviar correo'}
          </ResendButton>
        )}
      </Actions>

      <DismissButton onClick={handleDismiss} title="Cerrar banner">
        <FiX size={20} />
      </DismissButton>
    </BannerContainer>
  );
};

export default VerificationBanner;
