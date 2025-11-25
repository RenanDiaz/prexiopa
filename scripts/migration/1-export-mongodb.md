# Step 1: Export MongoDB Data

Before running the transformation scripts, you need to export data from the MongoDB ThriftyTracker database.

## Prerequisites

- MongoDB connection string for ThriftyTracker database
- `mongoexport` command available (comes with MongoDB tools)

## Export Commands

Run these commands to export each collection as JSON:

```bash
# Set your MongoDB connection string
export MONGO_URI="mongodb://localhost:27017/thriftytracker"

# Export Products
mongoexport --uri="$MONGO_URI" --collection=products --out=scripts/migration/data/export/products.json --jsonArray

# Export Stores
mongoexport --uri="$MONGO_URI" --collection=stores --out=scripts/migration/data/export/stores.json --jsonArray

# Export Categories
mongoexport --uri="$MONGO_URI" --collection=categories --out=scripts/migration/data/export/categories.json --jsonArray

# Export Units
mongoexport --uri="$MONGO_URI" --collection=units --out=scripts/migration/data/export/units.json --jsonArray

# Export Receipts
mongoexport --uri="$MONGO_URI" --collection=receipts --out=scripts/migration/data/export/receipts.json --jsonArray

# Export Items (price history)
mongoexport --uri="$MONGO_URI" --collection=items --out=scripts/migration/data/export/items.json --jsonArray

# Export Users (optional - for reference only)
mongoexport --uri="$MONGO_URI" --collection=users --out=scripts/migration/data/export/users.json --jsonArray
```

## Alternative: MongoDB Compass Export

1. Open MongoDB Compass
2. Connect to ThriftyTracker database
3. For each collection, click "Export Collection"
4. Select JSON format with "Export Full Collection"
5. Save to `scripts/migration/data/export/` directory

## Expected Files

After export, you should have these files in `scripts/migration/data/export/`:

- `products.json` - Product catalog
- `stores.json` - Store list
- `categories.json` - Category hierarchy
- `units.json` - Unit definitions
- `receipts.json` - Purchase receipts
- `items.json` - Line items with prices
- `users.json` (optional)

## Next Step

Once exports are complete, run the transformation script:

```bash
npx ts-node scripts/migration/2-transform-data.ts
```
