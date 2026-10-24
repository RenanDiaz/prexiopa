import { useQuery } from '@tanstack/react-query';
import { api, type Me } from './api';
import styles from './App.module.css';

export function App() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/me') });

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Prexiopá</h1>
      {me.isPending && <p className={styles.muted}>Cargando…</p>}
      {me.isError && <p className={styles.error}>No se pudo cargar tu sesión: {me.error.message}</p>}
      {me.data && <p>Hola, {me.data.email}</p>}
    </main>
  );
}
