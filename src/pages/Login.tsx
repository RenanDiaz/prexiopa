/**
 * Login - Página de inicio de sesión
 * Permitirá a los usuarios autenticarse en Prexiopá
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../supabaseClient';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

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

        <Button
          variant="outline"
          size="lg"
          fullWidth
          iconLeft={<FcGoogle size={24} />}
          onClick={handleGoogleLogin}
        >
          Continuar con Google
        </Button>

        <Divider>
          <DividerText>o</DividerText>
        </Divider>

        <Form>
          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            autoComplete="email"
            required
            fullWidth
          />

          <Input
            id="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            fullWidth
          />

          <Button type="submit" variant="primary" size="lg" fullWidth style={{ marginTop: '8px' }}>
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
