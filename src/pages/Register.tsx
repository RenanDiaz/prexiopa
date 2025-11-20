/**
 * Register - Página de registro de nuevos usuarios
 * Permite crear una cuenta en Prexiopá
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const RegisterContainer = styled.div`
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

const RegisterCard = styled.div`
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

const FooterText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondary[500]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Register = () => {
  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <LogoText>Prexiopá</LogoText>
          <Subtitle>Crea tu cuenta y comienza a ahorrar</Subtitle>
        </Logo>

        <Form>
          <Input
            id="name"
            type="text"
            label="Nombre completo"
            placeholder="Juan Pérez"
            autoComplete="name"
            required
            fullWidth
          />

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
            autoComplete="new-password"
            required
            fullWidth
          />

          <Input
            id="confirm-password"
            type="password"
            label="Confirmar contraseña"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            fullWidth
          />

          <Button type="submit" variant="secondary" size="lg" fullWidth style={{ marginTop: '8px' }}>
            Crear Cuenta
          </Button>
        </Form>

        <FooterText>
          ¿Ya tienes cuenta? <StyledLink to="/login">Inicia sesión aquí</StyledLink>
        </FooterText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
