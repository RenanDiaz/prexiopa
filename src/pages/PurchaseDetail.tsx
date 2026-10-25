import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { deletePurchase, getPurchase, setLineQuantity, setManualPurchaseDate, type PurchaseLine } from '../api';
import styles from '../App.module.css';
import { formatCents, formatDateTime, formatQuantity, formatRate, toPanamaDate, todayInPanama } from '../format';
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
      <div className={styles.titleRow}>
        <h2 className={styles.subtitle}>{p.storeName}</h2>
        <Link href={`/tiendas/${p.storeId}`} className={styles.link}>
          Editar tienda
        </Link>
      </div>
      {p.source === 'manual' ? (
        <ManualDate purchaseId={p.id} issuedAt={p.issuedAt} />
      ) : (
        <p className={styles.muted}>{formatDateTime(p.issuedAt)}</p>
      )}
      {p.storeQuantities === 'always_one' && (
        <p className={styles.notice}>
          Esta tienda reporta cantidad 1 en todo. Para comparar precios, toca la cantidad para confirmarla o usa − / + si
          llevaste más; en lo que va por peso, anota los kg. Es opcional.
        </p>
      )}

      <ul className={styles.lines}>
        {p.lines.map((line) => (
          <li key={line.id} className={styles.line}>
            <span>
              <Link href={`/precios/item/${line.storeItemId}`} className={styles.plain}>
                {line.description}
              </Link>
              {line.discountCents > 0 && (
                <span className={styles.discount}> −{formatCents(line.discountCents)}</span>
              )}
            </span>
            {p.storeQuantities === 'always_one' || line.quantitySource !== 'invoice' ? (
              <QuantityControl purchaseId={p.id} line={line} />
            ) : (
              <span className={styles.muted}>× {formatQuantity(line.quantity)}</span>
            )}
            <span className={styles.amount}>{formatCents(line.lineTotalCents)}</span>
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        {/* Una compra manual no pide ITBMS (spec §3): solo hay total. */}
        {p.source === 'cafe' && (
          <>
            <dt>Subtotal</dt>
            <dd>{formatCents(p.subtotalCents)}</dd>
            {p.taxBreakdown
              .filter((rate) => rate.rateBp > 0)
              .map((rate) => (
                <Row key={rate.rateBp} label={`ITBMS ${formatRate(rate.rateBp)} (${rate.lineCount})`} cents={rate.taxCents} />
              ))}
            <dt>ITBMS total</dt>
            <dd>{formatCents(p.taxCents)}</dd>
          </>
        )}
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

/** CA4.5: la fecha de una compra manual se puede corregir; la de una factura importada no. */
function ManualDate({ purchaseId, issuedAt }: { purchaseId: string; issuedAt: string }) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<string | null>(null);
  const update = useMutation({
    mutationFn: (value: string) => setManualPurchaseDate(purchaseId, value),
    onSuccess: async () => {
      setDate(null);
      // La fecha mueve la compra en el historial, el resumen mensual y los precios.
      await queryClient.invalidateQueries();
    },
  });

  if (date === null) {
    return (
      <p className={styles.muted}>
        {formatDateTime(issuedAt)} · Manual{' · '}
        <button className={styles.link} onClick={() => setDate(toPanamaDate(issuedAt))}>
          Cambiar fecha
        </button>
      </p>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (date) update.mutate(date);
  };
  return (
    <form className={styles.inlineField} onSubmit={submit}>
      <input
        type="date"
        className={styles.input}
        value={date}
        max={todayInPanama()}
        onChange={(event) => setDate(event.target.value)}
        aria-label="Fecha de la compra"
        autoFocus
      />
      <button className={styles.button} type="submit" disabled={!date || update.isPending}>
        Guardar
      </button>
      <button className={styles.link} type="button" onClick={() => setDate(null)} disabled={update.isPending}>
        Cancelar
      </button>
      {update.isError && <span className={styles.error}>{update.error.message}</span>}
    </form>
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

/** CA5.5 y CA5.6: unidades con − / +, peso para pesables; marca las inferidas. */
function QuantityControl({ purchaseId, line }: { purchaseId: string; line: PurchaseLine }) {
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState<string | null>(null);
  const update = useMutation({
    mutationFn: (quantity: number) => setLineQuantity(line.id, quantity),
    onSuccess: async () => {
      setWeight(null);
      await queryClient.invalidateQueries({ queryKey: ['purchase', purchaseId] });
      await queryClient.invalidateQueries({ queryKey: ['price-history'] });
    },
  });
  const confirmed = line.quantitySource !== 'invoice';

  if (line.isWeighed) {
    if (weight !== null) {
      const submit = (event: FormEvent) => {
        event.preventDefault();
        const kg = Number(weight.replace(',', '.'));
        if (kg > 0) update.mutate(kg);
      };
      return (
        <form className={styles.weight} onSubmit={submit}>
          <input
            className={styles.input}
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            inputMode="decimal"
            aria-label={`Peso en kg de ${line.description}`}
            placeholder="kg"
            autoFocus
          />
          <button className={styles.button} type="submit" disabled={update.isPending}>
            OK
          </button>
        </form>
      );
    }
    return (
      <button className={styles.link} onClick={() => setWeight(confirmed ? String(line.quantity) : '')}>
        {confirmed ? `${formatQuantity(line.quantity)} kg` : 'Peso'}
      </button>
    );
  }

  return (
    <span className={styles.stepper}>
      <button
        className={styles.stepButton}
        aria-label={`Una unidad menos de ${line.description}`}
        disabled={update.isPending || line.quantity <= 1}
        onClick={() => update.mutate(line.quantity - 1)}
      >
        −
      </button>
      <button
        className={confirmed ? styles.stepValue : `${styles.stepValue} ${styles.unconfirmed}`}
        title={confirmed ? undefined : 'Confirmar que fue esta cantidad'}
        aria-label={confirmed ? undefined : `Confirmar ${formatQuantity(line.quantity)} de ${line.description}`}
        disabled={update.isPending || line.quantitySource === 'user'}
        onClick={() => update.mutate(line.quantity)}
      >
        {formatQuantity(line.quantity)}
        {line.quantitySource === 'inferred' && <small className={styles.muted}> inf.</small>}
      </button>
      <button
        className={styles.stepButton}
        aria-label={`Una unidad más de ${line.description}`}
        disabled={update.isPending}
        onClick={() => update.mutate(line.quantity + 1)}
      >
        +
      </button>
    </span>
  );
}
