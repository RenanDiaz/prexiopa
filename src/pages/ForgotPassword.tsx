/**
 * ForgotPassword - Página para solicitar reseteo de contraseña
 * Permite al usuario solicitar un email para resetear su contraseña
 */

import { useState, FormEvent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

const ForgotPasswordContainer = styled.div`
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

const ForgotPasswordCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[10]};
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
  width: 100%;
  max-width: 440px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.secondary[500]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary[600]};
    transform: translateX(-2px);
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.secondary[500]},
    ${({ theme }) => theme.colors.primary[500]}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  height: ${({ theme }) => theme.components.input.height.medium};
  padding: ${({ theme }) => theme.components.input.padding};
  border: 2px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  font-size: ${({ theme }) => theme.components.input.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.paper};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.secondary[500]};
    box-shadow: 0 0 0 3px
      ${({ theme, $hasError }) =>
        $hasError ? theme.colors.semantic.error.main : theme.colors.secondary[500]}1A;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.error.main};
  margin-top: -${({ theme }) => theme.spacing[1]};
`;

const Button = styled.button<{ disabled?: boolean }>`
  height: ${({ theme }) => theme.components.button.size.large.height};
  padding: ${({ theme }) => theme.components.button.size.large.padding};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.neutral[300] : theme.colors.secondary[500]};
  color: ${({ theme }) => theme.colors.secondary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.large.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  margin-top: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.secondary};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SuccessMessage = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.semantic.success.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.success.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.semantic.success.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SuccessIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  // Validación de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setError('');

    // Validación
    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      showSuccessNotification(
        'Hemos enviado un correo con las instrucciones para resetear tu contraseña',
        '¡Correo enviado!'
      );

      // Limpiar formulario
      setEmail('');
    } catch (error: any) {
      console.error('Error al solicitar reseteo:', error);

      let errorMessage = 'Error al solicitar el reseteo de contraseña';

      if (error.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Has solicitado demasiados correos. Por favor, espera unos minutos.';
      }

      setError(errorMessage);
      showErrorNotification(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        <BackLink to="/login">
          <FiArrowLeft size={16} />
          Volver al login
        </BackLink>

        <Logo>
          <LogoText>Prexiopá</LogoText>
        </Logo>

        <Title>¿Olvidaste tu contraseña?</Title>
        <Subtitle>
          Ingresa tu correo electrónico y te enviaremos las instrucciones para resetear tu
          contraseña.
        </Subtitle>

        {showSuccess && (
          <SuccessMessage>
            <SuccessIcon>
              <FiMail />
            </SuccessIcon>
            <div>
              <strong>¡Correo enviado!</strong>
              <br />
              Revisa tu bandeja de entrada y haz clic en el enlace para resetear tu contraseña.
              Si no ves el correo, revisa tu carpeta de spam.
            </div>
          </SuccessMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              $hasError={!!error}
              disabled={isLoading}
              required
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>
        </Form>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
