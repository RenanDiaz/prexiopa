/**
 * ResetPassword - Página para resetear contraseña
 * Permite al usuario establecer una nueva contraseña después de hacer clic en el email
 */

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiLock } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

const ResetPasswordContainer = styled.div`
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

const ResetPasswordCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[10]};
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
  width: 100%;
  max-width: 440px;
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

const PasswordRequirements = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${({ theme }) => theme.spacing[2]} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Requirement = styled.li<{ $met: boolean }>`
  padding: ${({ theme }) => theme.spacing[1]} 0;
  color: ${({ theme, $met }) =>
    $met ? theme.colors.semantic.success.main : theme.colors.text.secondary};

  &::before {
    content: ${({ $met }) => ($met ? '"✓ "' : '"○ "')};
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
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

const ErrorCard = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.semantic.error.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.error.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.semantic.error.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // Password requirements state
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
  });

  // Verificar que tengamos el token en la URL
  useEffect(() => {
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error || error_description) {
      setIsValidToken(false);
      showErrorNotification(
        error_description || 'El enlace de reseteo es inválido o ha expirado',
        'Error'
      );
    }
  }, [searchParams]);

  // Actualizar requisitos de contraseña en tiempo real
  useEffect(() => {
    setRequirements({
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);

  // Validación de contraseña
  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula';
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Limpiar errores anteriores
    setErrors({});

    // Validaciones
    const newErrors: {
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      showSuccessNotification(
        'Tu contraseña ha sido actualizada exitosamente',
        '¡Contraseña actualizada!'
      );

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error al resetear contraseña:', error);

      const errorMessage = error.message || 'Error al actualizar la contraseña';
      setErrors({ password: errorMessage });
      showErrorNotification(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <Logo>
            <LogoText>Prexiopá</LogoText>
          </Logo>

          <Title>Enlace inválido</Title>

          <ErrorCard>
            El enlace de reseteo de contraseña es inválido o ha expirado. Por favor, solicita un
            nuevo enlace.
          </ErrorCard>

          <Button onClick={() => navigate('/forgot-password')}>
            Solicitar nuevo enlace
          </Button>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  return (
    <ResetPasswordContainer>
      <ResetPasswordCard>
        <Logo>
          <LogoText>Prexiopá</LogoText>
        </Logo>

        <Title>Resetear contraseña</Title>
        <Subtitle>Ingresa tu nueva contraseña para tu cuenta</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              $hasError={!!errors.password}
              disabled={isLoading}
              required
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

            <PasswordRequirements>
              <Requirement $met={requirements.minLength}>
                Mínimo 6 caracteres
              </Requirement>
              <Requirement $met={requirements.hasUpperCase}>
                Al menos una letra mayúscula
              </Requirement>
              <Requirement $met={requirements.hasNumber}>
                Al menos un número
              </Requirement>
            </PasswordRequirements>
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              $hasError={!!errors.confirmPassword}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            <FiLock size={20} />
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </Form>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;
