import { and, count, desc, eq } from 'drizzle-orm';
import { getDb } from './client';
import { purchaseLines, purchases, stores } from './schema';

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

export function scoped(d1: D1Database, userId: string) {
  const db = getDb(d1);
  const ownPurchase = (id: string) => and(eq(purchases.id, id), eq(purchases.userId, userId));

  return {
    purchases: {
      async list(limit = 50): Promise<PurchaseSummary[]> {
        return db
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
          .where(eq(purchases.userId, userId))
          .groupBy(purchases.id)
          .orderBy(desc(purchases.issuedAt))
          .limit(limit)
          .then((rows) =>
            rows.map(({ displayName, ...row }) => ({ ...row, storeName: displayName ?? row.storeName })),
          );
      },

      async get(id: string) {
        const purchase = await db.query.purchases.findFirst({
          where: ownPurchase(id),
          columns: { rawJson: false, userId: false },
        });
        if (!purchase) return null;
        const lines = await db
          .select()
          .from(purchaseLines)
          .where(eq(purchaseLines.purchaseId, purchase.id))
          .orderBy(purchaseLines.lineNo);
        return { ...purchase, lines };
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
