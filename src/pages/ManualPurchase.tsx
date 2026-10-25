import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useState, type FormEvent } from 'react';
import {
  createManualPurchase,
  listStores,
  renameCatalogEntry,
  searchCatalog,
  type ManualLine,
  type SearchResult,
} from '../api';
import styles from '../App.module.css';
import { formatCents, formatQuantity, parseMoneyToCents, todayInPanama } from '../format';
import { Link, navigate } from '../router';

const Scanner = lazy(() => import('../scanner/Scanner'));

type StoreChoice = { id: string; name: string } | { name: string };
type ProductChoice = Pick<ManualLine, 'productId' | 'code' | 'description'>;

// F4 — Compra manual (CA4.1–CA4.4): tienda, y por línea solo producto, cantidad y total pagado.
export function ManualPurchase() {
  const queryClient = useQueryClient();
  const [store, setStore] = useState<StoreChoice | null>(null);
  const [date, setDate] = useState(todayInPanama);
  const [lines, setLines] = useState<ManualLine[]>([]);
  const save = useMutation({
    mutationFn: () => createManualPurchase({ store: store!, date, lines }),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries();
      navigate(`/compras/${id}`, { replace: true });
    },
  });

  if (!store) return <StorePicker onPick={setStore} />;

  const total = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  return (
    <>
      <div className={styles.titleRow}>
        <h2 className={styles.subtitle}>{store.name}</h2>
        <button className={styles.link} onClick={() => setStore(null)} disabled={save.isPending}>
          Cambiar tienda
        </button>
      </div>
      <label className={styles.inlineField}>
        <span className={styles.muted}>Fecha</span>
        <input
          type="date"
          className={styles.input}
          value={date}
          max={todayInPanama()}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <ul className={styles.lines}>
        {lines.map((line, i) => (
          <li key={i} className={styles.line}>
            <span>{line.description}</span>
            <span className={styles.muted}>× {formatQuantity(line.quantity)}</span>
            <span className={styles.amount}>
              {formatCents(line.lineTotalCents)}{' '}
              <button
                className={styles.link}
                aria-label={`Quitar ${line.description}`}
                onClick={() => setLines(lines.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>

      <LineEditor onAdd={(line) => setLines([...lines, line])} />

      {lines.length > 0 && (
        <>
          <dl className={styles.totals}>
            <dt className={styles.strong}>Total</dt>
            <dd className={styles.strong}>{formatCents(total)}</dd>
          </dl>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar compra'}
            </button>
          </div>
          {save.isError && <p className={styles.error}>No se pudo guardar: {save.error.message}</p>}
        </>
      )}
      <Link href="/" className={styles.back}>
        Cancelar
      </Link>
    </>
  );
}

/** CA4.1: autocompletado sobre las tiendas existentes, o una nueva solo con nombre. */
function StorePicker({ onPick }: { onPick: (store: StoreChoice) => void }) {
  const [text, setText] = useState('');
  const stores = useQuery({ queryKey: ['stores', text.trim()], queryFn: () => listStores(text.trim()) });
  const name = text.trim().replace(/\s+/g, ' ');
  const exact = stores.data?.some((store) => store.name.toLowerCase() === name.toLowerCase());

  return (
    <>
      <h2 className={styles.subtitle}>Compra manual</h2>
      <p className={styles.muted}>Para tiendas que no dan factura electrónica.</p>
      <input
        className={styles.input}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="¿Dónde compraste?"
        aria-label="Tienda"
        autoFocus
        maxLength={120}
      />
      <ul className={styles.list}>
        {name && !exact && (
          <li>
            <button className={styles.rowButton} onClick={() => onPick({ name })}>
              <strong>Crear «{name}»</strong>
            </button>
          </li>
        )}
        {stores.data?.map((store) => (
          <li key={store.id}>
            <button className={styles.rowButton} onClick={() => onPick({ id: store.id, name: store.name })}>
              <strong>{store.name}</strong>
            </button>
          </li>
        ))}
      </ul>
      <Link href="/" className={styles.back}>
        Cancelar
      </Link>
    </>
  );
}

/** Una línea: producto (búsqueda, escaneo o texto libre), cantidad y total pagado (CA4.2, CA4.3). */
function LineEditor({ onAdd }: { onAdd: (line: ManualLine) => void }) {
  const [product, setProduct] = useState<ProductChoice | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState('');
  const cents = parseMoneyToCents(total);

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!product || cents === null || cents <= 0) return;
    onAdd({ ...product, quantity, lineTotalCents: cents });
    setProduct(null);
    setQuantity(1);
    setTotal('');
  };

  if (!product) return <ProductPicker onPick={setProduct} />;

  return (
    <form className={styles.form} onSubmit={add}>
      <strong>{product.description}</strong>
      <div className={styles.lineEditor}>
        <span className={styles.stepper}>
          <button
            type="button"
            className={styles.stepButton}
            aria-label="Una unidad menos"
            disabled={quantity <= 1}
            onClick={() => setQuantity(quantity - 1)}
          >
            −
          </button>
          <span className={styles.stepValue}>{quantity}</span>
          <button type="button" className={styles.stepButton} aria-label="Una unidad más" onClick={() => setQuantity(quantity + 1)}>
            +
          </button>
        </span>
        <input
          className={styles.input}
          value={total}
          onChange={(event) => setTotal(event.target.value)}
          inputMode="decimal"
          placeholder="Total pagado"
          aria-label="Total pagado por la línea"
          autoFocus
        />
        <button className={styles.primary} type="submit" disabled={cents === null || cents <= 0}>
          Agregar
        </button>
      </div>
      <button type="button" className={`${styles.link} ${styles.start}`} onClick={() => setProduct(null)}>
        Otro producto
      </button>
    </form>
  );
}

function ProductPicker({ onPick }: { onPick: (product: ProductChoice) => void }) {
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const query = text.trim();
  const params = code ? { code } : { q: query };
  const results = useQuery({
    queryKey: ['catalog-search', params],
    queryFn: () => searchCatalog(params),
    enabled: !!code || query.length >= 2,
  });

  // Un ítem sin producto se convierte en producto para que la línea quede vinculada.
  const choose = useMutation({
    mutationFn: async (result: SearchResult): Promise<ProductChoice> => {
      const productId =
        result.kind === 'product' ? result.id : (await renameCatalogEntry('item', result.id, result.name)).productId;
      return { productId, description: result.name };
    },
    onSuccess: onPick,
  });

  return (
    <div className={styles.form}>
      {scanning && !cameraError && (
        <Suspense fallback={<p className={styles.muted}>Abriendo la cámara…</p>}>
          <Scanner
            mode="barcode"
            onResult={(scanned) => {
              setScanning(false);
              setCode(scanned);
            }}
            onError={setCameraError}
          />
        </Suspense>
      )}
      {cameraError && <p className={styles.error}>{cameraError}</p>}
      <div className={styles.lineEditor}>
        <input
          className={styles.input}
          value={text}
          onChange={(event) => {
            setCode(null);
            setText(event.target.value);
          }}
          placeholder={code ? 'Nombre del producto nuevo' : 'Producto'}
          aria-label="Producto"
          maxLength={120}
        />
        <button type="button" className={styles.button} onClick={() => setScanning(!scanning)}>
          {scanning ? 'Cerrar' : 'Escanear'}
        </button>
      </div>
      {code && <p className={styles.muted}>Código {code}</p>}

      <ul className={styles.list}>
        {query && (
          <li>
            <button
              className={styles.rowButton}
              onClick={() => onPick({ description: query.replace(/\s+/g, ' '), code: code ?? undefined })}
            >
              <strong>Usar «{query}»</strong>
              {code && <span className={styles.muted}>Producto nuevo con el código {code}</span>}
            </button>
          </li>
        )}
        {results.data?.map((result) => (
          <li key={`${result.kind}:${result.id}`}>
            <button className={styles.rowButton} disabled={choose.isPending} onClick={() => choose.mutate(result)}>
              <strong>{result.name}</strong>
              <span className={styles.muted}>{result.storeNames.join(' · ')}</span>
            </button>
          </li>
        ))}
      </ul>
      {code && results.isSuccess && results.data.length === 0 && !query && (
        <p className={styles.muted}>Aún no has comprado este código. Escribe su nombre arriba.</p>
      )}
    </div>
  );
}
