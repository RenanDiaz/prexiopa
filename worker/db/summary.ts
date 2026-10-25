import { and, desc, eq, gte, sql } from 'drizzle-orm';
import type { Db } from './client';
import { purchases, stores } from './schema';

// F6 — Resumen mensual (CA6.1). Los meses se cuentan en hora de Panamá (UTC-5).

const PANAMA_MONTH = sql<string>`strftime('%Y-%m', ${purchases.issuedAt}, '-5 hours')`;

/** "2026-10" en Panamá para `now`, y el primer día (UTC) de 11 meses antes. */
function panamaMonths(now: Date) {
  const local = new Date(now.getTime() - 5 * 3_600_000);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const key = (y: number, m: number) => {
    const d = new Date(Date.UTC(y, m, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  };
  const months = Array.from({ length: 12 }, (_, i) => key(year, month - 11 + i));
  // 1 de ese mes a las 00:00 de Panamá = 05:00 UTC.
  const since = new Date(Date.UTC(year, month - 11, 1, 5)).toISOString();
  return { months, current: months[11]!, since };
}

export function summaryRepo(db: Db, userId: string) {
  return {
    async monthly(now = new Date()) {
      const { months, current, since } = panamaMonths(now);
      const rows = await db
        .select({ month: PANAMA_MONTH, totalCents: sql<number>`sum(${purchases.totalCents})`, count: sql<number>`count(*)` })
        .from(purchases)
        .where(and(eq(purchases.userId, userId), gte(purchases.issuedAt, since)))
        .groupBy(PANAMA_MONTH);
      const byMonth = new Map(rows.map((row) => [row.month, row]));

      const byStore = await db
        .select({
          storeId: stores.id,
          storeName: sql<string>`coalesce(${stores.displayName}, ${stores.legalName})`,
          totalCents: sql<number>`sum(${purchases.totalCents})`,
          count: sql<number>`count(*)`,
        })
        .from(purchases)
        .innerJoin(stores, eq(stores.id, purchases.storeId))
        .where(and(eq(purchases.userId, userId), sql`${PANAMA_MONTH} = ${current}`))
        .groupBy(stores.id)
        .orderBy(desc(sql`sum(${purchases.totalCents})`));

      return {
        months: months.map((month) => ({
          month,
          totalCents: byMonth.get(month)?.totalCents ?? 0,
          count: byMonth.get(month)?.count ?? 0,
        })),
        currentMonth: current,
        byStore,
      };
    },
  };
}
