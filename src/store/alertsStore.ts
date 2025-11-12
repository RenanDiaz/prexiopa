import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../supabaseClient';

// Tipo para alertas de precio
export interface PriceAlert {
  id: string;
  productId: string;
  productName?: string;
  targetPrice: number;
  currentPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  triggeredAt?: string;
  notificationSent?: boolean;
  storeId?: string; // Opcional: alerta para tienda específica
}

// Estado del store
interface AlertsState {
  alerts: PriceAlert[];
  isLoading: boolean;
  error: string | null;
}

interface AlertsActions {
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => Promise<string>;
  removeAlert: (alertId: string) => Promise<void>;
  updateAlert: (alertId: string, updates: Partial<PriceAlert>) => Promise<void>;
  toggleAlert: (alertId: string) => Promise<void>;
  getAlertsByProduct: (productId: string) => PriceAlert[];
  clearAlerts: () => void;
  loadAlerts: () => Promise<void>;
  checkAlerts: (productId: string, currentPrice: number) => PriceAlert[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncWithSupabase: () => Promise<void>;
}

type AlertsStore = AlertsState & AlertsActions;

/**
 * Store de alertas de precio con Zustand + Immer
 * Permite crear alertas cuando un producto alcanza cierto precio
 * Se sincroniza con Supabase cuando hay usuario autenticado
 */
export const useAlertsStore = create<AlertsStore>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      alerts: [],
      isLoading: false,
      error: null,

      /**
       * Establecer estado de carga
       */
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      /**
       * Establecer error
       */
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },

      /**
       * Agregar nueva alerta de precio
       */
      addAlert: async (alertData) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          // Generar ID único
          const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const newAlert: PriceAlert = {
            ...alertData,
            id: alertId,
            createdAt: new Date().toISOString(),
            isActive: true,
          };

          // Agregar a estado local
          set((state) => {
            state.alerts.push(newAlert);
            state.isLoading = false;
          });

          // Sincronizar con Supabase
          const { syncWithSupabase } = get();
          await syncWithSupabase();

          return alertId;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al crear alerta';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },

      /**
       * Remover alerta por ID
       */
      removeAlert: async (alertId) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          set((state) => {
            state.alerts = state.alerts.filter((alert) => alert.id !== alertId);
            state.isLoading = false;
          });

          // Sincronizar con Supabase
          const { syncWithSupabase } = get();
          await syncWithSupabase();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al eliminar alerta';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },

      /**
       * Actualizar alerta existente
       */
      updateAlert: async (alertId, updates) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          set((state) => {
            const alertIndex = state.alerts.findIndex((a) => a.id === alertId);
            if (alertIndex !== -1) {
              state.alerts[alertIndex] = {
                ...state.alerts[alertIndex],
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
            state.isLoading = false;
          });

          // Sincronizar con Supabase
          const { syncWithSupabase } = get();
          await syncWithSupabase();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al actualizar alerta';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },

      /**
       * Activar/desactivar alerta
       */
      toggleAlert: async (alertId) => {
        const { alerts, updateAlert } = get();
        const alert = alerts.find((a) => a.id === alertId);

        if (alert) {
          await updateAlert(alertId, { isActive: !alert.isActive });
        }
      },

      /**
       * Obtener alertas de un producto específico
       */
      getAlertsByProduct: (productId) => {
        const { alerts } = get();
        return alerts.filter((alert) => alert.productId === productId);
      },

      /**
       * Limpiar todas las alertas
       */
      clearAlerts: () => {
        set((state) => {
          state.alerts = [];
          state.error = null;
        });
      },

      /**
       * Cargar alertas desde Supabase
       */
      loadAlerts: async () => {
        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          // Verificar si hay usuario autenticado
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set((state) => {
              state.isLoading = false;
            });
            return;
          }

          // Cargar alertas desde Supabase
          // Asumiendo tabla 'price_alerts' con las columnas necesarias
          const { data, error } = await supabase
            .from('price_alerts')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Mapear datos de Supabase a nuestro formato
          const alerts: PriceAlert[] = (data || []).map((item) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            targetPrice: item.target_price,
            currentPrice: item.current_price,
            isActive: item.is_active,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            triggeredAt: item.triggered_at,
            notificationSent: item.notification_sent,
            storeId: item.store_id,
          }));

          set((state) => {
            state.alerts = alerts;
            state.isLoading = false;
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar alertas';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
        }
      },

      /**
       * Verificar si alguna alerta se disparó con el precio actual
       */
      checkAlerts: (productId, currentPrice) => {
        const { alerts, updateAlert } = get();

        const triggeredAlerts = alerts.filter((alert) => {
          if (!alert.isActive || alert.productId !== productId) {
            return false;
          }

          return currentPrice <= alert.targetPrice;
        });

        // Marcar alertas disparadas
        triggeredAlerts.forEach((alert) => {
          updateAlert(alert.id, {
            triggeredAt: new Date().toISOString(),
            currentPrice,
            notificationSent: true,
          });
        });

        return triggeredAlerts;
      },

      /**
       * Sincronizar alertas con Supabase
       */
      syncWithSupabase: async () => {
        try {
          // Verificar si hay usuario autenticado
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            return;
          }

          const { alerts } = get();

          // Eliminar todas las alertas actuales del usuario
          await supabase
            .from('price_alerts')
            .delete()
            .eq('user_id', session.user.id);

          // Insertar alertas actuales
          if (alerts.length > 0) {
            const alertsData = alerts.map((alert) => ({
              id: alert.id,
              user_id: session.user.id,
              product_id: alert.productId,
              product_name: alert.productName,
              target_price: alert.targetPrice,
              current_price: alert.currentPrice,
              is_active: alert.isActive,
              created_at: alert.createdAt,
              updated_at: alert.updatedAt,
              triggered_at: alert.triggeredAt,
              notification_sent: alert.notificationSent,
              store_id: alert.storeId,
            }));

            const { error } = await supabase
              .from('price_alerts')
              .insert(alertsData);

            if (error) throw error;
          }
        } catch (error) {
          // Sincronización silenciosa - no lanzar error
          console.error('Error al sincronizar alertas:', error);
        }
      },
    })),
    {
      name: 'prexiopa-alerts-storage',
      partialize: (state) => ({
        // Persistir todas las alertas
        alerts: state.alerts,
      }),
    }
  )
);
