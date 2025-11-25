/**
 * Phase 5.4: Supabase Import Script
 *
 * Imports transformed data into Supabase PostgreSQL database.
 *
 * Usage: npx ts-node scripts/migration/3-import-to-supabase.ts
 *
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_KEY - Service role key (not anon key)
 */

import * as fs from "fs";
import * as path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const BATCH_SIZE = 100; // Number of records per insert batch
const DRY_RUN = process.argv.includes("--dry-run");

// ============================================================================
// Types
// ============================================================================

interface ImportStats {
  table: string;
  total: number;
  inserted: number;
  errors: number;
  skipped: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

const readTransformedFile = <T>(filename: string): T[] => {
  const filepath = path.join(__dirname, "data/transformed", filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
};

const writeLog = (filename: string, content: string): void => {
  const filepath = path.join(__dirname, "data/logs", filename);
  fs.appendFileSync(filepath, content + "\n");
};

const cleanMigrationMetadata = <T extends Record<string, unknown>>(
  records: T[]
): Omit<T, "_mongo_id" | "_original_description" | "_measurement_value" | "_unit_name" | "_mongo_item_id" | "_mongo_receipt_id">[] => {
  return records.map((record) => {
    const cleaned = { ...record };
    delete (cleaned as Record<string, unknown>)._mongo_id;
    delete (cleaned as Record<string, unknown>)._original_description;
    delete (cleaned as Record<string, unknown>)._measurement_value;
    delete (cleaned as Record<string, unknown>)._unit_name;
    delete (cleaned as Record<string, unknown>)._mongo_item_id;
    delete (cleaned as Record<string, unknown>)._mongo_receipt_id;
    return cleaned;
  });
};

// ============================================================================
// Import Functions
// ============================================================================

const importBatch = async <T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  records: T[],
  stats: ImportStats
): Promise<void> => {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${records.length} records`);
    stats.inserted += records.length;
    return;
  }

  const { error } = await supabase.from(table).insert(records);

  if (error) {
    console.error(`  Error inserting batch: ${error.message}`);
    writeLog(
      "import-errors.log",
      `${table}: ${error.message}\n${JSON.stringify(records.slice(0, 2), null, 2)}`
    );
    stats.errors += records.length;
  } else {
    stats.inserted += records.length;
  }
};

const importTable = async <T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  records: T[]
): Promise<ImportStats> => {
  const stats: ImportStats = {
    table,
    total: records.length,
    inserted: 0,
    errors: 0,
    skipped: 0,
  };

  if (records.length === 0) {
    console.log(`  No records to import for ${table}`);
    return stats;
  }

  // Clean migration metadata before import
  const cleanedRecords = cleanMigrationMetadata(records);

  console.log(`  Importing ${cleanedRecords.length} records in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < cleanedRecords.length; i += BATCH_SIZE) {
    const batch = cleanedRecords.slice(i, i + BATCH_SIZE);
    await importBatch(supabase, table, batch, stats);

    // Progress indicator
    const progress = Math.min(i + BATCH_SIZE, cleanedRecords.length);
    process.stdout.write(`\r  Progress: ${progress}/${cleanedRecords.length}`);
  }

  console.log(""); // New line after progress
  return stats;
};

const checkExistingData = async (
  supabase: SupabaseClient,
  table: string
): Promise<number> => {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.warn(`  Warning: Could not check ${table}: ${error.message}`);
    return 0;
  }

  return count || 0;
};

// ============================================================================
// Main Import Pipeline
// ============================================================================

const runImport = async (): Promise<void> => {
  console.log("========================================");
  console.log("Phase 5.4: Supabase Import");
  console.log("========================================\n");

  if (DRY_RUN) {
    console.log("*** DRY RUN MODE - No data will be inserted ***\n");
  }

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: Missing Supabase credentials");
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables");
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Clear previous error log
  const errorLogPath = path.join(__dirname, "data/logs/import-errors.log");
  if (fs.existsSync(errorLogPath)) {
    fs.unlinkSync(errorLogPath);
  }

  // Step 1: Read transformed data
  console.log("Step 1: Reading transformed data...");
  const categories = readTransformedFile<Record<string, unknown>>("categories.json");
  const stores = readTransformedFile<Record<string, unknown>>("stores.json");
  const products = readTransformedFile<Record<string, unknown>>("products.json");
  const prices = readTransformedFile<Record<string, unknown>>("prices.json");

  console.log(`  - Categories: ${categories.length}`);
  console.log(`  - Stores: ${stores.length}`);
  console.log(`  - Products: ${products.length}`);
  console.log(`  - Prices: ${prices.length}`);
  console.log("");

  // Step 2: Check existing data
  console.log("Step 2: Checking existing data...");
  const existingCategories = await checkExistingData(supabase, "categories");
  const existingStores = await checkExistingData(supabase, "stores");
  const existingProducts = await checkExistingData(supabase, "products");
  const existingPrices = await checkExistingData(supabase, "prices");

  console.log(`  - Existing categories: ${existingCategories}`);
  console.log(`  - Existing stores: ${existingStores}`);
  console.log(`  - Existing products: ${existingProducts}`);
  console.log(`  - Existing prices: ${existingPrices}`);

  if (existingProducts > 0 || existingPrices > 0) {
    console.log("\n  ⚠️  Warning: Database already contains data");
    console.log("  Consider running with --dry-run first or clearing tables");
    console.log("");
  }

  // Step 3: Import in order (respecting foreign keys)
  console.log("\nStep 3: Importing data...\n");

  const allStats: ImportStats[] = [];

  // Categories first (no dependencies)
  console.log("Importing categories...");
  allStats.push(await importTable(supabase, "categories", categories));

  // Stores (no dependencies)
  console.log("\nImporting stores...");
  allStats.push(await importTable(supabase, "stores", stores));

  // Products (depends on categories)
  console.log("\nImporting products...");
  allStats.push(await importTable(supabase, "products", products));

  // Prices (depends on products and stores)
  console.log("\nImporting prices...");
  allStats.push(await importTable(supabase, "prices", prices));

  // Step 4: Summary
  console.log("\n========================================");
  console.log("Import Complete!");
  console.log("========================================\n");

  console.log("Summary:");
  console.log("-".repeat(50));
  console.log(
    `${"Table".padEnd(15)} ${"Total".padEnd(10)} ${"Inserted".padEnd(10)} ${"Errors".padEnd(10)}`
  );
  console.log("-".repeat(50));

  let totalInserted = 0;
  let totalErrors = 0;

  allStats.forEach((stat) => {
    console.log(
      `${stat.table.padEnd(15)} ${String(stat.total).padEnd(10)} ${String(stat.inserted).padEnd(10)} ${String(stat.errors).padEnd(10)}`
    );
    totalInserted += stat.inserted;
    totalErrors += stat.errors;
  });

  console.log("-".repeat(50));
  console.log(
    `${"TOTAL".padEnd(15)} ${String(allStats.reduce((sum, s) => sum + s.total, 0)).padEnd(10)} ${String(totalInserted).padEnd(10)} ${String(totalErrors).padEnd(10)}`
  );

  if (totalErrors > 0) {
    console.log(`\n⚠️  ${totalErrors} errors occurred. Check data/logs/import-errors.log`);
  }

  if (DRY_RUN) {
    console.log("\n*** DRY RUN - No data was actually inserted ***");
  }

  console.log("\nNext step: Run validation:");
  console.log("  npx ts-node scripts/migration/4-validate-migration.ts");
};

// Run import
runImport().catch(console.error);
