import { useQuery } from '@tanstack/react-query';
import { getSummary } from '../api';
import styles from '../App.module.css';
import { formatCents, formatMonth } from '../format';
import { Link } from '../router';

// F6 — Resumen mensual (CA6.1): total de los últimos 12 meses y por tienda del mes actual.
export function Summary() {
  const summary = useQuery({ queryKey: ['summary'], queryFn: getSummary });
  if (summary.isPending) return <p className={styles.muted}>Cargando…</p>;
  if (summary.isError) return <p className={styles.error}>No se pudo cargar el resumen: {summary.error.message}</p>;

  const { months, currentMonth, byStore } = summary.data;
  const max = Math.max(1, ...months.map((month) => month.totalCents));

  return (
    <>
      <Link href="/" className={styles.back}>
        ← Inicio
      </Link>
      <h2 className={styles.subtitle}>Gasto por mes</h2>
      <ul className={styles.bars}>
        {[...months].reverse().map((month) => (
          <li key={month.month} className={styles.bar}>
            <span className={styles.barLabel}>{formatMonth(month.month)}</span>
            <span className={styles.barTrack}>
              <span className={styles.barFill} style={{ width: `${(month.totalCents / max) * 100}%` }} />
            </span>
            <span className={styles.amount}>{formatCents(month.totalCents)}</span>
          </li>
        ))}
      </ul>

      <h2 className={styles.subtitle}>{formatMonth(currentMonth)} por tienda</h2>
      {byStore.length === 0 ? (
        <p className={styles.muted}>Sin compras este mes.</p>
      ) : (
        <ul className={styles.list}>
          {byStore.map((store) => (
            <li key={store.storeId} className={styles.row}>
              <span className={styles.rowMain}>
                <span>{store.storeName}</span>
                <span className={styles.muted}>
                  {store.count} {store.count === 1 ? 'compra' : 'compras'}
                </span>
              </span>
              <span className={styles.amount}>{formatCents(store.totalCents)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
