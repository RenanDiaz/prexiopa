import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, signInWithGoogle, signOut, type Me } from './api';
import styles from './App.module.css';

// Better Auth vuelve a "/?error=<código>" si el login falla.
const loginError = new URLSearchParams(window.location.search).get('error');

export function App() {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => api<Me>('/me'),
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
  });
  const signIn = useMutation({ mutationFn: signInWithGoogle });
  const logout = useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.resetQueries({ queryKey: ['me'] }),
  });

  const authStatus = me.error instanceof ApiError ? me.error.status : undefined;
  const needsLogin = authStatus === 401 || authStatus === 403;

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Prexiopá</h1>
      {me.isPending && <p className={styles.muted}>Cargando…</p>}

      {needsLogin && (
        <>
          {(loginError || authStatus === 403) && (
            <p className={styles.error}>Esta cuenta de Google no tiene acceso a Prexiopá.</p>
          )}
          <button className={styles.button} onClick={() => signIn.mutate()} disabled={signIn.isPending}>
            Entrar con Google
          </button>
          {signIn.isError && <p className={styles.error}>No se pudo iniciar sesión: {signIn.error.message}</p>}
        </>
      )}

      {me.isError && !needsLogin && <p className={styles.error}>No se pudo cargar tu sesión: {me.error.message}</p>}

      {me.data && (
        <>
          <p>Hola, {me.data.email}</p>
          <button className={styles.button} onClick={() => logout.mutate()} disabled={logout.isPending}>
            Cerrar sesión
          </button>
        </>
      )}
    </main>
  );
}
