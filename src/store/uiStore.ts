import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Tipos para notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number; // En milisegundos, 0 = no auto-cerrar
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tipo para tema
export type Theme = 'light' | 'dark';

// Estado del store
interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: Notification[];
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  searchBarFocused: boolean;
}

interface UIActions {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  setSearchBarFocused: (focused: boolean) => void;
}

type UIStore = UIState & UIActions;

const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 segundos

/**
 * Store de UI con Zustand + Immer
 * Maneja el estado global de la interfaz de usuario:
 * - Tema (light/dark)
 * - Estado del sidebar
 * - Notificaciones toast
 * - Modales
 * - Estados de UI varios
 */
export const useUIStore = create<UIStore>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      theme: 'light',
      sidebarOpen: false,
      mobileMenuOpen: false,
      notifications: [],
      isModalOpen: false,
      modalContent: null,
      searchBarFocused: false,

      /**
       * Alternar entre tema claro y oscuro
       */
      toggleTheme: () => {
        set((state) => {
          state.theme = state.theme === 'light' ? 'dark' : 'light';
        });

        // Aplicar clase al body para CSS global
        const { theme } = get();
        document.documentElement.setAttribute('data-theme', theme);
      },

      /**
       * Establecer tema específico
       */
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });

        // Aplicar clase al body
        document.documentElement.setAttribute('data-theme', theme);
      },

      /**
       * Alternar sidebar abierto/cerrado
       */
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      /**
       * Establecer estado del sidebar
       */
      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },

      /**
       * Alternar mobile menu abierto/cerrado
       */
      toggleMobileMenu: () => {
        set((state) => {
          state.mobileMenuOpen = !state.mobileMenuOpen;
        });
      },

      /**
       * Establecer estado del mobile menu
       */
      setMobileMenuOpen: (open) => {
        set((state) => {
          state.mobileMenuOpen = open;
        });

        // Deshabilitar scroll del body cuando el menú está abierto
        if (open) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      },

      /**
       * Agregar notificación
       * Retorna el ID de la notificación para poder removerla manualmente
       */
      addNotification: (notification) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration ?? DEFAULT_NOTIFICATION_DURATION,
        };

        set((state) => {
          state.notifications.push(newNotification);
        });

        // Auto-remover después del duration si es > 0
        const duration = newNotification.duration ?? DEFAULT_NOTIFICATION_DURATION;
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }

        return id;
      },

      /**
       * Remover notificación por ID
       */
      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        });
      },

      /**
       * Limpiar todas las notificaciones
       */
      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },

      /**
       * Abrir modal con contenido
       */
      openModal: (content) => {
        set((state) => {
          state.isModalOpen = true;
          state.modalContent = content;
        });
      },

      /**
       * Cerrar modal
       */
      closeModal: () => {
        set((state) => {
          state.isModalOpen = false;
          state.modalContent = null;
        });
      },

      /**
       * Establecer estado de enfoque del search bar
       */
      setSearchBarFocused: (focused) => {
        set((state) => {
          state.searchBarFocused = focused;
        });
      },
    })),
    {
      name: 'prexiopa-ui-storage',
      partialize: (state) => ({
        // Solo persistir tema y preferencia de sidebar
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Inicializar tema al cargar
const initialTheme = useUIStore.getState().theme;
document.documentElement.setAttribute('data-theme', initialTheme);

/**
 * Helper functions para notificaciones comunes
 */
export const showSuccessNotification = (message: string, title?: string) => {
  return useUIStore.getState().addNotification({
    type: 'success',
    message,
    title,
  });
};

export const showErrorNotification = (message: string, title?: string) => {
  return useUIStore.getState().addNotification({
    type: 'error',
    message,
    title,
    duration: 7000, // Los errores duran más
  });
};

export const showWarningNotification = (message: string, title?: string) => {
  return useUIStore.getState().addNotification({
    type: 'warning',
    message,
    title,
  });
};

export const showInfoNotification = (message: string, title?: string) => {
  return useUIStore.getState().addNotification({
    type: 'info',
    message,
    title,
  });
};
