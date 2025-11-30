-- =====================================================
-- Migration: Add measurement and tax fields to products
-- Description: Adds unit, measurement_value, and tax_percentage columns to products table
-- Date: 2025-01-30
-- =====================================================

-- Add unit column for measurement type (L, mL, kg, g, lb, oz, un)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit TEXT CHECK (unit IN ('L', 'mL', 'kg', 'g', 'lb', 'oz', 'un'));

-- Add measurement_value column for the quantity
ALTER TABLE products
ADD COLUMN IF NOT EXISTS measurement_value NUMERIC CHECK (measurement_value > 0);

-- Add tax_percentage column (0 for exempt, 7 for ITBMS in Panama, etc.)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC DEFAULT 0 CHECK (tax_percentage >= 0 AND tax_percentage <= 100);

-- Add price_per_base_unit for normalized price comparisons ($/L, $/kg, $/un)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_per_base_unit NUMERIC;

-- Add tags array for search and filtering
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add comments to document the columns
COMMENT ON COLUMN products.unit IS 'Unit of measurement: L (liters), mL (milliliters), kg (kilograms), g (grams), lb (pounds), oz (ounces), un (units)';
COMMENT ON COLUMN products.measurement_value IS 'Quantity value (e.g., 1 for 1L, 500 for 500g, 12 for 12 units)';
COMMENT ON COLUMN products.tax_percentage IS 'Tax percentage applied to this product (0 for exempt, 7 for ITBMS in Panama)';
COMMENT ON COLUMN products.price_per_base_unit IS 'Calculated price per base unit ($/L, $/kg, $/un) for easy comparison';
COMMENT ON COLUMN products.tags IS 'Tags array for advanced search and filtering';

-- Create index for unit-based filtering
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit);

-- Create index for measurement value filtering
CREATE INDEX IF NOT EXISTS idx_products_measurement_value ON products(measurement_value);

-- Create index for price per base unit sorting
CREATE INDEX IF NOT EXISTS idx_products_price_per_base_unit ON products(price_per_base_unit);

-- Create GIN index for tags array search
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
