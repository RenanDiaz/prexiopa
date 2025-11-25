# Phase 5.4: Data Migration from ThriftyTracker

This directory contains scripts to migrate data from the old ThriftyTracker MongoDB database to the new Prexiopá PostgreSQL (Supabase) database.

## Overview

The migration process consists of 4 steps:

1. **Export** - Export MongoDB collections to JSON files
2. **Transform** - Convert MongoDB format to PostgreSQL format
3. **Import** - Load transformed data into Supabase
4. **Validate** - Verify data integrity after migration

## Prerequisites

- Node.js 18+
- MongoDB tools (for `mongoexport`)
- Access to ThriftyTracker MongoDB database
- Supabase project with schema deployed

### Install Dependencies

```bash
npm install uuid @types/uuid dotenv @supabase/supabase-js
```

## Directory Structure

```
scripts/migration/
├── data/
│   ├── export/        # MongoDB JSON exports go here
│   ├── transformed/   # Transformed PostgreSQL-ready JSON
│   └── logs/          # Error and skip logs
├── 1-export-mongodb.md     # Export instructions
├── 2-transform-data.ts     # Transformation script
├── 3-import-to-supabase.ts # Import script
├── 4-validate-migration.ts # Validation script
└── README.md               # This file
```

## Step-by-Step Guide

### Step 1: Export MongoDB Data

Follow the instructions in `1-export-mongodb.md` to export your MongoDB collections.

Expected files in `data/export/`:
- `products.json`
- `stores.json`
- `categories.json`
- `units.json`
- `receipts.json`
- `items.json`

### Step 2: Transform Data

Transform MongoDB data to PostgreSQL format:

```bash
npx ts-node scripts/migration/2-transform-data.ts
```

This creates files in `data/transformed/`:
- `categories.json`
- `stores.json`
- `products.json`
- `prices.json`
- `id-mappings.json` (MongoDB to PostgreSQL ID mappings)

### Step 3: Import to Supabase

Set environment variables:

```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-service-role-key"
```

Run a dry-run first:

```bash
npx ts-node scripts/migration/3-import-to-supabase.ts --dry-run
```

Then run the actual import:

```bash
npx ts-node scripts/migration/3-import-to-supabase.ts
```

### Step 4: Validate Migration

Verify the migration was successful:

```bash
npx ts-node scripts/migration/4-validate-migration.ts
```

## Data Transformations

### Products

MongoDB:
```json
{
  "_id": "...",
  "description": "Leche Evaporada",
  "unit": "objectId-ref",
  "measurementValue": 410,
  "barcode": "123456"
}
```

PostgreSQL:
```json
{
  "id": "uuid",
  "name": "Leche Evaporada 410 ml",
  "barcode": "123456"
}
```

### Prices

MongoDB Items + Receipts are combined:
```json
{
  "id": "uuid",
  "product_id": "product-uuid",
  "store_id": "store-uuid",
  "price": 2.50,
  "quantity": 1,
  "created_at": "receipt-purchase-date"
}
```

## Troubleshooting

### Missing Foreign Keys

If products reference categories that weren't exported, they'll have `category_id: null`.

### Skipped Items

Items without valid product or store references are logged to `data/logs/skipped-items.log`.

### Import Errors

Batch insert errors are logged to `data/logs/import-errors.log`.

## Rollback

To rollback the migration, you can truncate the imported tables:

```sql
-- WARNING: This will delete ALL data in these tables
TRUNCATE TABLE prices CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE stores CASCADE;
TRUNCATE TABLE categories CASCADE;
```

## Notes

- The migration preserves MongoDB IDs in the transformed JSON for reference
- These metadata fields are stripped before import to Supabase
- Historical price data from ThriftyTracker becomes verified price history in Prexiopá
