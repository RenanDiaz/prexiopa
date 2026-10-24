import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { newId } from '../lib/id';

// Modelo de datos: docs/specs/prexiopa-lite.md §5 y §10.
// Dinero siempre en centavos enteros (*_cents). Fechas en ISO-8601 UTC.

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => newId());

const createdAt = () =>
  text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString());

export const users = sqliteTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  createdAt: createdAt(),
});

export const CODE_FORMATS = ['gtin', 'gtin_no_check', 'internal'] as const;

// Una fila por cadena (RUC), no por sucursal. Las tiendas no son datos del usuario.
export const stores = sqliteTable('stores', {
  id: id(),
  ruc: text('ruc').unique(),
  dv: text('dv'),
  legalName: text('legal_name').notNull(),
  displayName: text('display_name'),
  codeFormat: text('code_format', { enum: CODE_FORMATS }).notNull().default('internal'),
  createdAt: createdAt(),
});

export const products = sqliteTable(
  'products',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    gtin: text('gtin'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('products_user_gtin_uq').on(t.userId, t.gtin)],
);

export const storeItems = sqliteTable(
  'store_items',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id),
    code: text('code'),
    description: text('description').notNull(),
    productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('store_items_user_store_code_uq').on(t.userId, t.storeId, t.code),
    index('store_items_product_idx').on(t.productId),
  ],
);

export const PURCHASE_SOURCES = ['cafe', 'manual'] as const;

export const purchases = sqliteTable(
  'purchases',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id),
    source: text('source', { enum: PURCHASE_SOURCES }).notNull(),
    cufe: text('cufe'),
    issuedAt: text('issued_at').notNull(),
    branchAddress: text('branch_address'),
    subtotalCents: integer('subtotal_cents').notNull(),
    taxCents: integer('tax_cents').notNull().default(0),
    discountCents: integer('discount_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    paidCents: integer('paid_cents'),
    sourceUrl: text('source_url'),
    rawJson: text('raw_json'),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('purchases_user_cufe_uq').on(t.userId, t.cufe),
    index('purchases_user_issued_idx').on(t.userId, t.issuedAt),
  ],
);

export const purchaseLines = sqliteTable(
  'purchase_lines',
  {
    id: id(),
    purchaseId: text('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),
    lineNo: integer('line_no').notNull(),
    storeItemId: text('store_item_id')
      .notNull()
      .references(() => storeItems.id),
    description: text('description').notNull(),
    quantity: real('quantity').notNull(),
    listPriceCents: integer('list_price_cents').notNull(),
    discountCents: integer('discount_cents').notNull().default(0),
    lineTotalCents: integer('line_total_cents').notNull(),
    taxRateBp: integer('tax_rate_bp').notNull().default(0),
    taxCents: integer('tax_cents').notNull().default(0),
  },
  (t) => [
    index('purchase_lines_purchase_idx').on(t.purchaseId),
    index('purchase_lines_store_item_idx').on(t.storeItemId),
  ],
);
