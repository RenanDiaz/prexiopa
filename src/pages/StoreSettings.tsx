import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { getStore, updateStore, type CodeFormat, type StoreQuantities, type StoreSettings as Store } from '../api';
import styles from '../App.module.css';

// CA5.4 (nombre visible) y correcciones de §10.2 (formato de códigos) y §10.6 (cantidades).
export function StoreSettings({ id }: { id: string }) {
  const store = useQuery({ queryKey: ['store', id], queryFn: () => getStore(id) });
  if (store.isPending) return <p className={styles.muted}>Cargando…</p>;
  if (store.isError) return <p className={styles.error}>No se pudo cargar la tienda: {store.error.message}</p>;
  return <StoreForm store={store.data} />;
}

const CODE_FORMAT_LABELS: Record<CodeFormat, string> = {
  gtin: 'Códigos de barras completos (EAN/UPC)',
  gtin_no_check: 'Códigos de barras sin dígito verificador',
  internal: 'Códigos internos de la tienda',
};

const QUANTITY_LABELS: Record<StoreQuantities, string> = {
  reliable: 'La factura trae la cantidad real',
  always_one: 'La factura siempre dice 1 (cantidad no confiable)',
};

function StoreForm({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(store.displayName ?? '');
  const [codeFormat, setCodeFormat] = useState(store.codeFormat);
  const [quantities, setQuantities] = useState(store.quantities);

  const save = useMutation({
    mutationFn: () =>
      updateStore(store.id, {
        displayName: displayName.trim() || null,
        ...(codeFormat !== store.codeFormat ? { codeFormat } : {}),
        ...(quantities !== store.quantities ? { quantities } : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      window.history.back();
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <button type="button" className={`${styles.link} ${styles.start}`} onClick={() => window.history.back()}>
        ← Volver
      </button>
      <h2 className={styles.subtitle}>{store.displayName ?? store.legalName}</h2>
      <p className={styles.muted}>
        {store.legalName}
        {store.ruc && ` · RUC ${store.ruc}`}
      </p>

      <label htmlFor="displayName">Nombre visible</label>
      <input
        id="displayName"
        className={styles.input}
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder={store.legalName}
        maxLength={120}
      />

      <label htmlFor="codeFormat">Códigos de producto en sus facturas</label>
      <select
        id="codeFormat"
        className={styles.input}
        value={codeFormat}
        onChange={(event) => setCodeFormat(event.target.value as CodeFormat)}
      >
        {Object.entries(CODE_FORMAT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label htmlFor="quantities">Cantidades</label>
      <select
        id="quantities"
        className={styles.input}
        value={quantities}
        onChange={(event) => setQuantities(event.target.value as StoreQuantities)}
      >
        {Object.entries(QUANTITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <p className={styles.muted}>
        Prexiopá detecta estos dos valores con tus facturas. Si los cambias, se recalculan los vínculos y las cantidades
        de esta tienda.
      </p>

      <div className={styles.actions}>
        <button className={styles.primary} type="submit" disabled={save.isPending}>
          {save.isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
      {save.isError && <p className={styles.error}>{save.error.message}</p>}
    </form>
  );
}
