/**
 * Phase 5.4: Data Transformation Script
 *
 * Transforms ThriftyTracker MongoDB exports to Prexiopá PostgreSQL format.
 *
 * Usage: npx ts-node scripts/migration/2-transform-data.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types - MongoDB Source (ThriftyTracker)
// ============================================================================

interface MongoObjectId {
  $oid: string;
}

interface MongoDate {
  $date: string;
}

interface MongoProduct {
  _id: MongoObjectId;
  description: string;
  unit: MongoObjectId;
  measurementValue: number;
  barcode?: string;
  tax?: number;
  categories?: MongoObjectId[];
  isActive?: boolean;
  createdAt?: MongoDate;
  updatedAt?: MongoDate;
}

interface MongoStore {
  _id: MongoObjectId;
  name: string;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  isActive?: boolean;
}

interface MongoCategory {
  _id: MongoObjectId;
  name: string;
  parent?: MongoObjectId;
  isActive?: boolean;
}

interface MongoUnit {
  _id: MongoObjectId;
  name: string;
  abbreviation: string;
  type?: string;
}

interface MongoReceipt {
  _id: MongoObjectId;
  store: MongoObjectId;
  purchaseDate: MongoDate;
  user?: MongoObjectId;
  total?: number;
  createdAt?: MongoDate;
}

interface MongoItem {
  _id: MongoObjectId;
  product: MongoObjectId;
  receipt: MongoObjectId;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  discount?: number;
  createdAt?: MongoDate;
}

// ============================================================================
// Types - PostgreSQL Target (Prexiopá)
// Matches the actual schema in supabase/schema.sql
// ============================================================================

interface PgProduct {
  id: string;
  name: string;
  description: string | null;
  image: string;
  category: string;
  brand: string | null;
  barcode: string | null;
  created_at: string;
  updated_at: string;
  // Migration metadata
  _mongo_id: string;
}

interface PgStore {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  created_at: string;
  updated_at: string;
  // Migration metadata
  _mongo_id: string;
}

interface PgPrice {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  date: string;
  in_stock: boolean;
  created_at: string;
  // Migration metadata
  _mongo_item_id: string;
  _mongo_receipt_id: string;
}

// ============================================================================
// ID Mapping Tables
// ============================================================================

const idMappings = {
  products: new Map<string, string>(),
  stores: new Map<string, string>(),
  categories: new Map<string, string>(),
  units: new Map<string, string>(),
  receipts: new Map<string, string>(),
};

// ============================================================================
// Helper Functions
// ============================================================================

const getMongoId = (obj: MongoObjectId | string): string => {
  if (typeof obj === "string") return obj;
  return obj.$oid;
};

const getMongoDate = (date: MongoDate | string | undefined): string => {
  if (!date) return new Date().toISOString();
  if (typeof date === "string") return date;
  return date.$date;
};

const readJsonFile = <T>(filename: string): T[] => {
  const filepath = path.join(__dirname, "data/export", filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found, skipping...`);
    return [];
  }
  const content = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(content);
};

const writeJsonFile = (filename: string, data: unknown): void => {
  const filepath = path.join(__dirname, "data/transformed", filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Written: ${filename} (${Array.isArray(data) ? data.length : 1} records)`);
};

const writeLog = (filename: string, content: string): void => {
  const filepath = path.join(__dirname, "data/logs", filename);
  fs.writeFileSync(filepath, content);
  console.log(`Log written: ${filename}`);
};

// ============================================================================
// Transformation Functions
// ============================================================================

const transformUnits = (units: MongoUnit[]): Map<string, string> => {
  const unitMap = new Map<string, string>();

  units.forEach((unit) => {
    const mongoId = getMongoId(unit._id);
    // Store unit name for product name generation
    unitMap.set(mongoId, unit.abbreviation || unit.name);
    idMappings.units.set(mongoId, unit.abbreviation || unit.name);
  });

  console.log(`Processed ${units.length} units`);
  return unitMap;
};

const transformCategories = (categories: MongoCategory[]): Map<string, string> => {
  // No categories table in current schema - just build mapping for product category names
  const categoryNameMap = new Map<string, string>();

  categories.forEach((cat) => {
    const mongoId = getMongoId(cat._id);
    categoryNameMap.set(mongoId, cat.name);
    idMappings.categories.set(mongoId, cat.name);
  });

  console.log(`Processed ${categories.length} categories (for product category names)`);
  return categoryNameMap;
};

const transformStores = (stores: MongoStore[]): PgStore[] => {
  return stores.map((store) => {
    const mongoId = getMongoId(store._id);
    const newId = uuidv4();
    idMappings.stores.set(mongoId, newId);

    return {
      id: newId,
      name: store.name,
      logo: "/images/stores/default.png", // Default logo
      website: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _mongo_id: mongoId,
    };
  });
};

const transformProducts = (
  products: MongoProduct[],
  unitMap: Map<string, string>,
  categoryMap: Map<string, string>
): PgProduct[] => {
  return products.map((product) => {
    const mongoId = getMongoId(product._id);
    const newId = uuidv4();
    idMappings.products.set(mongoId, newId);

    // Get unit abbreviation
    const unitMongoId = getMongoId(product.unit);
    const unitAbbrev = unitMap.get(unitMongoId) || "und";

    // Build product name: "Description MeasurementValue Unit"
    // e.g., "Leche Evaporada 410 ml"
    const measurementPart =
      product.measurementValue > 0
        ? ` ${product.measurementValue} ${unitAbbrev}`
        : "";
    const productName = `${product.description}${measurementPart}`;

    // Get first category name if exists
    let categoryName = "General";
    if (product.categories && product.categories.length > 0) {
      const catMongoId = getMongoId(product.categories[0]);
      categoryName = categoryMap.get(catMongoId) || "General";
    }

    return {
      id: newId,
      name: productName,
      description: null,
      image: "/images/products/default.png", // Default image
      category: categoryName,
      brand: null,
      barcode: product.barcode || null,
      created_at: getMongoDate(product.createdAt),
      updated_at: getMongoDate(product.updatedAt),
      _mongo_id: mongoId,
    };
  });
};

const transformPrices = (
  items: MongoItem[],
  receipts: MongoReceipt[]
): PgPrice[] => {
  // Build receipt -> store mapping and receipt -> date mapping
  const receiptStoreMap = new Map<string, string>();
  const receiptDateMap = new Map<string, string>();

  receipts.forEach((receipt) => {
    const receiptId = getMongoId(receipt._id);
    const storeMongoId = getMongoId(receipt.store);
    const storeId = idMappings.stores.get(storeMongoId);

    if (storeId) {
      receiptStoreMap.set(receiptId, storeId);
    }
    // Extract just the date part (YYYY-MM-DD) from the purchase date
    const fullDate = getMongoDate(receipt.purchaseDate);
    const dateOnly = fullDate.split("T")[0];
    receiptDateMap.set(receiptId, dateOnly);

    // Store receipt mapping for reference
    idMappings.receipts.set(receiptId, uuidv4());
  });

  const transformed: PgPrice[] = [];
  const skipped: string[] = [];
  // Track unique product+store+date combinations to avoid duplicates
  const seenKeys = new Set<string>();

  items.forEach((item) => {
    const productMongoId = getMongoId(item.product);
    const receiptMongoId = getMongoId(item.receipt);

    const productId = idMappings.products.get(productMongoId);
    const storeId = receiptStoreMap.get(receiptMongoId);
    const purchaseDate = receiptDateMap.get(receiptMongoId);

    if (!productId || !storeId || !purchaseDate) {
      skipped.push(
        `Item ${getMongoId(item._id)}: missing product (${productMongoId}) or store`
      );
      return;
    }

    // Check for duplicates (same product+store+date)
    const uniqueKey = `${productId}-${storeId}-${purchaseDate}`;
    if (seenKeys.has(uniqueKey)) {
      skipped.push(
        `Item ${getMongoId(item._id)}: duplicate product+store+date`
      );
      return;
    }
    seenKeys.add(uniqueKey);

    transformed.push({
      id: uuidv4(),
      product_id: productId,
      store_id: storeId,
      price: item.unitPrice,
      date: purchaseDate,
      in_stock: true,
      created_at: new Date().toISOString(),
      _mongo_item_id: getMongoId(item._id),
      _mongo_receipt_id: receiptMongoId,
    });
  });

  if (skipped.length > 0) {
    writeLog("skipped-items.log", skipped.join("\n"));
  }

  return transformed;
};

// ============================================================================
// Main Transformation Pipeline
// ============================================================================

const runTransformation = (): void => {
  console.log("========================================");
  console.log("Phase 5.4: Data Transformation");
  console.log("========================================\n");

  // Ensure output directories exist
  const transformedDir = path.join(__dirname, "data/transformed");
  const logsDir = path.join(__dirname, "data/logs");

  if (!fs.existsSync(transformedDir)) {
    fs.mkdirSync(transformedDir, { recursive: true });
  }
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Step 1: Read all source data
  console.log("Step 1: Reading source data...");
  const units = readJsonFile<MongoUnit>("units.json");
  const categories = readJsonFile<MongoCategory>("categories.json");
  const stores = readJsonFile<MongoStore>("stores.json");
  const products = readJsonFile<MongoProduct>("products.json");
  const receipts = readJsonFile<MongoReceipt>("receipts.json");
  const items = readJsonFile<MongoItem>("items.json");

  console.log(`  - Units: ${units.length}`);
  console.log(`  - Categories: ${categories.length}`);
  console.log(`  - Stores: ${stores.length}`);
  console.log(`  - Products: ${products.length}`);
  console.log(`  - Receipts: ${receipts.length}`);
  console.log(`  - Items: ${items.length}`);
  console.log("");

  // Step 2: Transform data
  console.log("Step 2: Transforming data...");

  // Units first (needed for product names)
  const unitMap = transformUnits(units);

  // Categories (for product category names - no separate table)
  const categoryMap = transformCategories(categories);

  // Stores
  const pgStores = transformStores(stores);
  writeJsonFile("stores.json", pgStores);

  // Products (depends on units and categories)
  const pgProducts = transformProducts(products, unitMap, categoryMap);
  writeJsonFile("products.json", pgProducts);

  // Prices (depends on products, stores, and receipts)
  const pgPrices = transformPrices(items, receipts);
  writeJsonFile("prices.json", pgPrices);

  // Step 3: Write ID mappings for reference
  console.log("\nStep 3: Writing ID mappings...");
  const mappings = {
    products: Object.fromEntries(idMappings.products),
    stores: Object.fromEntries(idMappings.stores),
    categories: Object.fromEntries(idMappings.categories),
  };
  writeJsonFile("id-mappings.json", mappings);

  // Step 4: Generate summary
  console.log("\n========================================");
  console.log("Transformation Complete!");
  console.log("========================================");
  console.log(`Stores: ${pgStores.length}`);
  console.log(`Products: ${pgProducts.length}`);
  console.log(`Prices: ${pgPrices.length}`);
  console.log("\nOutput files in: scripts/migration/data/transformed/");
  console.log("\nNext step: Run the import script:");
  console.log("  npx ts-node scripts/migration/3-import-to-supabase.ts");
};

// Run transformation
runTransformation();
