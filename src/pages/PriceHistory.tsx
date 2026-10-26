import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react';
import {
  ApiError,
  getPriceHistory,
  linkItem,
  renameCatalogEntry,
  searchCatalog,
  setBarcode,
  setItemWeighed,
  unlinkItem,
  type PriceEntry,
  type PriceHistory as History,
  type SearchResult,
} from '../api';
import styles from '../App.module.css';
import { formatDate, formatEntryPrice, formatQuantity } from '../format';
import { Link, navigate } from '../router';

const Scanner = lazy(() => import('../scanner/Scanner'));

// F3 — Historial de precios (CA3.1, CA3.2) y F5 — nombrar y vincular (CA5.1, CA5.2).
export function PriceHistory({ kind, id }: { kind: 'product' | 'item'; id: string }) {
  const history = useQuery({ queryKey: ['price-history', kind, id], queryFn: () => getPriceHistory(kind, id) });

  // Un ítem que ya tiene producto se muestra como producto.
  const redirect = history.data && 'redirectTo' in history.data ? history.data.redirectTo.productId : null;
  useEffect(() => {
    if (redirect) navigate(`/precios/producto/${redirect}`, { replace: true });
  }, [redirect]);

  if (history.isPending || redirect) return <p className={styles.muted}>Cargando…</p>;
  if (history.isError) return <p className={styles.error}>No se pudo cargar: {history.error.message}</p>;
  if ('redirectTo' in history.data) return null;
  return <HistoryView data={history.data} />;
}

function HistoryView({ data }: { data: History }) {
  const { last, lowest90, entries } = data;
  return (
    <>
      <Link href="/precios" className={styles.back}>
        ← Buscar
      </Link>
      <ProductName data={data} />
      <Barcode data={data} />

      <dl className={styles.summary}>
        <dt>Último precio</dt>
        <dd>{last ? <PriceAt entry={last} /> : '—'}</dd>
        <dt>Más bajo (90 días)</dt>
        <dd>{lowest90 ? <PriceAt entry={lowest90} /> : '—'}</dd>
      </dl>

      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.lineId}>
            <Link href={`/compras/${entry.purchaseId}`} className={styles.row}>
              <span className={styles.rowMain}>
                <span>{entry.storeName}</span>
                <span className={styles.muted}>
                  {formatDate(entry.issuedAt)}
                  {entry.quantity !== 1 && ` · ${formatQuantity(entry.quantity)} ${entry.unit === 'u' ? 'u' : entry.unit}`}
                  {entry.quantitySource === 'inferred' && ' · cantidad inferida'}
                </span>
              </span>
              <span className={entry.unitPriceCents === null ? styles.muted : styles.amount}>
                {formatEntryPrice(entry)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {entries.some((entry) => entry.unitPriceCents === null) && (
        <p className={styles.muted}>
          "La línea" es lo que pagaste en esa compra: la tienda no reporta la cantidad real. Corrígela en el detalle de la
          compra para comparar por unidad.
        </p>
      )}

      <Items data={data} />
    </>
  );
}

/** CA5.7: agregar el código de barras a algo ya creado (escaneándolo o tecleándolo). */
function Barcode({ data }: { data: History }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  // Un escaneo fallido (código inválido o en uso) vuelve a abrir la cámara para reintentar.
  const [scanAttempt, setScanAttempt] = useState(0);
  const save = useMutation({
    mutationFn: (code: string) => setBarcode(data.kind, data.id, code),
    onSuccess: async ({ productId }) => {
      setAdding(false);
      setTyped('');
      await queryClient.invalidateQueries();
      if (data.kind === 'item') navigate(`/precios/producto/${productId}`, { replace: true });
    },
    onError: () => setScanAttempt((attempt) => attempt + 1),
  });

  if (data.gtin) return <p className={styles.muted}>Código de barras {data.gtin}</p>;
  if (!adding) {
    return (
      <button className={styles.linkInline} onClick={() => setAdding(true)}>
        Agregar código de barras
      </button>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (typed.trim()) save.mutate(typed.trim());
  };
  // Un código que ya es de otro producto no se fusiona solo: se lleva al usuario a ese producto (F5).
  const inUse = save.error instanceof ApiError && save.error.code === 'in_use' ? save.error : null;
  return (
    <div className={styles.form}>
      {cameraError ? (
        <p className={styles.error}>{cameraError} Teclea el código abajo.</p>
      ) : (
        <Suspense fallback={<p className={styles.muted}>Abriendo la cámara…</p>}>
          <Scanner key={scanAttempt} mode="barcode" onResult={(code) => save.mutate(code)} onError={setCameraError} />
        </Suspense>
      )}
      <form className={styles.form} onSubmit={submit}>
        <input
          className={styles.input}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          inputMode="numeric"
          placeholder="O teclea el código"
          aria-label="Código de barras"
          autoComplete="off"
        />
        <div className={styles.actions}>
          <button className={styles.primary} type="submit" disabled={save.isPending || !typed.trim()}>
            Guardar código
          </button>
          <button className={styles.button} type="button" onClick={() => setAdding(false)} disabled={save.isPending}>
            Cancelar
          </button>
        </div>
      </form>
      {save.isError && <p className={styles.error}>{save.error.message}</p>}
      {inUse && (
        <p>
          <Link href={`/precios/producto/${String(inUse.body.productId)}`}>Ver «{String(inUse.body.name)}»</Link> y
          vincula este ítem desde ahí.
        </p>
      )}
    </div>
  );
}

function PriceAt({ entry }: { entry: PriceEntry }) {
  return (
    <>
      {formatEntryPrice(entry)}
      <br />
      <span className={styles.muted}>
        {entry.storeName} · {formatDate(entry.issuedAt)}
      </span>
    </>
  );
}

function ProductName({ data }: { data: History }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const rename = useMutation({
    mutationFn: () => renameCatalogEntry(data.kind, data.id, name),
    onSuccess: async ({ productId }) => {
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['price-history'] });
      if (data.kind === 'item') navigate(`/precios/producto/${productId}`, { replace: true });
    },
  });

  if (!editing) {
    return (
      <div className={styles.titleRow}>
        <h2 className={styles.subtitle}>{data.name}</h2>
        <button className={styles.link} onClick={() => setEditing(true)}>
          Renombrar
        </button>
      </div>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) rename.mutate();
  };
  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label="Nombre del producto"
        maxLength={120}
        autoFocus
      />
      <div className={styles.actions}>
        <button className={styles.primary} type="submit" disabled={rename.isPending || !name.trim()}>
          Guardar
        </button>
        <button className={styles.button} type="button" onClick={() => setEditing(false)}>
          Cancelar
        </button>
      </div>
      {rename.isError && <p className={styles.error}>{rename.error.message}</p>}
    </form>
  );
}

/** Ítems de tienda vinculados (CA5.2): desvincular o vincular con otro producto. */
function Items({ data }: { data: History }) {
  const queryClient = useQueryClient();
  const [linking, setLinking] = useState(false);
  const [text, setText] = useState('');
  const candidates = useQuery({
    queryKey: ['catalog-search', { q: text.trim() }],
    queryFn: () => searchCatalog({ q: text.trim() }),
    enabled: linking && text.trim().length >= 2,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['price-history'] });
  const unlink = useMutation({ mutationFn: unlinkItem, onSuccess: refresh });
  const weighed = useMutation({
    mutationFn: ({ itemId, isWeighed }: { itemId: string; isWeighed: boolean }) => setItemWeighed(itemId, isWeighed),
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ['purchase'] });
    },
  });
  const link = useMutation({
    mutationFn: async (target: SearchResult) => {
      // Un ítem sin producto se convierte en producto (con su descripción) para poder vincularlo.
      const productId =
        target.kind === 'product' ? target.id : (await renameCatalogEntry('item', target.id, target.name)).productId;
      await linkItem(data.items[0]!.id, productId);
      return productId;
    },
    onSuccess: async (productId) => {
      await refresh();
      navigate(`/precios/producto/${productId}`, { replace: true });
    },
  });

  return (
    <section>
      <h3 className={styles.sectionTitle}>Cómo lo llama cada tienda</h3>
      <ul className={styles.list}>
        {data.items.map((item) => (
          <li key={item.id} className={styles.row}>
            <span className={styles.rowMain}>
              <span>{item.description}</span>
              <span className={styles.muted}>
                {item.storeName}
                {item.code && ` · ${item.code}`}
                {item.linkSource === 'auto' && ' · vinculado por código'}
              </span>
              <button
                className={styles.linkInline}
                disabled={weighed.isPending}
                onClick={() => weighed.mutate({ itemId: item.id, isWeighed: !item.isWeighed })}
              >
                {item.isWeighed ? 'Se vende por peso · cambiar a por unidad' : 'Se vende por unidad · cambiar a por peso'}
              </button>
            </span>
            {data.kind === 'product' && data.items.length > 1 && (
              <button className={styles.link} onClick={() => unlink.mutate(item.id)} disabled={unlink.isPending}>
                Desvincular
              </button>
            )}
          </li>
        ))}
      </ul>

      {!linking ? (
        <button className={styles.button} onClick={() => setLinking(true)}>
          Es el mismo producto que…
        </button>
      ) : (
        <div className={styles.form}>
          <input
            className={styles.input}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Busca el producto en otra tienda"
            aria-label="Buscar producto para vincular"
            autoFocus
          />
          <ul className={styles.list}>
            {candidates.data
              ?.filter((result) => !(result.kind === data.kind && result.id === data.id))
              .map((result) => (
                <li key={`${result.kind}:${result.id}`}>
                  <button className={styles.rowButton} disabled={link.isPending} onClick={() => link.mutate(result)}>
                    <strong>{result.name}</strong>
                    <span className={styles.muted}>{result.storeNames.join(' · ')}</span>
                  </button>
                </li>
              ))}
          </ul>
          <button className={styles.button} onClick={() => setLinking(false)}>
            Cancelar
          </button>
          {link.isError && <p className={styles.error}>{link.error.message}</p>}
        </div>
      )}
    </section>
  );
}
