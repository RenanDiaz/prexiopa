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

export type PurchaseLine = {
  id: string;
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
  storeName: string;
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
export const saveCafe = (input: string) => api<{ id: string; created: boolean }>('/purchases/cafe', postJson({ input }));
