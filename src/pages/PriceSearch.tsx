import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useState } from 'react';
import { searchCatalog, type SearchResult } from '../api';
import styles from '../App.module.css';
import { formatDate } from '../format';
import { Link, navigate } from '../router';

const Scanner = lazy(() => import('../scanner/Scanner'));

export const priceHref = (result: Pick<SearchResult, 'kind' | 'id'>) =>
  `/precios/${result.kind === 'product' ? 'producto' : 'item'}/${result.id}`;

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// F3 — "¿Cuánto cuesta?": escanear el código de barras o buscar por texto (CA3.3, CA3.4).
export function PriceSearch() {
  const [text, setText] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [code, setCode] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const query = useDebounced(text.trim(), 250);

  // La búsqueda queda en la URL para que "atrás" vuelva a los mismos resultados.
  useEffect(() => {
    window.history.replaceState(null, '', query ? `/precios?q=${encodeURIComponent(query)}` : '/precios');
  }, [query]);

  const params = code ? { code } : { q: query };
  const results = useQuery({
    queryKey: ['catalog-search', params],
    queryFn: () => searchCatalog(params),
    enabled: !!code || query.length >= 2,
  });

  // Un escaneo con un solo resultado va directo al historial (CA3.1).
  useEffect(() => {
    if (code && results.data?.length === 1) navigate(priceHref(results.data[0]!), { replace: true });
  }, [code, results.data]);

  const onScan = (scanned: string) => {
    setScanning(false);
    setText('');
    setCode(scanned);
  };

  return (
    <>
      <h2 className={styles.subtitle}>¿Cuánto cuesta?</h2>

      {scanning ? (
        cameraError ? (
          <p className={styles.error}>{cameraError}</p>
        ) : (
          <Suspense fallback={<p className={styles.muted}>Abriendo la cámara…</p>}>
            <Scanner mode="barcode" onResult={onScan} onError={setCameraError} />
          </Suspense>
        )
      ) : (
        <div className={styles.actions}>
          <button className={styles.primary} onClick={() => setScanning(true)}>
            Escanear código
          </button>
        </div>
      )}

      <input
        className={styles.input}
        value={text}
        onChange={(event) => {
          setCode(null);
          setScanning(false);
          setText(event.target.value);
        }}
        placeholder="Buscar: leche estrella, arroz…"
        aria-label="Buscar producto"
        type="search"
        autoComplete="off"
      />

      {code && <p className={styles.muted}>Código {code}</p>}
      {results.isFetching && <p className={styles.muted}>Buscando…</p>}
      {results.isError && <p className={styles.error}>{results.error.message}</p>}
      {results.isSuccess && results.data.length === 0 && <p>Aún no has comprado esto.</p>}

      <ul className={styles.list}>
        {results.data?.map((result) => (
          <li key={`${result.kind}:${result.id}`}>
            <Link href={priceHref(result)} className={styles.row}>
              <span className={styles.rowMain}>
                <strong>{result.name}</strong>
                <span className={styles.muted}>
                  {result.storeNames.join(' · ')}
                  {result.lastPurchasedAt && ` · ${formatDate(result.lastPurchasedAt)}`}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className={styles.back}>
        ← Inicio
      </Link>
    </>
  );
}
