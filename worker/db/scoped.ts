import { and, count, desc, eq, getTableColumns, inArray, isNotNull, lt, or } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { detectCodeFormat } from '../cafe/codes';
import type { CafeInvoice } from '../cafe/parse';
import { newId } from '../lib/id';
import { catalogRepo, refreshStoreQuantities } from './catalog';
import { exportRepo } from './export';
import { getDb, type Db } from './client';
import { manualRepo, type ManualPurchaseInput } from './manual';
import { summaryRepo } from './summary';
import { purchaseLines, purchases, storeItems, stores } from './schema';

// D1 no tiene RLS: este módulo es la única puerta a los datos del usuario y
// TODA query filtra por userId. Cada endpoint nuevo agrega su caso a
// test/isolation.test.ts.

export type PurchaseSummary = {
  id: string;
  storeName: string;
  source: 'cafe' | 'manual';
  issuedAt: string;
  totalCents: number;
  lineCount: number;
};

export type PurchasePage = { items: PurchaseSummary[]; nextCursor: string | null };

export type TaxBreakdown = { rateBp: number; taxCents: number; lineCount: number };

// D1 acepta como máximo 100 parámetros por statement.
const MAX_IN_PARAMS = 90;

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Cursor opaco "issuedAt~id" para paginar por (issued_at DESC, id DESC). */
function encodeCursor(row: { issuedAt: string; id: string }): string {
  return `${row.issuedAt}~${row.id}`;
}

function decodeCursor(cursor: string): { issuedAt: string; id: string } | null {
  const [issuedAt, id] = cursor.split('~');
  return issuedAt && id ? { issuedAt, id } : null;
}

/**
 * Tiendas: una fila por cadena (RUC), compartida entre usuarios porque no es dato
 * personal. El formato de códigos se detecta con la primera factura (§10.2).
 */
async function ensureStore(db: Db, invoice: CafeInvoice): Promise<string> {
  const { ruc, dv, name } = invoice.issuer;
  await db
    .insert(stores)
    .values({ ruc, dv, legalName: name, codeFormat: detectCodeFormat(invoice.lines.map((line) => line.code)) })
    .onConflictDoNothing({ target: stores.ruc });
  const store = await db.query.stores.findFirst({ where: eq(stores.ruc, ruc), columns: { id: true } });
  if (!store) throw new Error(`No se pudo crear la tienda ${ruc}`);
  return store.id;
}

export function scoped(d1: D1Database, userId: string) {
  const db = getDb(d1);
  const catalog = catalogRepo(db, userId);
  const ownPurchase = (id: string) => and(eq(purchases.id, id), eq(purchases.userId, userId));

  async function findIdByCufe(cufe: string): Promise<string | null> {
    const row = await db.query.purchases.findFirst({
      where: and(eq(purchases.userId, userId), eq(purchases.cufe, cufe)),
      columns: { id: true },
    });
    return row?.id ?? null;
  }

  /** store_items existentes del usuario en esa tienda, por código. */
  async function knownItems(storeId: string, codes: string[]): Promise<Map<string, string>> {
    const known = new Map<string, string>();
    for (const part of chunks(codes, MAX_IN_PARAMS)) {
      const rows = await db
        .select({ id: storeItems.id, code: storeItems.code })
        .from(storeItems)
        .where(
          and(
            eq(storeItems.userId, userId),
            eq(storeItems.storeId, storeId),
            isNotNull(storeItems.code),
            inArray(storeItems.code, part),
          ),
        );
      for (const row of rows) if (row.code) known.set(row.code, row.id);
    }
    return known;
  }

  const manual = manualRepo(db, userId);

  return {
    catalog,
    summary: summaryRepo(db, userId),
    export: exportRepo(db, userId),
    stores: { list: manual.listStores },
    purchases: {
      async list(options: { cursor?: string; limit?: number } = {}): Promise<PurchasePage> {
        const limit = Math.min(Math.max(options.limit ?? 30, 1), 100);
        const after = options.cursor ? decodeCursor(options.cursor) : null;
        const rows = await db
          .select({
            id: purchases.id,
            storeName: stores.legalName,
            displayName: stores.displayName,
            source: purchases.source,
            issuedAt: purchases.issuedAt,
            totalCents: purchases.totalCents,
            lineCount: count(purchaseLines.id),
          })
          .from(purchases)
          .innerJoin(stores, eq(stores.id, purchases.storeId))
          .leftJoin(purchaseLines, eq(purchaseLines.purchaseId, purchases.id))
          .where(
            and(
              eq(purchases.userId, userId),
              after
                ? or(
                    lt(purchases.issuedAt, after.issuedAt),
                    and(eq(purchases.issuedAt, after.issuedAt), lt(purchases.id, after.id)),
                  )
                : undefined,
            ),
          )
          .groupBy(purchases.id)
          .orderBy(desc(purchases.issuedAt), desc(purchases.id))
          .limit(limit + 1);

        const page = rows.slice(0, limit);
        const last = page.at(-1);
        return {
          items: page.map(({ displayName, ...row }) => ({ ...row, storeName: displayName ?? row.storeName })),
          nextCursor: rows.length > limit && last ? encodeCursor(last) : null,
        };
      },

      async get(id: string) {
        const purchase = await db.query.purchases.findFirst({
          where: ownPurchase(id),
          columns: { rawJson: false, userId: false },
          with: { store: { columns: { id: true, legalName: true, displayName: true, ruc: true, quantities: true } } },
        });
        if (!purchase) return null;
        const lines = await db
          .select({
            ...getTableColumns(purchaseLines),
            productId: storeItems.productId,
            isWeighed: storeItems.isWeighed,
          })
          .from(purchaseLines)
          .innerJoin(storeItems, eq(storeItems.id, purchaseLines.storeItemId))
          .where(eq(purchaseLines.purchaseId, purchase.id))
          .orderBy(purchaseLines.lineNo);

        const byRate = new Map<number, TaxBreakdown>();
        for (const line of lines) {
          const entry = byRate.get(line.taxRateBp) ?? { rateBp: line.taxRateBp, taxCents: 0, lineCount: 0 };
          entry.taxCents += line.taxCents;
          entry.lineCount += 1;
          byRate.set(line.taxRateBp, entry);
        }

        const { store, ...rest } = purchase;
        return {
          ...rest,
          storeName: store.displayName ?? store.legalName,
          storeRuc: store.ruc,
          storeQuantities: store.quantities,
          taxBreakdown: [...byRate.values()].sort((a, b) => a.rateBp - b.rateBp),
          lines,
        };
      },

      findIdByCufe,

      /**
       * Guarda una factura CAFE con sus líneas en un solo batch atómico (§6.3).
       * Idempotente por (user_id, cufe): si ya existe, devuelve la existente.
       */
      async importCafe(
        invoice: CafeInvoice,
        sourceUrl: string,
        scanMs: number | null = null,
      ): Promise<{ id: string; created: boolean }> {
        const existing = await findIdByCufe(invoice.cufe);
        if (existing) return { id: existing, created: false };

        const storeId = await ensureStore(db, invoice);
        const codes = [...new Set(invoice.lines.flatMap((line) => (line.code ? [line.code] : [])))];
        const itemIds = await knownItems(storeId, codes);

        const statements: BatchItem<'sqlite'>[] = [];
        const lineItemIds = invoice.lines.map((line) => {
          const known = line.code ? itemIds.get(line.code) : undefined;
          if (known) return known;
          const id = newId();
          if (line.code) itemIds.set(line.code, id);
          statements.push(
            db.insert(storeItems).values({ id, userId, storeId, code: line.code, description: line.description }),
          );
          return id;
        });

        const purchaseId = newId();
        const { totals } = invoice;
        statements.push(
          db.insert(purchases).values({
            id: purchaseId,
            userId,
            storeId,
            source: 'cafe',
            cufe: invoice.cufe,
            issuedAt: invoice.issuedAt,
            branchAddress: invoice.issuer.address,
            subtotalCents: totals.subtotalCents,
            taxCents: totals.taxCents,
            discountCents: totals.discountCents,
            totalCents: totals.totalCents,
            paidCents: totals.paidCents,
            sourceUrl,
            rawJson: JSON.stringify(invoice),
            scanMs,
          }),
        );
        invoice.lines.forEach((line, i) => {
          statements.push(
            db.insert(purchaseLines).values({
              purchaseId,
              lineNo: line.lineNo,
              storeItemId: lineItemIds[i]!,
              description: line.description,
              quantity: line.quantity,
              listPriceCents: line.listPriceCents,
              discountCents: line.discountCents,
              lineTotalCents: line.lineTotalCents,
              taxRateBp: line.taxRateBp,
              taxCents: line.taxCents,
            }),
          );
        });

        try {
          await db.batch(statements as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);
        } catch (error) {
          // Dos guardados simultáneos de la misma factura: gana el primero.
          const winner = await findIdByCufe(invoice.cufe);
          if (winner) return { id: winner, created: false };
          throw error;
        }

        // Catálogo (§10.2, §10.6): pesables y vínculos por GTIN, cantidades de la
        // tienda e inferencia de unidades. Si falla, la compra ya quedó guardada.
        await catalog.reindexItems(storeId);
        await refreshStoreQuantities(db, storeId);
        await catalog.inferQuantities();
        return { id: purchaseId, created: true };
      },

      /** F4: compra manual. Después vincula por GTIN lo escaneado. */
      async createManual(input: ManualPurchaseInput): Promise<{ id: string }> {
        const { id, storeId } = await manual.create(input);
        await catalog.reindexItems(storeId);
        return { id };
      },

      /** Devuelve false si la compra no existe o no es del usuario. */
      async delete(id: string): Promise<boolean> {
        const deleted = await db.delete(purchases).where(ownPurchase(id)).returning({ id: purchases.id });
        return deleted.length > 0;
      },
    },
  };
}

export type Scoped = ReturnType<typeof scoped>;
