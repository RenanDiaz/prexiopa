export class ApiError extends Error {
  readonly status: number;
  /** Código de error de la API, p. ej. `dgi_unavailable`. */
  readonly code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    throw new ApiError(res.status, body.error ?? res.statusText, body.code);
  }
  return (await res.json()) as T;
}

export type Me = { email: string };

/** Inicia el login con Google: Better Auth devuelve la URL de Google a la que redirigir. */
export async function signInWithGoogle(): Promise<void> {
  const { url } = await api<{ url: string }>('/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', callbackURL: '/' }),
  });
  window.location.assign(url);
}

export async function signOut(): Promise<void> {
  await api('/auth/sign-out', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
}

export type PurchaseSummary = {
  id: string;
  storeName: string;
  source: 'cafe' | 'manual';
  issuedAt: string;
  totalCents: number;
  lineCount: number;
};

export type PurchasePage = { items: PurchaseSummary[]; nextCursor: string | null };

export type QuantitySource = 'invoice' | 'inferred' | 'user';
export type StoreQuantities = 'reliable' | 'always_one';
export type CodeFormat = 'gtin' | 'gtin_no_check' | 'internal';

export type PurchaseLine = {
  id: string;
  storeItemId: string;
  productId: string | null;
  isWeighed: boolean;
  quantitySource: QuantitySource;
  lineNo: number;
  description: string;
  quantity: number;
  listPriceCents: number;
  discountCents: number;
  lineTotalCents: number;
  taxRateBp: number;
  taxCents: number;
};

export type PurchaseDetail = {
  id: string;
  storeId: string;
  storeName: string;
  storeQuantities: StoreQuantities;
  source: 'cafe' | 'manual';
  cufe: string | null;
  issuedAt: string;
  branchAddress: string | null;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  paidCents: number | null;
  sourceUrl: string | null;
  taxBreakdown: { rateBp: number; taxCents: number; lineCount: number }[];
  lines: PurchaseLine[];
};

export type CafeInvoice = {
  cufe: string;
  issuedAt: string;
  issuer: { ruc: string; name: string; address: string | null };
  lines: {
    lineNo: number;
    description: string;
    quantity: number;
    lineTotalCents: number;
    discountCents: number;
  }[];
  totals: { totalCents: number; taxCents: number; discountCents: number; paidCents: number | null };
};

export type CafePreview = { invoice: CafeInvoice; existingPurchaseId: string | null };

const postJson = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const listPurchases = (cursor?: string) =>
  api<PurchasePage>(`/purchases${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
export const getPurchase = (id: string) => api<PurchaseDetail>(`/purchases/${encodeURIComponent(id)}`);
export const deletePurchase = (id: string) =>
  fetch(`/api/purchases/${encodeURIComponent(id)}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) throw new ApiError(res.status, 'No se pudo eliminar la compra');
  });
export const previewCafe = (input: string) => api<CafePreview>('/purchases/cafe/preview', postJson({ input }));
export const saveCafe = (input: string, scanMs?: number) =>
  api<{ id: string; created: boolean }>('/purchases/cafe', postJson({ input, scanMs }));

// F3 y F5 — Catálogo.

export type SearchResult = {
  kind: 'product' | 'item';
  id: string;
  name: string;
  storeNames: string[];
  lastPurchasedAt: string | null;
};

export type PriceEntry = {
  lineId: string;
  purchaseId: string;
  storeId: string;
  storeName: string;
  issuedAt: string;
  description: string;
  quantity: number;
  quantitySource: QuantitySource;
  lineTotalCents: number;
  unitPriceCents: number | null;
  unit: 'kg' | 'lb' | 'u';
};

export type PriceHistory = {
  kind: 'product' | 'item';
  id: string;
  name: string;
  gtin: string | null;
  items: {
    id: string;
    storeName: string;
    description: string;
    code: string | null;
    linkSource: string | null;
    isWeighed: boolean;
  }[];
  last: PriceEntry | null;
  lowest90: PriceEntry | null;
  entries: PriceEntry[];
};

export type StoreSettings = {
  id: string;
  ruc: string | null;
  legalName: string;
  displayName: string | null;
  codeFormat: CodeFormat;
  quantities: StoreQuantities;
  configuredByUser: boolean;
};

const sendJson = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

/** Para respuestas 204: valida el status sin leer JSON. */
async function apiNoContent(path: string, init: RequestInit): Promise<void> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    throw new ApiError(res.status, body.error ?? res.statusText, body.code);
  }
}

export const searchCatalog = (params: { q: string } | { code: string }) =>
  api<{ results: SearchResult[] }>(`/catalog/search?${new URLSearchParams(params)}`).then((r) => r.results);

export const getPriceHistory = (kind: 'product' | 'item', id: string) =>
  api<PriceHistory | { redirectTo: { productId: string } }>(
    `/catalog/${kind === 'product' ? 'products' : 'items'}/${encodeURIComponent(id)}`,
  );

export const renameCatalogEntry = (kind: 'product' | 'item', id: string, name: string) =>
  api<{ productId: string }>(
    `/catalog/${kind === 'product' ? 'products' : 'items'}/${encodeURIComponent(id)}`,
    sendJson('PATCH', { name }),
  );

export const linkItem = (itemId: string, productId: string) =>
  apiNoContent(`/catalog/items/${encodeURIComponent(itemId)}/product`, sendJson('PUT', { productId }));

export const unlinkItem = (itemId: string) =>
  apiNoContent(`/catalog/items/${encodeURIComponent(itemId)}/product`, sendJson('DELETE'));

export const setLineQuantity = (lineId: string, quantity: number) =>
  apiNoContent(`/purchase-lines/${encodeURIComponent(lineId)}`, sendJson('PATCH', { quantity }));

export const getStore = (id: string) => api<StoreSettings>(`/stores/${encodeURIComponent(id)}`);

export const updateStore = (
  id: string,
  changes: Partial<Pick<StoreSettings, 'displayName' | 'codeFormat' | 'quantities'>>,
) => apiNoContent(`/stores/${encodeURIComponent(id)}`, sendJson('PATCH', changes));

export const setItemWeighed = (itemId: string, isWeighed: boolean) =>
  apiNoContent(`/catalog/items/${encodeURIComponent(itemId)}/weighed`, sendJson('PATCH', { isWeighed }));

// F4 — Compra manual. F6 — Resumen.

export type StoreOption = { id: string; name: string; lastPurchasedAt: string | null };

export type ManualLine = {
  productId?: string;
  code?: string;
  description: string;
  quantity: number;
  lineTotalCents: number;
};

export type MonthlySummary = {
  months: { month: string; totalCents: number; count: number }[];
  currentMonth: string;
  byStore: { storeId: string; storeName: string; totalCents: number; count: number }[];
};

export const listStores = (q: string) =>
  api<{ items: StoreOption[] }>(`/stores?${new URLSearchParams({ q })}`).then((r) => r.items);

export const createManualPurchase = (input: {
  store: { id: string } | { name: string };
  date: string;
  lines: ManualLine[];
}) => api<{ id: string }>('/purchases/manual', sendJson('POST', input));

export const getSummary = () => api<MonthlySummary>('/summary');
