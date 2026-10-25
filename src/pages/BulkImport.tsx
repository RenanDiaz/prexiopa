import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError, saveCafe } from '../api';
import styles from '../App.module.css';
import { Link } from '../router';

// Fase 4 — Importar varios: migra los CUFEs de la v0 con el pipeline nuevo.
// De a uno para no saturar a la DGI; las ya importadas no se duplican (CA1.5).

type Status = 'pending' | 'running' | 'saved' | 'duplicate' | 'error';
type Row = { input: string; status: Status; message?: string; purchaseId?: string };

const LABELS: Record<Status, string> = {
  pending: 'En cola',
  running: 'Consultando la DGI…',
  saved: 'Guardada',
  duplicate: 'Ya importada',
  error: 'Error',
};

export function BulkImport() {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  const update = (index: number, row: Partial<Row>) =>
    setRows((current) => current.map((item, i) => (i === index ? { ...item, ...row } : item)));

  async function importOne(row: Row, index: number) {
    update(index, { status: 'running', message: undefined });
    try {
      const { id, created } = await saveCafe(row.input);
      update(index, { status: created ? 'saved' : 'duplicate', purchaseId: id });
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : String(error);
      update(index, { status: 'error', message });
    }
  }

  async function run(queue: { row: Row; index: number }[]) {
    setRunning(true);
    for (const { row, index } of queue) await importOne(row, index);
    setRunning(false);
    await queryClient.invalidateQueries();
  }

  const start = () => {
    const inputs = [...new Set(text.split(/\s*\n\s*/).map((line) => line.trim()).filter(Boolean))];
    const fresh: Row[] = inputs.map((input) => ({ input, status: 'pending' }));
    setRows(fresh);
    void run(fresh.map((row, index) => ({ row, index })));
  };

  const counts = rows.reduce<Record<Status, number>>(
    (acc, row) => ({ ...acc, [row.status]: acc[row.status] + 1 }),
    { pending: 0, running: 0, saved: 0, duplicate: 0, error: 0 },
  );

  return (
    <>
      <Link href="/importar" className={styles.back}>
        ← Escanear factura
      </Link>
      <h2 className={styles.subtitle}>Importar varias facturas</h2>
      <p className={styles.muted}>Pega un CUFE o una URL del QR por línea.</p>
      <textarea
        className={`${styles.input} ${styles.textarea}`}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        spellCheck={false}
        aria-label="CUFEs, uno por línea"
        placeholder={'FE0120000000541-81-118009-…\nFE01200001513069-1-650069-…'}
        disabled={running}
      />
      <div className={styles.actions}>
        <button className={styles.primary} onClick={start} disabled={running || !text.trim()}>
          {running ? 'Importando…' : 'Importar'}
        </button>
      </div>

      {rows.length > 0 && (
        <>
          <p className={styles.muted}>
            {counts.saved} guardadas · {counts.duplicate} ya importadas · {counts.error} con error ·{' '}
            {counts.pending + counts.running} pendientes
          </p>
          <ul className={styles.list}>
            {rows.map((row, index) => (
              <li key={row.input} className={styles.row}>
                <span className={styles.rowMain}>
                  <span className={styles.code}>{row.input}</span>
                  <span className={row.status === 'error' ? styles.error : styles.muted}>
                    {LABELS[row.status]}
                    {row.message && `: ${row.message}`}
                  </span>
                </span>
                {row.purchaseId && <Link href={`/compras/${row.purchaseId}`}>Ver</Link>}
                {row.status === 'error' && !running && (
                  <button className={styles.link} onClick={() => void run([{ row, index }])}>
                    Reintentar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
