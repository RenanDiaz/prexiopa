import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deletePurchase, getPurchase } from '../api';
import styles from '../App.module.css';
import { formatCents, formatDateTime, formatQuantity, formatRate } from '../format';
import { Link, navigate } from '../router';

// F2 — Detalle (CA2.2, CA2.3): líneas y desglose tal como viene en la factura.
export function PurchaseDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const purchase = useQuery({ queryKey: ['purchase', id], queryFn: () => getPurchase(id) });
  const remove = useMutation({
    mutationFn: () => deletePurchase(id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['purchase', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchases'] });
      navigate('/', { replace: true });
    },
  });

  if (purchase.isPending) return <p className={styles.muted}>Cargando…</p>;
  if (purchase.isError) {
    return (
      <>
        <p className={styles.error}>No se pudo cargar la compra: {purchase.error.message}</p>
        <Link href="/" className={styles.back}>
          Volver
        </Link>
      </>
    );
  }

  const p = purchase.data;
  const confirmDelete = () => {
    if (window.confirm(`¿Eliminar la compra de ${p.storeName} por ${formatCents(p.totalCents)}?`)) remove.mutate();
  };

  return (
    <>
      <Link href="/" className={styles.back}>
        ← Compras
      </Link>
      <h2 className={styles.subtitle}>{p.storeName}</h2>
      <p className={styles.muted}>
        {formatDateTime(p.issuedAt)}
        {p.source === 'manual' && ' · Manual'}
      </p>

      <ul className={styles.lines}>
        {p.lines.map((line) => (
          <li key={line.id} className={styles.line}>
            <span>
              {line.description}
              {line.discountCents > 0 && (
                <span className={styles.discount}> −{formatCents(line.discountCents)}</span>
              )}
            </span>
            <span className={styles.muted}>× {formatQuantity(line.quantity)}</span>
            <span className={styles.amount}>{formatCents(line.lineTotalCents)}</span>
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        <dt>Subtotal</dt>
        <dd>{formatCents(p.subtotalCents)}</dd>
        {p.taxBreakdown
          .filter((rate) => rate.rateBp > 0)
          .map((rate) => (
            <Row key={rate.rateBp} label={`ITBMS ${formatRate(rate.rateBp)} (${rate.lineCount})`} cents={rate.taxCents} />
          ))}
        <dt>ITBMS total</dt>
        <dd>{formatCents(p.taxCents)}</dd>
        <dt className={styles.strong}>Total</dt>
        <dd className={styles.strong}>{formatCents(p.totalCents)}</dd>
        {p.paidCents !== null && p.paidCents !== p.totalCents && <Row label="Pagado" cents={p.paidCents} />}
      </dl>
      {/* El subtotal y el total ya vienen con los descuentos aplicados. */}
      {p.discountCents > 0 && <p className={styles.discount}>Ahorraste {formatCents(p.discountCents)} en descuentos.</p>}

      {p.cufe && (
        <p className={styles.muted}>
          CUFE: <span className={styles.code}>{p.cufe}</span>
          {p.sourceUrl && (
            <>
              {' · '}
              <a href={p.sourceUrl} target="_blank" rel="noreferrer">
                Ver en la DGI
              </a>
            </>
          )}
        </p>
      )}

      <button className={styles.danger} onClick={confirmDelete} disabled={remove.isPending}>
        {remove.isPending ? 'Eliminando…' : 'Eliminar compra'}
      </button>
      {remove.isError && <p className={styles.error}>{remove.error.message}</p>}
    </>
  );
}

function Row({ label, cents }: { label: string; cents: number }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{formatCents(cents)}</dd>
    </>
  );
}
