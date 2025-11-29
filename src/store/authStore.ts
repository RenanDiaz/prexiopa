import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

// Tipos para el store de autenticación
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Store de autenticación con Zustand + Supabase
 * Maneja el estado de autenticación del usuario, login, registro y perfil
 * Persistido en localStorage para mantener la sesión
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Establecer usuario
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      // Establecer estado de carga
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Establecer error
      setError: (error) => {
        set({ error });
      },

      // Limpiar error
      clearError: () => {
        set({ error: null });
      },

      /**
       * Login con email y password usando Supabase
       */
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success('¡Bienvenido de vuelta!', {
            position: 'top-right',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });

          toast.error(errorMessage, {
            position: 'top-right',
          });
          throw error;
        }
      },

      /**
       * Registro de nuevo usuario con Supabase
       */
      register: async (email, password, metadata = {}) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          });

          if (error) throw error;

          set({
            user: data.user,
            isAuthenticated: !!data.user,
            isLoading: false,
            error: null,
          });

          toast.success('¡Cuenta creada exitosamente!', {
            position: 'top-right',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });

          toast.error(errorMessage, {
            position: 'top-right',
          });
          throw error;
        }
      },

      /**
       * Logout y limpieza de sesión
       */
      logout: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.info('Sesión cerrada correctamente', {
            position: 'top-right',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
          set({
            error: errorMessage,
            isLoading: false,
          });

          toast.error(errorMessage, {
            position: 'top-right',
          });
          throw error;
        }
      },

      /**
       * Verificar sesión actual y restaurar usuario
       */
      checkAuth: async () => {
        try {
          set({ isLoading: true });

          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          set({
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al verificar sesión';
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });
        }
      },

      /**
       * Actualizar perfil de usuario
       */
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });

          const { data: updatedUser, error } = await supabase.auth.updateUser({
            data,
          });

          if (error) throw error;

          set({
            user: updatedUser.user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'prexiopa-auth-storage', // Nombre único para localStorage
      partialize: (state) => ({
        // Solo persistir estos campos
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Inicializar listener de cambios de autenticación
supabase.auth.onAuthStateChange((_event, session) => {
  const { setUser } = useAuthStore.getState();
  setUser(session?.user ?? null);
});
