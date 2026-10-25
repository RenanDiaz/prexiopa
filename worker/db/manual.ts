import { and, desc, eq, isNull, max, sql } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { newId } from '../lib/id';
import type { Db } from './client';
import { products, purchaseLines, purchases, storeItems, stores } from './schema';

// F4 — Compra manual (CA4.1–CA4.4): tiendas sin factura electrónica.

export type ManualLineInput = {
  /** Producto existente del usuario (búsqueda o escaneo con resultado). */
  productId?: string;
  /** Código de barras escaneado sin resultado: queda en el ítem y se vincula por GTIN. */
  code?: string;
  /** Texto libre, o el nombre del producto si viene `productId`. */
  description: string;
  quantity: number;
  lineTotalCents: number;
};

export type ManualPurchaseInput = {
  store: { id: string } | { name: string };
  /** ISO-8601 UTC; por defecto, ahora. */
  issuedAt?: string;
  lines: ManualLineInput[];
};

export class ManualPurchaseError extends Error {
  override name = 'ManualPurchaseError';
}

export function manualRepo(db: Db, userId: string) {
  /** Tiendas donde el usuario compró, con la última fecha (para el autocompletado de CA4.1). */
  async function listStores(query: string) {
    const term = query.trim();
    const name = sql<string>`coalesce(${stores.displayName}, ${stores.legalName})`;
    return db
      .select({ id: stores.id, name, lastPurchasedAt: max(purchases.issuedAt) })
      .from(stores)
      .innerJoin(purchases, and(eq(purchases.storeId, stores.id), eq(purchases.userId, userId)))
      .where(term ? sql`${name} like ${`%${term.replace(/[%_]/g, '')}%`}` : undefined)
      .groupBy(stores.id)
      .orderBy(desc(max(purchases.issuedAt)))
      .limit(20);
  }

  /** Tienda existente donde el usuario compró, o una nueva solo con nombre (ruc NULL). */
  async function resolveStore(store: ManualPurchaseInput['store']): Promise<string> {
    if ('id' in store) {
      // Solo tiendas donde el usuario ya compró (una tienda nueva llega por nombre).
      const [own] = await db
        .select({ id: purchases.storeId })
        .from(purchases)
        .where(and(eq(purchases.storeId, store.id), eq(purchases.userId, userId)))
        .limit(1);
      if (!own) throw new ManualPurchaseError('Tienda no encontrada');
      return own.id;
    }
    const id = newId();
    // Los productos escaneados en una tienda manual son EAN/UPC: formato `gtin`.
    await db.insert(stores).values({ id, legalName: store.name, codeFormat: 'gtin' });
    return id;
  }

  /** store_item del usuario en esa tienda para la línea: lo reutiliza o lo crea. */
  async function itemFor(storeId: string, line: ManualLineInput, statements: BatchItem<'sqlite'>[]) {
    const mine = (condition: ReturnType<typeof eq>) =>
      db.query.storeItems.findFirst({
        where: and(eq(storeItems.userId, userId), eq(storeItems.storeId, storeId), condition),
        columns: { id: true },
      });

    if (line.productId) {
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, line.productId), eq(products.userId, userId)),
        columns: { id: true, name: true },
      });
      if (!product) throw new ManualPurchaseError('Producto no encontrado');
      const existing = await mine(eq(storeItems.productId, product.id));
      if (existing) return existing.id;
      const id = newId();
      statements.push(
        db.insert(storeItems).values({
          id,
          userId,
          storeId,
          description: product.name,
          productId: product.id,
          linkSource: 'user',
        }),
      );
      return id;
    }

    if (line.code) {
      const existing = await mine(eq(storeItems.code, line.code));
      if (existing) return existing.id;
    } else {
      const existing = await db.query.storeItems.findFirst({
        where: and(
          eq(storeItems.userId, userId),
          eq(storeItems.storeId, storeId),
          isNull(storeItems.code),
          sql`lower(${storeItems.description}) = lower(${line.description})`,
        ),
        columns: { id: true },
      });
      if (existing) return existing.id;
    }
    const id = newId();
    statements.push(
      db.insert(storeItems).values({ id, userId, storeId, code: line.code ?? null, description: line.description }),
    );
    return id;
  }

  return {
    listStores,

    /** Guarda la compra manual en un batch atómico; las cantidades las da el usuario (CA4.2). */
    async create(input: ManualPurchaseInput): Promise<{ id: string; storeId: string }> {
      if (input.lines.length === 0) throw new ManualPurchaseError('La compra no tiene líneas');
      const storeId = await resolveStore(input.store);

      const statements: BatchItem<'sqlite'>[] = [];
      const itemIds: string[] = [];
      for (const line of input.lines) itemIds.push(await itemFor(storeId, line, statements));

      const totalCents = input.lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
      const purchaseId = newId();
      statements.push(
        db.insert(purchases).values({
          id: purchaseId,
          userId,
          storeId,
          source: 'manual',
          issuedAt: input.issuedAt ?? new Date().toISOString(),
          subtotalCents: totalCents,
          totalCents,
          paidCents: totalCents,
        }),
      );
      input.lines.forEach((line, i) => {
        statements.push(
          db.insert(purchaseLines).values({
            purchaseId,
            lineNo: i + 1,
            storeItemId: itemIds[i]!,
            description: line.description,
            quantity: line.quantity,
            listPriceCents: Math.round(line.lineTotalCents / line.quantity),
            lineTotalCents: line.lineTotalCents,
            quantitySource: 'user',
          }),
        );
      });
      await db.batch(statements as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);
      return { id: purchaseId, storeId };
    },
  };
}
