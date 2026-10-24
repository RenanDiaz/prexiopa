import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, signInWithGoogle, signOut, type Me } from './api';
import styles from './App.module.css';
import { History } from './pages/History';
import { ImportInvoice } from './pages/ImportInvoice';
import { PurchaseDetail } from './pages/PurchaseDetail';
import { Link, matchPath, usePath } from './router';

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
    onSuccess: () => queryClient.resetQueries(),
  });

  const authStatus = me.error instanceof ApiError ? me.error.status : undefined;
  const needsLogin = authStatus === 401 || authStatus === 403;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Link href="/">Prexiopá</Link>
        </h1>
        {me.data && (
          <button className={styles.link} onClick={() => logout.mutate()} disabled={logout.isPending}>
            Salir
          </button>
        )}
      </header>

      {me.isPending && <p className={styles.muted}>Cargando…</p>}

      {needsLogin && (
        <>
          {(loginError || authStatus === 403) && (
            <p className={styles.error}>Esta cuenta de Google no tiene acceso a Prexiopá.</p>
          )}
          <button className={styles.primary} onClick={() => signIn.mutate()} disabled={signIn.isPending}>
            Entrar con Google
          </button>
          {signIn.isError && <p className={styles.error}>No se pudo iniciar sesión: {signIn.error.message}</p>}
        </>
      )}

      {me.isError && !needsLogin && <p className={styles.error}>No se pudo cargar tu sesión: {me.error.message}</p>}

      {me.data && <Routes />}
    </main>
  );
}

function Routes() {
  const path = usePath();
  if (path === '/importar') return <ImportInvoice />;
  const detail = matchPath('/compras/:id', path);
  if (detail?.id) return <PurchaseDetail key={detail.id} id={detail.id} />;
  return <History />;
}
