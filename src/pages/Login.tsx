/**
 * Login - Página de inicio de sesión
 * Permitirá a los usuarios autenticarse en Prexiopá
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../supabaseClient';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary[500]} 0%,
    ${({ theme }) => theme.colors.secondary[500]} 100%
  );
`;

const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[10]};
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
  width: 100%;
  max-width: 440px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary[500]},
    ${({ theme }) => theme.colors.secondary[500]}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
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

const Input = styled.input`
  height: ${({ theme }) => theme.components.input.height.medium};
  padding: ${({ theme }) => theme.components.input.padding};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  font-size: ${({ theme }) => theme.components.input.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}1A;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }
`;

const Button = styled.button`
  height: ${({ theme }) => theme.components.button.size.large.height};
  padding: ${({ theme }) => theme.components.button.size.large.padding};
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.large.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${({ theme }) => theme.spacing[2]};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.primary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin: ${({ theme }) => theme.spacing[6]} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border.main};
  }
`;

const DividerText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const GoogleButton = styled.button`
  width: 100%;
  height: ${({ theme }) => theme.components.button.size.large.height};
  padding: ${({ theme }) => theme.components.button.size.large.padding};
  background: white;
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.large.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};

  &:hover {
    background: ${({ theme }) => theme.colors.background.default};
    border-color: ${({ theme }) => theme.colors.text.secondary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const FooterText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary[500]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error al iniciar sesión con Google:', error.message);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoText>Prexiopá</LogoText>
          <Subtitle>Compara precios, ahorra dinero</Subtitle>
        </Logo>

        <GoogleButton type="button" onClick={handleGoogleLogin}>
          <FcGoogle size={24} />
          Continuar con Google
        </GoogleButton>

        <Divider>
          <DividerText>o</DividerText>
        </Divider>

        <Form>
          <InputGroup>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </InputGroup>

          <Button type="submit">
            Iniciar Sesión
          </Button>
        </Form>

        <FooterText>
          ¿No tienes cuenta? <StyledLink to="/register">Regístrate aquí</StyledLink>
        </FooterText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
