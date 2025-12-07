-- Migration: Add Unit System to Prexiopá
-- Fecha: 2025-01-24
-- Descripción: Agrega campos de unidad y medida a productos para comparación de precios normalizada

-- =====================================================
-- STEP 1: Add unit fields to products table
-- =====================================================

-- Unit type (L, kg, g, mL, oz, lb, un)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unit VARCHAR(20);

-- Measurement value (1, 2, 0.5, 500, etc.)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS measurement_value DECIMAL(10,2);

-- Tax percentage (0 for exempt, 7 for ITBMS in Panama)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5,2) DEFAULT 0;

-- Add check constraint for valid units
ALTER TABLE products
  ADD CONSTRAINT products_unit_check
  CHECK (unit IS NULL OR unit IN ('L', 'mL', 'kg', 'g', 'lb', 'oz', 'un'));

-- Add check constraint for measurement value
ALTER TABLE products
  ADD CONSTRAINT products_measurement_value_check
  CHECK (measurement_value IS NULL OR measurement_value > 0);

-- Add check constraint for tax percentage
ALTER TABLE products
  ADD CONSTRAINT products_tax_percentage_check
  CHECK (tax_percentage >= 0 AND tax_percentage <= 100);

-- =====================================================
-- STEP 2: Create function to calculate price per base unit
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_price_per_base_unit(
  p_price DECIMAL,
  p_unit VARCHAR,
  p_measurement_value DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_price_per_base DECIMAL;
BEGIN
  -- If no unit or measurement, return original price
  IF p_unit IS NULL OR p_measurement_value IS NULL OR p_measurement_value = 0 THEN
    RETURN p_price;
  END IF;

  -- Normalize to base unit (L, kg, unit)
  CASE p_unit
    -- Volume: normalize to Liters
    WHEN 'L' THEN
      v_price_per_base := p_price / p_measurement_value;
    WHEN 'mL' THEN
      v_price_per_base := (p_price * 1000) / p_measurement_value;

    -- Weight: normalize to Kilograms
    WHEN 'kg' THEN
      v_price_per_base := p_price / p_measurement_value;
    WHEN 'g' THEN
      v_price_per_base := (p_price * 1000) / p_measurement_value;
    WHEN 'lb' THEN
      v_price_per_base := (p_price / 0.453592) / p_measurement_value; -- lb to kg
    WHEN 'oz' THEN
      v_price_per_base := (p_price / 0.0283495) / p_measurement_value; -- oz to kg

    -- Count: normalize to single unit
    WHEN 'un' THEN
      v_price_per_base := p_price / p_measurement_value;

    ELSE
      v_price_per_base := p_price; -- Fallback
  END CASE;

  RETURN ROUND(v_price_per_base, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- STEP 3: Create function to get base unit label
-- =====================================================

CREATE OR REPLACE FUNCTION get_base_unit_label(p_unit VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  CASE p_unit
    WHEN 'L' THEN RETURN '/L';
    WHEN 'mL' THEN RETURN '/L';
    WHEN 'kg' THEN RETURN '/kg';
    WHEN 'g' THEN RETURN '/kg';
    WHEN 'lb' THEN RETURN '/kg';
    WHEN 'oz' THEN RETURN '/kg';
    WHEN 'un' THEN RETURN '/un';
    ELSE RETURN '';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- STEP 4: Create indexes for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit);
CREATE INDEX IF NOT EXISTS idx_products_measurement ON products(measurement_value);

-- =====================================================
-- STEP 5: Update existing products with default values
-- =====================================================

-- Set default unit to 'un' (units) for existing products without unit
-- This is a safe default that means "per item"
UPDATE products
SET unit = 'un', measurement_value = 1
WHERE unit IS NULL;

-- =====================================================
-- STEP 6: Allow authenticated users to insert products
-- =====================================================

-- Policy for authenticated users to create products (crowdsourcing)
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update products they created
-- Note: We'd need a created_by column for this, skipping for now

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN products.unit IS 'Unit of measurement: L (liter), mL (milliliter), kg (kilogram), g (gram), lb (pound), oz (ounce), un (units)';
COMMENT ON COLUMN products.measurement_value IS 'Quantity of the unit (e.g., 1 for 1L, 500 for 500g, 12 for 12 units)';
COMMENT ON COLUMN products.tax_percentage IS 'Tax percentage (0 for exempt, 7 for ITBMS in Panama)';
COMMENT ON FUNCTION calculate_price_per_base_unit IS 'Calculates normalized price per base unit (per L, per kg, or per unit) for comparison';
COMMENT ON FUNCTION get_base_unit_label IS 'Returns the display label for the base unit (/L, /kg, /un)';
