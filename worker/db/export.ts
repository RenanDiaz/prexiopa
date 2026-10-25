import { asc, eq, sql } from 'drizzle-orm';
import type { LineExportRow, PurchaseExportRow } from '../export/csv';
import type { Db } from './client';
import { products, purchaseLines, purchases, storeItems, stores } from './schema';

// F8 — Datos para el export. Snapshot completo del usuario, sin paginar (CA8.1).
// Nunca selecciona raw_json (CA8.6).

const STORE_NAME = sql<string>`coalesce(${stores.displayName}, ${stores.legalName})`;

export function exportRepo(db: Db, userId: string) {
  return {
    /** Una fila por compra, de la más antigua a la más reciente (CA8.2). */
    purchases(): Promise<PurchaseExportRow[]> {
      return db
        .select({
          id: purchases.id,
          issuedAt: purchases.issuedAt,
          storeName: STORE_NAME,
          ruc: stores.ruc,
          branchAddress: purchases.branchAddress,
          source: purchases.source,
          subtotalCents: purchases.subtotalCents,
          taxCents: purchases.taxCents,
          discountCents: purchases.discountCents,
          totalCents: purchases.totalCents,
          paidCents: purchases.paidCents,
          cufe: purchases.cufe,
        })
        .from(purchases)
        .innerJoin(stores, eq(stores.id, purchases.storeId))
        .where(eq(purchases.userId, userId))
        .orderBy(asc(purchases.issuedAt), asc(purchases.id));
    },

    /** Una fila por línea, por fecha de la compra y luego número de línea (CA8.3). */
    lines(): Promise<LineExportRow[]> {
      return db
        .select({
          purchaseId: purchaseLines.purchaseId,
          lineNo: purchaseLines.lineNo,
          issuedAt: purchases.issuedAt,
          storeName: STORE_NAME,
          code: storeItems.code,
          description: purchaseLines.description,
          productName: products.name,
          quantity: purchaseLines.quantity,
          quantitySource: purchaseLines.quantitySource,
          storeQuantities: stores.quantities,
          isWeighed: storeItems.isWeighed,
          listPriceCents: purchaseLines.listPriceCents,
          discountCents: purchaseLines.discountCents,
          lineTotalCents: purchaseLines.lineTotalCents,
          taxRateBp: purchaseLines.taxRateBp,
          taxCents: purchaseLines.taxCents,
        })
        .from(purchaseLines)
        .innerJoin(purchases, eq(purchases.id, purchaseLines.purchaseId))
        .innerJoin(stores, eq(stores.id, purchases.storeId))
        .innerJoin(storeItems, eq(storeItems.id, purchaseLines.storeItemId))
        .leftJoin(products, eq(products.id, storeItems.productId))
        .where(eq(purchases.userId, userId))
        .orderBy(asc(purchases.issuedAt), asc(purchases.id), asc(purchaseLines.lineNo));
    },
  };
}
