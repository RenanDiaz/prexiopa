/**
 * Settings - Página de configuración de usuario
 * Permite actualizar información personal, cambiar contraseña y gestionar preferencias
 */

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { FiUser, FiLock, FiTrash2, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

const SettingsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[6]};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
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

const Input = styled.input<{ $hasError?: boolean; disabled?: boolean }>`
  height: ${({ theme }) => theme.components.input.height.medium};
  padding: ${({ theme }) => theme.components.input.padding};
  border: 2px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  font-size: ${({ theme }) => theme.components.input.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.neutral[100] : theme.colors.background.paper};
  transition: all 0.2s ease;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px
      ${({ theme, $hasError }) =>
        $hasError ? theme.colors.semantic.error.main : theme.colors.primary[500]}1A;
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

const HelpText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: -${({ theme }) => theme.spacing[1]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger'; disabled?: boolean }>`
  height: ${({ theme }) => theme.components.button.size.medium.height};
  padding: ${({ theme }) => theme.components.button.size.medium.padding};
  background: ${({ theme, $variant, disabled }) => {
    if (disabled) return theme.colors.neutral[300];
    return $variant === 'danger'
      ? theme.colors.semantic.error.main
      : theme.colors.primary[500];
  }};
  color: ${({ theme }) => theme.colors.background.paper};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.medium.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) =>
      $variant === 'danger'
        ? theme.colors.semantic.error.dark
        : theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const DangerZone = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.semantic.error.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[5]};
  background: ${({ theme }) => theme.colors.semantic.error.light}33;
`;

const DangerZoneTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.semantic.error.dark};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const DangerZoneText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 500px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ModalText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  // Personal Info State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string>('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Delete Account Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

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

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();

    // Validación
    if (!fullName.trim()) {
      setProfileError('El nombre es requerido');
      return;
    }

    if (fullName.trim().length < 2) {
      setProfileError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setProfileError('');
    setIsUpdatingProfile(true);

    try {
      await updateProfile({
        full_name: fullName.trim(),
      });

      showSuccessNotification('Tu información personal ha sido actualizada', '¡Perfil actualizado!');
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      const errorMessage = error.message || 'Error al actualizar el perfil';
      setProfileError(errorMessage);
      showErrorNotification(errorMessage, 'Error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    // Limpiar errores
    setPasswordErrors({});

    // Validaciones
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirma tu nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Primero verificar la contraseña actual intentando hacer login
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordErrors({ currentPassword: 'La contraseña actual es incorrecta' });
        showErrorNotification('La contraseña actual es incorrecta', 'Error');
        return;
      }

      // Si la verificación es exitosa, actualizar la contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showSuccessNotification('Tu contraseña ha sido actualizada', '¡Contraseña actualizada!');

      // Limpiar formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      const errorMessage = error.message || 'Error al cambiar la contraseña';
      showErrorNotification(errorMessage, 'Error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      // Nota: Supabase no tiene una función directa para eliminar usuarios desde el cliente
      // En producción, esto debería ser una función RPC que elimine el usuario desde el servidor
      showErrorNotification(
        'La eliminación de cuenta debe ser solicitada al soporte',
        'Función no disponible'
      );

      // TODO: Implementar RPC function en Supabase para eliminar usuario
      // const { error } = await supabase.rpc('delete_user_account');
      // if (error) throw error;

      // showSuccessNotification('Tu cuenta ha sido eliminada', 'Cuenta eliminada');
      // navigate('/');
    } catch (error: any) {
      console.error('Error eliminando cuenta:', error);
      showErrorNotification('Error al eliminar la cuenta', 'Error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <SettingsContainer>
      <Header>
        <Title>Configuración</Title>
        <Subtitle>Administra tu información personal y preferencias de cuenta</Subtitle>
      </Header>

      <SettingsGrid>
        {/* Personal Information Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <FiUser />
            </SectionIcon>
            <SectionTitle>Información Personal</SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleUpdateProfile}>
            <InputGroup>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                $hasError={!!profileError}
                disabled={isUpdatingProfile}
                required
              />
              {profileError && <ErrorMessage>{profileError}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
              />
              <HelpText>
                El correo electrónico no puede ser modificado. Si necesitas cambiarlo, contacta al
                soporte.
              </HelpText>
            </InputGroup>

            <ButtonGroup>
              <Button type="submit" disabled={isUpdatingProfile}>
                <FiSave size={18} />
                {isUpdatingProfile ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </ButtonGroup>
          </Form>
        </Section>

        {/* Change Password Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <FiLock />
            </SectionIcon>
            <SectionTitle>Cambiar Contraseña</SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleChangePassword}>
            <InputGroup>
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                $hasError={!!passwordErrors.currentPassword}
                disabled={isUpdatingPassword}
                required
              />
              {passwordErrors.currentPassword && (
                <ErrorMessage>{passwordErrors.currentPassword}</ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                $hasError={!!passwordErrors.newPassword}
                disabled={isUpdatingPassword}
                required
              />
              {passwordErrors.newPassword && (
                <ErrorMessage>{passwordErrors.newPassword}</ErrorMessage>
              )}
              <HelpText>
                Mínimo 6 caracteres, al menos una mayúscula y un número
              </HelpText>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                $hasError={!!passwordErrors.confirmPassword}
                disabled={isUpdatingPassword}
                required
              />
              {passwordErrors.confirmPassword && (
                <ErrorMessage>{passwordErrors.confirmPassword}</ErrorMessage>
              )}
            </InputGroup>

            <ButtonGroup>
              <Button type="submit" disabled={isUpdatingPassword}>
                <FiLock size={18} />
                {isUpdatingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </ButtonGroup>
          </Form>
        </Section>

        {/* Danger Zone Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <FiAlertCircle />
            </SectionIcon>
            <SectionTitle>Zona de Peligro</SectionTitle>
          </SectionHeader>

          <DangerZone>
            <DangerZoneTitle>
              <FiTrash2 />
              Eliminar cuenta
            </DangerZoneTitle>
            <DangerZoneText>
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de que
              realmente quieres hacer esto. Se eliminarán todos tus datos permanentemente.
            </DangerZoneText>
            <Button
              type="button"
              $variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <FiTrash2 size={18} />
              Eliminar mi cuenta
            </Button>
          </DangerZone>
        </Section>
      </SettingsGrid>

      {/* Delete Account Confirmation Modal */}
      <Modal $isOpen={isDeleteModalOpen} onClick={() => setIsDeleteModalOpen(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>¿Estás seguro?</ModalTitle>
          <ModalText>
            Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos,
            favoritos, listas de compras y alertas de precio.
          </ModalText>
          <ButtonGroup>
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              $variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              <FiTrash2 size={18} />
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
            </Button>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </SettingsContainer>
  );
};

export default Settings;
