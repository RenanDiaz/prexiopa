import { useInfiniteQuery } from '@tanstack/react-query';
import { listPurchases } from '../api';
import styles from '../App.module.css';
import { formatCents, formatDate } from '../format';
import { Link } from '../router';

// F2 — Historial (CA2.1, CA2.4): fecha descendente, paginado con cursor.
export function History() {
  const purchases = useInfiniteQuery({
    queryKey: ['purchases'],
    queryFn: ({ pageParam }) => listPurchases(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const items = purchases.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <Link href="/importar" className={styles.primary}>
        Escanear factura
      </Link>

      <h2 className={styles.subtitle}>Compras</h2>
      {purchases.isPending && <p className={styles.muted}>Cargando…</p>}
      {purchases.isError && <p className={styles.error}>No se pudieron cargar las compras: {purchases.error.message}</p>}
      {purchases.isSuccess && items.length === 0 && (
        <p className={styles.muted}>Aún no tienes compras. Escanea el QR de tu próxima factura.</p>
      )}

      <ul className={styles.list}>
        {items.map((purchase) => (
          <li key={purchase.id}>
            <Link href={`/compras/${purchase.id}`} className={styles.row}>
              <span className={styles.rowMain}>
                <strong>{purchase.storeName}</strong>
                <span className={styles.muted}>
                  {formatDate(purchase.issuedAt)} · {purchase.lineCount}{' '}
                  {purchase.lineCount === 1 ? 'producto' : 'productos'}
                  {purchase.source === 'manual' && ' · Manual'}
                </span>
              </span>
              <span className={styles.amount}>{formatCents(purchase.totalCents)}</span>
            </Link>
          </li>
        ))}
      </ul>

      {purchases.hasNextPage && (
        <button
          className={styles.button}
          onClick={() => purchases.fetchNextPage()}
          disabled={purchases.isFetchingNextPage}
        >
          {purchases.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
    </>
  );
}
