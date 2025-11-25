/**
 * Phase 5.4: Migration Validation Script
 *
 * Validates that data was correctly migrated from ThriftyTracker to Prexiopá.
 *
 * Usage: npx ts-node scripts/migration/4-validate-migration.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  check: string;
  status: "pass" | "fail" | "warn";
  expected?: number | string;
  actual?: number | string;
  message?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const readTransformedFile = <T>(filename: string): T[] => {
  const filepath = path.join(__dirname, "data/transformed", filename);
  if (!fs.existsSync(filepath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
};

const formatResult = (result: ValidationResult): string => {
  const icon =
    result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️";
  let line = `${icon} ${result.check}`;

  if (result.expected !== undefined && result.actual !== undefined) {
    line += ` (expected: ${result.expected}, actual: ${result.actual})`;
  }

  if (result.message) {
    line += ` - ${result.message}`;
  }

  return line;
};

// ============================================================================
// Validation Checks
// ============================================================================

const validateRecordCounts = async (
  supabase: ReturnType<typeof createClient>
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];

  // Read transformed data counts
  const expectedCategories = readTransformedFile("categories.json").length;
  const expectedStores = readTransformedFile("stores.json").length;
  const expectedProducts = readTransformedFile("products.json").length;
  const expectedPrices = readTransformedFile("prices.json").length;

  // Check categories
  const { count: actualCategories } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  results.push({
    check: "Categories count",
    status: actualCategories === expectedCategories ? "pass" : "fail",
    expected: expectedCategories,
    actual: actualCategories || 0,
  });

  // Check stores
  const { count: actualStores } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true });

  results.push({
    check: "Stores count",
    status: actualStores === expectedStores ? "pass" : "fail",
    expected: expectedStores,
    actual: actualStores || 0,
  });

  // Check products
  const { count: actualProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  results.push({
    check: "Products count",
    status: actualProducts === expectedProducts ? "pass" : "fail",
    expected: expectedProducts,
    actual: actualProducts || 0,
  });

  // Check prices
  const { count: actualPrices } = await supabase
    .from("prices")
    .select("*", { count: "exact", head: true });

  results.push({
    check: "Prices count",
    status: actualPrices === expectedPrices ? "pass" : "fail",
    expected: expectedPrices,
    actual: actualPrices || 0,
  });

  return results;
};

const validateForeignKeys = async (
  supabase: ReturnType<typeof createClient>
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];

  // Check products with invalid category_id
  const { data: orphanProducts } = await supabase
    .from("products")
    .select("id, category_id")
    .not("category_id", "is", null);

  if (orphanProducts) {
    const categoryIds = new Set(
      (await supabase.from("categories").select("id")).data?.map((c) => c.id) ||
        []
    );

    const invalidCategories = orphanProducts.filter(
      (p) => p.category_id && !categoryIds.has(p.category_id)
    );

    results.push({
      check: "Products with valid category_id",
      status: invalidCategories.length === 0 ? "pass" : "fail",
      expected: 0,
      actual: invalidCategories.length,
      message:
        invalidCategories.length > 0
          ? `${invalidCategories.length} products have invalid category references`
          : undefined,
    });
  }

  // Check prices with invalid product_id
  const { data: prices } = await supabase.from("prices").select("id, product_id");

  if (prices) {
    const productIds = new Set(
      (await supabase.from("products").select("id")).data?.map((p) => p.id) || []
    );

    const invalidProducts = prices.filter((p) => !productIds.has(p.product_id));

    results.push({
      check: "Prices with valid product_id",
      status: invalidProducts.length === 0 ? "pass" : "fail",
      expected: 0,
      actual: invalidProducts.length,
      message:
        invalidProducts.length > 0
          ? `${invalidProducts.length} prices have invalid product references`
          : undefined,
    });
  }

  // Check prices with invalid store_id
  if (prices) {
    const storeIds = new Set(
      (await supabase.from("stores").select("id")).data?.map((s) => s.id) || []
    );

    const { data: pricesWithStore } = await supabase
      .from("prices")
      .select("id, store_id");

    const invalidStores = (pricesWithStore || []).filter(
      (p) => !storeIds.has(p.store_id)
    );

    results.push({
      check: "Prices with valid store_id",
      status: invalidStores.length === 0 ? "pass" : "fail",
      expected: 0,
      actual: invalidStores.length,
      message:
        invalidStores.length > 0
          ? `${invalidStores.length} prices have invalid store references`
          : undefined,
    });
  }

  return results;
};

const validateDataIntegrity = async (
  supabase: ReturnType<typeof createClient>
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];

  // Check for products with empty names
  const { count: emptyNameProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .or("name.is.null,name.eq.");

  results.push({
    check: "Products with valid names",
    status: emptyNameProducts === 0 ? "pass" : "fail",
    expected: 0,
    actual: emptyNameProducts || 0,
    message: emptyNameProducts ? `${emptyNameProducts} products have empty names` : undefined,
  });

  // Check for prices with zero or negative values
  const { count: invalidPrices } = await supabase
    .from("prices")
    .select("*", { count: "exact", head: true })
    .lte("price", 0);

  results.push({
    check: "Prices with valid amounts",
    status: invalidPrices === 0 ? "pass" : "warn",
    expected: 0,
    actual: invalidPrices || 0,
    message:
      invalidPrices ? `${invalidPrices} prices have zero or negative values` : undefined,
  });

  // Check for stores with empty names
  const { count: emptyNameStores } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .or("name.is.null,name.eq.");

  results.push({
    check: "Stores with valid names",
    status: emptyNameStores === 0 ? "pass" : "fail",
    expected: 0,
    actual: emptyNameStores || 0,
    message: emptyNameStores ? `${emptyNameStores} stores have empty names` : undefined,
  });

  return results;
};

const validateSampleData = async (
  supabase: ReturnType<typeof createClient>
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];

  // Sample product check
  const { data: sampleProduct } = await supabase
    .from("products")
    .select("*")
    .limit(1)
    .single();

  if (sampleProduct) {
    results.push({
      check: "Sample product retrievable",
      status: "pass",
      message: `Sample: "${sampleProduct.name}"`,
    });
  } else {
    results.push({
      check: "Sample product retrievable",
      status: "fail",
      message: "Could not retrieve any products",
    });
  }

  // Sample price with product join
  const { data: samplePrice } = await supabase
    .from("prices")
    .select(
      `
      *,
      product:products(name),
      store:stores(name)
    `
    )
    .limit(1)
    .single();

  if (samplePrice && samplePrice.product && samplePrice.store) {
    results.push({
      check: "Price joins working",
      status: "pass",
      message: `Sample: $${samplePrice.price} for "${(samplePrice.product as Record<string, string>).name}" at "${(samplePrice.store as Record<string, string>).name}"`,
    });
  } else {
    results.push({
      check: "Price joins working",
      status: samplePrice ? "warn" : "fail",
      message: "Could not retrieve price with product/store joins",
    });
  }

  return results;
};

// ============================================================================
// Main Validation Pipeline
// ============================================================================

const runValidation = async (): Promise<void> => {
  console.log("========================================");
  console.log("Phase 5.4: Migration Validation");
  console.log("========================================\n");

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: Missing Supabase credentials");
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const allResults: ValidationResult[] = [];

  // Run all validations
  console.log("Running validations...\n");

  console.log("1. Record Counts");
  console.log("-".repeat(40));
  const countResults = await validateRecordCounts(supabase);
  countResults.forEach((r) => console.log(formatResult(r)));
  allResults.push(...countResults);

  console.log("\n2. Foreign Key Integrity");
  console.log("-".repeat(40));
  const fkResults = await validateForeignKeys(supabase);
  fkResults.forEach((r) => console.log(formatResult(r)));
  allResults.push(...fkResults);

  console.log("\n3. Data Integrity");
  console.log("-".repeat(40));
  const integrityResults = await validateDataIntegrity(supabase);
  integrityResults.forEach((r) => console.log(formatResult(r)));
  allResults.push(...integrityResults);

  console.log("\n4. Sample Data Retrieval");
  console.log("-".repeat(40));
  const sampleResults = await validateSampleData(supabase);
  sampleResults.forEach((r) => console.log(formatResult(r)));
  allResults.push(...sampleResults);

  // Summary
  const passed = allResults.filter((r) => r.status === "pass").length;
  const failed = allResults.filter((r) => r.status === "fail").length;
  const warned = allResults.filter((r) => r.status === "warn").length;

  console.log("\n========================================");
  console.log("Validation Summary");
  console.log("========================================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`Total checks: ${allResults.length}`);

  if (failed === 0) {
    console.log("\n🎉 Migration validation successful!");
  } else {
    console.log("\n⚠️  Some validation checks failed. Review the results above.");
    process.exit(1);
  }
};

// Run validation
runValidation().catch(console.error);
