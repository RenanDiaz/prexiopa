import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useState, type FormEvent } from 'react';
import { ApiError, previewCafe, saveCafe, type CafeInvoice } from '../api';
import styles from '../App.module.css';
import { formatCents, formatDateTime, formatQuantity } from '../format';
import { Link, navigate } from '../router';

const Scanner = lazy(() => import('../scanner/Scanner'));

// F1 — Importar compra (CA1.1–CA1.7): escanear → preview automático → Guardar.
export function ImportInvoice() {
  const [input, setInput] = useState<string | null>(null);
  const [pasted, setPasted] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const submitPasted = (event: FormEvent) => {
    event.preventDefault();
    if (pasted.trim()) setInput(pasted.trim());
  };

  if (input) return <Preview input={input} onReset={() => setInput(null)} />;

  return (
    <>
      <h2 className={styles.subtitle}>Escanear factura</h2>
      {cameraError ? (
        <p className={styles.error}>{cameraError} Pega el CUFE o la URL del QR abajo.</p>
      ) : (
        <Suspense fallback={<p className={styles.muted}>Abriendo la cámara…</p>}>
          <Scanner mode="qr" onResult={setInput} onError={setCameraError} />
        </Suspense>
      )}

      <form className={styles.form} onSubmit={submitPasted}>
        <label htmlFor="cufe" className={styles.muted}>
          ¿No funciona la cámara? Pega el CUFE o la URL del QR
        </label>
        <input
          id="cufe"
          className={styles.input}
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder="FE01…"
          autoComplete="off"
          spellCheck={false}
        />
        <button className={styles.button} type="submit" disabled={!pasted.trim()}>
          Consultar
        </button>
      </form>
      <Link href="/" className={styles.back}>
        Cancelar
      </Link>
    </>
  );
}

function Preview({ input, onReset }: { input: string; onReset: () => void }) {
  const queryClient = useQueryClient();
  const preview = useQuery({
    queryKey: ['cafe-preview', input],
    queryFn: () => previewCafe(input),
    retry: false,
    staleTime: Infinity,
  });
  const save = useMutation({
    mutationFn: () => saveCafe(input),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: ['purchases'] });
      navigate(`/compras/${id}`, { replace: true });
    },
  });

  if (preview.isPending) {
    return (
      <>
        <p>Consultando la DGI…</p>
        <p className={styles.muted}>Algunas tiendas tardan hasta 15 segundos en responder.</p>
      </>
    );
  }

  if (preview.isError) {
    const { error } = preview;
    const invalid = error instanceof ApiError && error.status === 400;
    return (
      <>
        <p className={styles.error}>{error.message}</p>
        <p className={styles.code}>{input}</p>
        <div className={styles.actions}>
          {!invalid && (
            <button className={styles.primary} onClick={() => preview.refetch()}>
              Reintentar
            </button>
          )}
          <button className={styles.button} onClick={onReset}>
            Escanear otra
          </button>
        </div>
      </>
    );
  }

  const { invoice, existingPurchaseId } = preview.data;
  if (existingPurchaseId) {
    return (
      <>
        <p>Ya importaste esta factura.</p>
        <div className={styles.actions}>
          <Link href={`/compras/${existingPurchaseId}`} className={styles.primary}>
            Ver la compra
          </Link>
          <button className={styles.button} onClick={onReset}>
            Escanear otra
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <InvoiceSummary invoice={invoice} />
      {save.isError && (
        <p className={styles.error}>
          No se pudo guardar: {save.error.message}{' '}
          <span className={styles.code}>{invoice.cufe}</span>
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.primary} onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button className={styles.button} onClick={onReset} disabled={save.isPending}>
          Escanear otra
        </button>
      </div>
      <InvoiceLines invoice={invoice} />
    </>
  );
}

function InvoiceSummary({ invoice }: { invoice: CafeInvoice }) {
  return (
    <dl className={styles.summary}>
      <dt>Tienda</dt>
      <dd>{invoice.issuer.name}</dd>
      <dt>Fecha</dt>
      <dd>{formatDateTime(invoice.issuedAt)}</dd>
      <dt>Total</dt>
      <dd className={styles.amount}>{formatCents(invoice.totals.totalCents)}</dd>
      <dt>Productos</dt>
      <dd>{invoice.lines.length}</dd>
    </dl>
  );
}

function InvoiceLines({ invoice }: { invoice: CafeInvoice }) {
  return (
    <ul className={styles.lines}>
      {invoice.lines.map((line) => (
        <li key={line.lineNo} className={styles.line}>
          <span>{line.description}</span>
          <span className={styles.muted}>× {formatQuantity(line.quantity)}</span>
          <span className={styles.amount}>{formatCents(line.lineTotalCents)}</span>
        </li>
      ))}
    </ul>
  );
}
