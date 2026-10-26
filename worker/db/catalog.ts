import { and, desc, eq, inArray, notExists, or, sql, type SQL } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import type { CodeFormat } from '../cafe/codes';
import {
  CATALOG_VERSION,
  detectStoreQuantities,
  effectiveUnitPriceCents,
  hasRealQuantity,
  inferUnits,
  isWeighedItem,
  normalizeGtin,
  type QuantitySource,
  type StoreQuantities,
} from '../catalog/rules';
import { newId } from '../lib/id';
import type { Db } from './client';
import { products, purchaseLines, purchases, storeItems, stores, users } from './schema';

// Catálogo del usuario: vínculos producto ↔ ítem de tienda (F5, §10.2), cantidades
// no confiables (§10.6) y consulta de precios (F3). Toda query filtra por userId,
// salvo las de `stores`, que es una tabla compartida sin datos personales.

const DAY_MS = 86_400_000;
const INFERENCE_WINDOW_MS = 60 * DAY_MS;
const LOWEST_WINDOW_MS = 90 * DAY_MS;
const LARGE_INVOICE_LINES = 10;
const MAX_IN_PARAMS = 90;

export type PriceUnit = 'kg' | 'lb' | 'u';

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
  /** Precio efectivo por unidad o por kg; null si la cantidad no es real (§10.6). */
  unitPriceCents: number | null;
  unit: PriceUnit;
};

export type SearchResult = {
  kind: 'product' | 'item';
  id: string;
  name: string;
  storeNames: string[];
  lastPurchasedAt: string | null;
};

export type HistoryTarget = { productId: string } | { itemId: string };

export type SetBarcodeResult =
  | { ok: true; productId: string }
  | { ok: false; error: 'not_found' | 'invalid_code' | 'has_code' }
  | { ok: false; error: 'in_use'; productId: string; name: string };

/** `is_weighed` ya incluye la detección por descripción y la corrección del usuario. */
function unitOf(description: string, isWeighed: boolean): PriceUnit {
  if (!isWeighed) return 'u';
  return /\bLBS?\b/i.test(description) ? 'lb' : 'kg';
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function runBatch(db: Db, statements: BatchItem<'sqlite'>[]) {
  for (const part of chunks(statements, 100)) {
    await db.batch(part as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);
  }
}

/** Quita acentos y separa en palabras para buscar con LIKE (CA3.3). */
function searchTerms(query: string): string[] {
  return query
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/\s+/)
    .map((term) => term.replace(/[%_]/g, '').trim())
    .filter((term) => term.length > 0)
    .slice(0, 6);
}

/**
 * §10.6 regla 1, para una tienda. Usa las cantidades tal como vinieron en la
 * factura (quantity_source = 'invoice') de todas las compras de esa tienda.
 */
export async function refreshStoreQuantities(db: Db, storeId: string): Promise<void> {
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    columns: { quantities: true, configuredByUser: true },
  });
  if (!store || store.configuredByUser) return;

  const large = db
    .select({ id: purchaseLines.purchaseId })
    .from(purchaseLines)
    .innerJoin(purchases, eq(purchases.id, purchaseLines.purchaseId))
    .where(eq(purchases.storeId, storeId))
    .groupBy(purchaseLines.purchaseId)
    .having(sql`count(*) >= ${LARGE_INVOICE_LINES}`);

  const [stats] = await db
    .select({
      lines: sql<number>`count(*)`,
      nonUnit: sql<number>`coalesce(sum(case when ${purchaseLines.quantity} <> 1 then 1 else 0 end), 0)`,
      weighedUnit: sql<number>`coalesce(sum(case when ${storeItems.isWeighed} = 1 and ${purchaseLines.quantity} = 1 then 1 else 0 end), 0)`,
    })
    .from(purchaseLines)
    .innerJoin(storeItems, eq(storeItems.id, purchaseLines.storeItemId))
    .where(and(inArray(purchaseLines.purchaseId, large), eq(purchaseLines.quantitySource, 'invoice')));

  const detected = detectStoreQuantities({
    largeInvoiceLines: stats?.lines ?? 0,
    largeInvoiceNonUnitLines: stats?.nonUnit ?? 0,
    weighedUnitLines: stats?.weighedUnit ?? 0,
  });
  if (detected !== store.quantities) {
    await db.update(stores).set({ quantities: detected }).where(eq(stores.id, storeId));
  }
}

export function catalogRepo(db: Db, userId: string) {
  /**
   * Recalcula `is_weighed` y los vínculos automáticos por GTIN (CA5.3) de los
   * ítems del usuario. Los vínculos hechos por el usuario no se tocan.
   */
  async function reindexItems(storeId?: string): Promise<void> {
    const items = await db
      .select({
        id: storeItems.id,
        code: storeItems.code,
        description: storeItems.description,
        productId: storeItems.productId,
        linkSource: storeItems.linkSource,
        isWeighed: storeItems.isWeighed,
        weighedByUser: storeItems.weighedByUser,
        codeFormat: stores.codeFormat,
      })
      .from(storeItems)
      .innerJoin(stores, eq(stores.id, storeItems.storeId))
      .where(and(eq(storeItems.userId, userId), storeId ? eq(storeItems.storeId, storeId) : undefined));

    const wanted = new Map<string, { gtin: string | null; isWeighed: boolean }>();
    const gtins = new Set<string>();
    for (const item of items) {
      const isWeighed = item.weighedByUser ?? isWeighedItem(item.code, item.description);
      const gtin = isWeighed ? null : normalizeGtin(item.code, item.codeFormat as CodeFormat);
      wanted.set(item.id, { gtin, isWeighed });
      if (gtin && item.linkSource !== 'user') gtins.add(gtin);
    }

    // Productos existentes del usuario para esos GTIN; los que falten se crean.
    const productByGtin = new Map<string, string>();
    for (const part of chunks([...gtins], MAX_IN_PARAMS)) {
      const rows = await db
        .select({ id: products.id, gtin: products.gtin })
        .from(products)
        .where(and(eq(products.userId, userId), inArray(products.gtin, part)));
      for (const row of rows) if (row.gtin) productByGtin.set(row.gtin, row.id);
    }

    const statements: BatchItem<'sqlite'>[] = [];
    for (const item of items) {
      const { gtin, isWeighed } = wanted.get(item.id)!;
      const changes: Partial<typeof storeItems.$inferInsert> = {};
      if (isWeighed !== item.isWeighed) changes.isWeighed = isWeighed;

      if (item.linkSource !== 'user') {
        let productId: string | null = null;
        if (gtin) {
          productId = productByGtin.get(gtin) ?? null;
          if (!productId) {
            productId = newId();
            productByGtin.set(gtin, productId);
            statements.push(db.insert(products).values({ id: productId, userId, name: item.description, gtin }));
          }
        }
        if (productId !== item.productId) {
          changes.productId = productId;
          changes.linkSource = productId ? 'auto' : null;
        }
      }
      if (Object.keys(changes).length > 0) {
        statements.push(db.update(storeItems).set(changes).where(eq(storeItems.id, item.id)));
      }
    }
    await runBatch(db, statements);
    await deleteOrphanProducts();
  }

  /** Un producto solo existe a través de sus ítems: sin ítems, se borra. */
  async function deleteOrphanProducts(): Promise<void> {
    await db
      .delete(products)
      .where(
        and(
          eq(products.userId, userId),
          notExists(db.select({ one: sql`1` }).from(storeItems).where(eq(storeItems.productId, products.id))),
        ),
      );
  }

  /** Líneas del usuario con lo necesario para inferir cantidades y comparar precios. */
  async function priceLines(where?: SQL) {
    return db
      .select({
        lineId: purchaseLines.id,
        purchaseId: purchases.id,
        storeId: stores.id,
        storeName: sql<string>`coalesce(${stores.displayName}, ${stores.legalName})`,
        storeQuantities: stores.quantities,
        issuedAt: purchases.issuedAt,
        itemId: storeItems.id,
        productId: storeItems.productId,
        isWeighed: storeItems.isWeighed,
        description: purchaseLines.description,
        quantity: purchaseLines.quantity,
        quantitySource: purchaseLines.quantitySource,
        lineTotalCents: purchaseLines.lineTotalCents,
      })
      .from(purchaseLines)
      .innerJoin(purchases, eq(purchases.id, purchaseLines.purchaseId))
      .innerJoin(stores, eq(stores.id, purchases.storeId))
      .innerJoin(storeItems, eq(storeItems.id, purchaseLines.storeItemId))
      .where(and(eq(purchases.userId, userId), where))
      .orderBy(desc(purchases.issuedAt), purchaseLines.lineNo);
  }

  /**
   * §10.6 regla 3: en tiendas `always_one`, infiere las unidades de las líneas
   * no pesables a partir del precio unitario conocido más cercano en el tiempo.
   */
  async function inferQuantities(): Promise<void> {
    const lines = await priceLines();
    const known = lines.flatMap((line) => {
      if (line.isWeighed || !hasRealQuantity(line.quantitySource, line.storeQuantities)) return [];
      const unit = effectiveUnitPriceCents(line);
      return unit ? [{ ...line, unit, time: Date.parse(line.issuedAt) }] : [];
    });

    const statements: BatchItem<'sqlite'>[] = [];
    for (const line of lines) {
      if (line.storeQuantities !== 'always_one' || line.quantitySource !== 'invoice' || line.isWeighed) continue;
      const time = Date.parse(line.issuedAt);
      const reference = known
        .filter(
          (candidate) =>
            candidate.lineId !== line.lineId &&
            (candidate.itemId === line.itemId || (!!line.productId && candidate.productId === line.productId)) &&
            Math.abs(candidate.time - time) <= INFERENCE_WINDOW_MS,
        )
        .sort((a, b) => Math.abs(a.time - time) - Math.abs(b.time - time))[0];
      if (!reference) continue;

      const units = inferUnits(line.lineTotalCents, reference.unit);
      if (units === null) continue;
      statements.push(
        db
          .update(purchaseLines)
          .set({ quantity: units, quantitySource: 'inferred' })
          .where(eq(purchaseLines.id, line.lineId)),
      );
    }
    await runBatch(db, statements);
  }

  /** Recalcula todo para las tiendas del usuario (al cambiar las reglas o la config de una tienda). */
  async function refreshAll(): Promise<void> {
    const storeIds = await db
      .selectDistinct({ id: purchases.storeId })
      .from(purchases)
      .where(eq(purchases.userId, userId));
    await reindexItems();
    for (const { id } of storeIds) await refreshStoreQuantities(db, id);
    await inferQuantities();
  }

  async function ownItem(itemId: string) {
    return db.query.storeItems.findFirst({
      where: and(eq(storeItems.id, itemId), eq(storeItems.userId, userId)),
      columns: { id: true, productId: true, description: true },
    });
  }

  async function ownProduct(productId: string) {
    return db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.userId, userId)),
      columns: { id: true, name: true, gtin: true },
    });
  }

  return {
    reindexItems,
    inferQuantities,
    refreshAll,

    /** Corre una sola vez por versión de reglas (CATALOG_VERSION). */
    async ensureUpToDate(): Promise<void> {
      const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { catalogVersion: true } });
      if (!user || user.catalogVersion >= CATALOG_VERSION) return;
      await refreshAll();
      await db.update(users).set({ catalogVersion: CATALOG_VERSION }).where(eq(users.id, userId));
    },

    /** F3: búsqueda por texto en el nombre del producto y la descripción de la factura (CA3.3). */
    async search(query: string): Promise<SearchResult[]> {
      const terms = searchTerms(query);
      if (terms.length === 0) return [];
      const haystack = sql`(coalesce(${products.name}, '') || ' ' || ${storeItems.description})`;
      return groupResults(
        await db
          .select(resultColumns())
          .from(storeItems)
          .leftJoin(products, eq(products.id, storeItems.productId))
          .innerJoin(stores, eq(stores.id, storeItems.storeId))
          .where(and(eq(storeItems.userId, userId), ...terms.map((term) => sql`${haystack} like ${`%${term}%`}`)))
          .limit(200),
      );
    },

    /** F3: búsqueda por código de barras escaneado (EAN/UPC). */
    async findByCode(rawCode: string): Promise<SearchResult[]> {
      const code = rawCode.trim();
      if (!/^\d{6,14}$/.test(code)) return [];
      const gtin = normalizeGtin(code, 'gtin');
      const matches = [eq(storeItems.code, code)];
      if (gtin) matches.push(eq(products.gtin, gtin));
      return groupResults(
        await db
          .select(resultColumns())
          .from(storeItems)
          .leftJoin(products, eq(products.id, storeItems.productId))
          .innerJoin(stores, eq(stores.id, storeItems.storeId))
          .where(and(eq(storeItems.userId, userId), or(...matches)))
          .limit(200),
      );
    },

    /** F3: historial de precios de un producto o de un ítem sin vincular (CA3.1, CA3.2). */
    async history(target: HistoryTarget, now = Date.now()) {
      let title: { kind: 'product' | 'item'; id: string; name: string; gtin: string | null };
      let itemFilter: SQL;
      if ('productId' in target) {
        const product = await ownProduct(target.productId);
        if (!product) return null;
        title = { kind: 'product', id: product.id, name: product.name, gtin: product.gtin };
        itemFilter = eq(storeItems.productId, product.id);
      } else {
        const item = await ownItem(target.itemId);
        if (!item) return null;
        if (item.productId) return { redirectTo: { productId: item.productId } } as const;
        title = { kind: 'item', id: item.id, name: item.description, gtin: null };
        itemFilter = eq(storeItems.id, item.id);
      }

      const lines = await priceLines(itemFilter);
      const entries: PriceEntry[] = lines.map((line) => ({
        lineId: line.lineId,
        purchaseId: line.purchaseId,
        storeId: line.storeId,
        storeName: line.storeName,
        issuedAt: line.issuedAt,
        description: line.description,
        quantity: line.quantity,
        quantitySource: line.quantitySource,
        lineTotalCents: line.lineTotalCents,
        unitPriceCents: effectiveUnitPriceCents(line),
        unit: unitOf(line.description, line.isWeighed),
      }));

      const recent = entries.filter(
        (entry) => entry.unitPriceCents !== null && now - Date.parse(entry.issuedAt) <= LOWEST_WINDOW_MS,
      );
      const lowest = recent.reduce<PriceEntry | null>(
        (best, entry) => (!best || entry.unitPriceCents! < best.unitPriceCents! ? entry : best),
        null,
      );

      const items = await db
        .select({
          id: storeItems.id,
          storeName: sql<string>`coalesce(${stores.displayName}, ${stores.legalName})`,
          description: storeItems.description,
          code: storeItems.code,
          isWeighed: storeItems.isWeighed,
          weighedByUser: storeItems.weighedByUser,
          linkSource: storeItems.linkSource,
        })
        .from(storeItems)
        .innerJoin(stores, eq(stores.id, storeItems.storeId))
        .where(and(eq(storeItems.userId, userId), itemFilter));

      return { ...title, items, last: entries[0] ?? null, lowest90: lowest, entries };
    },

    /** CA5.1: nombre legible. Si el ítem no tiene producto, se crea uno con ese nombre. */
    async rename(target: HistoryTarget, name: string): Promise<{ productId: string } | null> {
      if ('productId' in target) {
        const product = await ownProduct(target.productId);
        if (!product) return null;
        await db.update(products).set({ name }).where(eq(products.id, product.id));
        return { productId: product.id };
      }
      const item = await ownItem(target.itemId);
      if (!item) return null;
      if (item.productId) {
        await db.update(products).set({ name }).where(eq(products.id, item.productId));
        return { productId: item.productId };
      }
      const productId = newId();
      await db.batch([
        db.insert(products).values({ id: productId, userId, name }),
        db.update(storeItems).set({ productId, linkSource: 'user' }).where(eq(storeItems.id, item.id)),
      ]);
      return { productId };
    },

    /**
     * CA5.7: agrega el código de barras a un producto, o a un ítem sin producto, ya creados.
     * No toca `store_items.code`: ese es el código que imprime la tienda (§10.2).
     */
    async setBarcode(target: HistoryTarget, rawCode: string): Promise<SetBarcodeResult> {
      const gtin = normalizeGtin(rawCode.trim(), 'gtin');
      if (!gtin) return { ok: false, error: 'invalid_code' };

      const item = 'itemId' in target ? await ownItem(target.itemId) : null;
      if ('itemId' in target && !item) return { ok: false, error: 'not_found' };
      const productId = 'productId' in target ? target.productId : item!.productId;
      const product = productId ? await ownProduct(productId) : null;
      if ('productId' in target && !product) return { ok: false, error: 'not_found' };

      const holder = await db.query.products.findFirst({
        where: and(eq(products.userId, userId), eq(products.gtin, gtin)),
        columns: { id: true, name: true },
      });

      if (product) {
        if (product.gtin === gtin) return { ok: true, productId: product.id };
        if (product.gtin) return { ok: false, error: 'has_code' };
        // Dos productos no se fusionan solos: el usuario los vincula (F5).
        if (holder) return { ok: false, error: 'in_use', productId: holder.id, name: holder.name };
        await db.update(products).set({ gtin }).where(eq(products.id, product.id));
        return { ok: true, productId: product.id };
      }

      // Ítem sin producto: se vincula al que ya tiene ese código, o se crea uno con su descripción.
      const linkedTo = holder?.id ?? newId();
      const statements: BatchItem<'sqlite'>[] = [];
      if (!holder) statements.push(db.insert(products).values({ id: linkedTo, userId, name: item!.description, gtin }));
      statements.push(db.update(storeItems).set({ productId: linkedTo, linkSource: 'user' }).where(eq(storeItems.id, item!.id)));
      await runBatch(db, statements);
      await inferQuantities();
      return { ok: true, productId: linkedTo };
    },

    /**
     * CA5.2: vincula un ítem (o todos los ítems de su producto) a otro producto.
     * Devuelve false si alguno no es del usuario.
     */
    async link(itemId: string, productId: string): Promise<boolean> {
      const [item, product] = await Promise.all([ownItem(itemId), ownProduct(productId)]);
      if (!item || !product) return false;
      const moved = item.productId
        ? and(eq(storeItems.userId, userId), eq(storeItems.productId, item.productId))
        : eq(storeItems.id, item.id);
      await db.update(storeItems).set({ productId: product.id, linkSource: 'user' }).where(moved);
      await deleteOrphanProducts();
      await inferQuantities();
      return true;
    },

    /** Desvincula un ítem; queda marcado para que el GTIN no lo vuelva a vincular. */
    async unlink(itemId: string): Promise<boolean> {
      const item = await ownItem(itemId);
      if (!item) return false;
      await db.update(storeItems).set({ productId: null, linkSource: 'user' }).where(eq(storeItems.id, item.id));
      await deleteOrphanProducts();
      return true;
    },

    /**
     * Corrige si un ítem se vende por peso (p. ej. un PLU que en realidad es por unidad).
     * Las líneas sin corregir de ese ítem vuelven a la cantidad de la factura.
     */
    async setWeighed(itemId: string, isWeighed: boolean): Promise<boolean> {
      const item = await ownItem(itemId);
      if (!item) return false;
      await db.batch([
        db.update(storeItems).set({ isWeighed, weighedByUser: isWeighed }).where(eq(storeItems.id, item.id)),
        db
          .update(purchaseLines)
          .set({ quantity: 1, quantitySource: 'invoice' })
          .where(and(eq(purchaseLines.storeItemId, item.id), eq(purchaseLines.quantitySource, 'inferred'))),
      ]);
      await inferQuantities();
      return true;
    },

    /** CA5.5: corrige la cantidad (o el peso) de una línea; los montos no cambian. */
    async setLineQuantity(lineId: string, quantity: number): Promise<boolean> {
      const [line] = await db
        .select({ id: purchaseLines.id })
        .from(purchaseLines)
        .innerJoin(purchases, eq(purchases.id, purchaseLines.purchaseId))
        .where(and(eq(purchaseLines.id, lineId), eq(purchases.userId, userId)));
      if (!line) return false;
      await db
        .update(purchaseLines)
        .set({ quantity, quantitySource: 'user' })
        .where(eq(purchaseLines.id, line.id));
      // Un precio unitario nuevo puede resolver otras líneas del mismo producto.
      await inferQuantities();
      return true;
    },

    /**
     * CA5.4 y §10.2/§10.6: nombre visible y formatos de una tienda. Las tiendas son
     * compartidas; solo puede editarlas quien tiene compras ahí.
     */
    async updateStore(
      storeId: string,
      changes: { displayName?: string | null; codeFormat?: CodeFormat; quantities?: StoreQuantities },
    ): Promise<boolean> {
      const [shopped] = await db
        .select({ id: purchases.id })
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.storeId, storeId)))
        .limit(1);
      if (!shopped) return false;

      const configures = changes.codeFormat !== undefined || changes.quantities !== undefined;
      await db
        .update(stores)
        .set({ ...changes, ...(configures ? { configuredByUser: true } : {}) })
        .where(eq(stores.id, storeId));
      if (configures) {
        // §10.2: al cambiar el formato se recalculan los vínculos automáticos.
        await reindexItems(storeId);
        if (changes.quantities === 'reliable') {
          await db
            .update(purchaseLines)
            .set({ quantity: 1, quantitySource: 'invoice' })
            .where(
              and(
                eq(purchaseLines.quantitySource, 'inferred'),
                inArray(
                  purchaseLines.purchaseId,
                  db
                    .select({ id: purchases.id })
                    .from(purchases)
                    .where(and(eq(purchases.userId, userId), eq(purchases.storeId, storeId))),
                ),
              ),
            );
        }
        await inferQuantities();
      }
      return true;
    },

    async getStore(storeId: string) {
      const [shopped] = await db
        .select({ id: purchases.id })
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.storeId, storeId)))
        .limit(1);
      if (!shopped) return null;
      return db.query.stores.findFirst({
        where: eq(stores.id, storeId),
        columns: {
          id: true,
          ruc: true,
          legalName: true,
          displayName: true,
          codeFormat: true,
          quantities: true,
          configuredByUser: true,
        },
      });
    },
  };

  function resultColumns() {
    return {
      itemId: storeItems.id,
      description: storeItems.description,
      productId: products.id,
      productName: products.name,
      storeName: sql<string>`coalesce(${stores.displayName}, ${stores.legalName})`,
      lastPurchasedAt: sql<string | null>`(
        select max(${purchases.issuedAt}) from ${purchaseLines}
        inner join ${purchases} on ${purchases.id} = ${purchaseLines.purchaseId}
        where ${purchaseLines.storeItemId} = ${storeItems.id} and ${purchases.userId} = ${userId}
      )`,
    };
  }
}

type ResultRow = {
  itemId: string;
  description: string;
  productId: string | null;
  productName: string | null;
  storeName: string;
  lastPurchasedAt: string | null;
};

/** Agrupa los ítems por producto; los no vinculados van solos. Recientes primero. */
function groupResults(rows: ResultRow[]): SearchResult[] {
  const groups = new Map<string, SearchResult>();
  for (const row of rows) {
    const key = row.productId ? `p:${row.productId}` : `i:${row.itemId}`;
    const group = groups.get(key) ?? {
      kind: row.productId ? ('product' as const) : ('item' as const),
      id: row.productId ?? row.itemId,
      name: row.productName ?? row.description,
      storeNames: [],
      lastPurchasedAt: null,
    };
    if (!group.storeNames.includes(row.storeName)) group.storeNames.push(row.storeName);
    if (row.lastPurchasedAt && (!group.lastPurchasedAt || row.lastPurchasedAt > group.lastPurchasedAt)) {
      group.lastPurchasedAt = row.lastPurchasedAt;
    }
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => (b.lastPurchasedAt ?? '').localeCompare(a.lastPurchasedAt ?? ''))
    .slice(0, 30);
}
