import { relations } from 'drizzle-orm';
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
  /** Versión de las reglas de catálogo ya aplicadas a sus datos (vínculos, pesables, cantidades). */
  catalogVersion: integer('catalog_version').notNull().default(0),
  createdAt: createdAt(),
});

// Tablas de Better Auth (spec §6.2). Las fechas son timestamps en ms porque
// Better Auth lee y escribe Date. `users` sigue siendo la identidad de la app;
// se enlaza con `auth_users` por email.

const authTimestamp = (name: string) => integer(name, { mode: 'timestamp_ms' });

const authCreatedAt = () =>
  authTimestamp('created_at')
    .notNull()
    .$defaultFn(() => new Date());

const authUpdatedAt = () =>
  authTimestamp('updated_at')
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

export const authUsers = sqliteTable('auth_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: authCreatedAt(),
  updatedAt: authUpdatedAt(),
});

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: authTimestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: authCreatedAt(),
    updatedAt: authUpdatedAt(),
  },
  (t) => [index('auth_sessions_user_idx').on(t.userId)],
);

export const authAccounts = sqliteTable(
  'auth_accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: authTimestamp('access_token_expires_at'),
    refreshTokenExpiresAt: authTimestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: authCreatedAt(),
    updatedAt: authUpdatedAt(),
  },
  (t) => [index('auth_accounts_user_idx').on(t.userId)],
);

export const authVerifications = sqliteTable(
  'auth_verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: authTimestamp('expires_at').notNull(),
    createdAt: authCreatedAt(),
    updatedAt: authUpdatedAt(),
  },
  (t) => [index('auth_verifications_identifier_idx').on(t.identifier)],
);

export const CODE_FORMATS = ['gtin', 'gtin_no_check', 'internal'] as const;
export const STORE_QUANTITIES = ['reliable', 'always_one'] as const;
export const LINK_SOURCES = ['auto', 'user'] as const;
export const QUANTITY_SOURCES = ['invoice', 'inferred', 'user'] as const;

// Una fila por cadena (RUC), no por sucursal. Las tiendas no son datos del usuario.
export const stores = sqliteTable('stores', {
  id: id(),
  ruc: text('ruc').unique(),
  dv: text('dv'),
  legalName: text('legal_name').notNull(),
  displayName: text('display_name'),
  codeFormat: text('code_format', { enum: CODE_FORMATS }).notNull().default('internal'),
  /** Si la cadena manda la cantidad real o siempre 1 (spec §10.6). */
  quantities: text('quantities', { enum: STORE_QUANTITIES }).notNull().default('reliable'),
  /** Si el usuario corrigió code_format o quantities: la detección automática ya no los cambia. */
  configuredByUser: integer('configured_by_user', { mode: 'boolean' }).notNull().default(false),
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
    /** Quién hizo el vínculo con `products`: el GTIN (auto) o el usuario (F5). */
    linkSource: text('link_source', { enum: LINK_SOURCES }),
    isWeighed: integer('is_weighed', { mode: 'boolean' }).notNull().default(false),
    /** Corrección del usuario a `is_weighed` (p. ej. un PLU que se vende por unidad); null = automático. */
    weighedByUser: integer('weighed_by_user', { mode: 'boolean' }),
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
    /** De dónde sale `quantity` (spec §10.6). */
    quantitySource: text('quantity_source', { enum: QUANTITY_SOURCES }).notNull().default('invoice'),
  },
  (t) => [
    index('purchase_lines_purchase_idx').on(t.purchaseId),
    index('purchase_lines_store_item_idx').on(t.storeItemId),
  ],
);

// Relaciones para `db.query` (no generan SQL ni migraciones).
export const purchasesRelations = relations(purchases, ({ one }) => ({
  store: one(stores, { fields: [purchases.storeId], references: [stores.id] }),
}));

export const storeItemsRelations = relations(storeItems, ({ one }) => ({
  store: one(stores, { fields: [storeItems.storeId], references: [stores.id] }),
  product: one(products, { fields: [storeItems.productId], references: [products.id] }),
}));
