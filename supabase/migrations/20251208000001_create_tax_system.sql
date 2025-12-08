-- Migration: Create Tax System (ITBMS - Panama)
-- Creates tables and fields for tax rate management

-- =====================================================
-- TAX_RATES TABLE
-- Reference table for Panama ITBMS tax rates
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,           -- 'exempt', 'general', 'selective', 'services'
  name VARCHAR(100) NOT NULL,                  -- 'Exento', 'General', 'Selectivo', 'Servicios'
  rate DECIMAL(5,2) NOT NULL,                  -- 0.00, 7.00, 10.00, 15.00
  description TEXT,
  -- Categories that typically use this rate
  default_categories TEXT[],                   -- Array of category names
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Panama ITBMS rates
INSERT INTO tax_rates (code, name, rate, description, default_categories) VALUES
  ('exempt', 'Exento', 0.00,
   'Sin ITBMS - Canasta basica, medicamentos, productos agricolas',
   ARRAY['Frutas y Verduras', 'Carnes', 'Lacteos', 'Granos y Cereales', 'Medicamentos', 'Huevos']),

  ('general', 'General', 7.00,
   'Tasa general de ITBMS - Mayoria de productos',
   ARRAY['Bebidas', 'Snacks', 'Limpieza', 'Cuidado Personal', 'Congelados', 'Panaderia', 'Enlatados']),

  ('selective', 'Selectivo', 10.00,
   'Tasa selectiva - Bebidas alcoholicas, tabaco, joyas, vehiculos',
   ARRAY['Bebidas Alcoholicas', 'Licores', 'Vinos', 'Cervezas', 'Tabaco', 'Cigarrillos']),

  ('services', 'Servicios', 15.00,
   'Tasa de servicios especificos - Hospedaje, servicios profesionales',
   ARRAY[]::TEXT[])
ON CONFLICT (code) DO NOTHING;

-- Create index for active rates
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tax_rates_code ON tax_rates(code);

-- =====================================================
-- ADD TAX FIELDS TO SHOPPING_ITEMS
-- =====================================================

-- Add tax-related columns to shopping_items table
ALTER TABLE shopping_items
ADD COLUMN IF NOT EXISTS tax_rate_code VARCHAR(20) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 7.00,
ADD COLUMN IF NOT EXISTS price_includes_tax BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;

-- Add comment documentation
COMMENT ON COLUMN shopping_items.tax_rate_code IS 'Code reference to tax_rates table (exempt, general, selective, services)';
COMMENT ON COLUMN shopping_items.tax_rate IS 'Actual tax rate percentage applied (0, 7, 10, 15)';
COMMENT ON COLUMN shopping_items.price_includes_tax IS 'Whether the entered price already includes ITBMS';
COMMENT ON COLUMN shopping_items.base_price IS 'Price before tax (calculated if price_includes_tax is true)';
COMMENT ON COLUMN shopping_items.tax_amount IS 'Total tax amount for this line item (base_price * tax_rate/100 * quantity)';

-- =====================================================
-- ADD TAX TOTALS TO SHOPPING_SESSIONS
-- =====================================================

-- Add tax summary columns to shopping_sessions
ALTER TABLE shopping_sessions
ADD COLUMN IF NOT EXISTS subtotal_before_tax DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tax DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_breakdown JSONB DEFAULT '{}';

COMMENT ON COLUMN shopping_sessions.subtotal_before_tax IS 'Sum of all base_price * quantity';
COMMENT ON COLUMN shopping_sessions.total_tax IS 'Sum of all tax_amount';
COMMENT ON COLUMN shopping_sessions.tax_breakdown IS 'Breakdown by tax rate: {"7": 3.50, "10": 1.20, "0": 0}';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate base price from price with tax
CREATE OR REPLACE FUNCTION calculate_base_price(
  p_price DECIMAL(10,2),
  p_tax_rate DECIMAL(5,2),
  p_includes_tax BOOLEAN
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF p_includes_tax THEN
    -- Price includes tax, extract base price
    -- base_price = price / (1 + tax_rate/100)
    RETURN ROUND(p_price / (1 + p_tax_rate / 100), 2);
  ELSE
    -- Price is already base price
    RETURN p_price;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate tax amount
CREATE OR REPLACE FUNCTION calculate_tax_amount(
  p_base_price DECIMAL(10,2),
  p_tax_rate DECIMAL(5,2),
  p_quantity DECIMAL(10,3)
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN ROUND(p_base_price * (p_tax_rate / 100) * p_quantity, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get default tax rate for a category
CREATE OR REPLACE FUNCTION get_default_tax_rate_for_category(p_category TEXT)
RETURNS TABLE(code VARCHAR(20), rate DECIMAL(5,2)) AS $$
BEGIN
  RETURN QUERY
  SELECT tr.code, tr.rate
  FROM tax_rates tr
  WHERE tr.is_active = true
    AND p_category = ANY(tr.default_categories)
  LIMIT 1;

  -- If no match found, return general rate
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT tr.code, tr.rate
    FROM tax_rates tr
    WHERE tr.code = 'general' AND tr.is_active = true
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get all active tax rates
CREATE OR REPLACE FUNCTION get_active_tax_rates()
RETURNS TABLE(
  id UUID,
  code VARCHAR(20),
  name VARCHAR(100),
  rate DECIMAL(5,2),
  description TEXT,
  default_categories TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tr.id,
    tr.code,
    tr.name,
    tr.rate,
    tr.description,
    tr.default_categories
  FROM tax_rates tr
  WHERE tr.is_active = true
  ORDER BY tr.rate ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- TRIGGER TO AUTO-CALCULATE TAX ON ITEM INSERT/UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_item_tax()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate base price
  NEW.base_price := calculate_base_price(NEW.price, NEW.tax_rate, NEW.price_includes_tax);

  -- Calculate tax amount for the line
  NEW.tax_amount := calculate_tax_amount(NEW.base_price, NEW.tax_rate, NEW.quantity);

  -- Recalculate subtotal to use base_price if desired
  -- For now, keep subtotal as price * quantity (what user paid)
  NEW.subtotal := ROUND(NEW.price * NEW.quantity, 2);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS trigger_calculate_item_tax ON shopping_items;
CREATE TRIGGER trigger_calculate_item_tax
  BEFORE INSERT OR UPDATE OF price, quantity, tax_rate, price_includes_tax
  ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_tax();

-- =====================================================
-- RLS POLICIES FOR TAX_RATES
-- =====================================================

ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Tax rates are publicly readable
CREATE POLICY "Tax rates are viewable by everyone"
  ON tax_rates FOR SELECT
  USING (true);

-- Only admins can modify tax rates (using existing is_admin function if available)
CREATE POLICY "Only admins can modify tax rates"
  ON tax_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =====================================================
-- UPDATE TRIGGER FOR TAX_RATES
-- =====================================================

CREATE TRIGGER update_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE tax_rates IS 'Reference table for Panama ITBMS tax rates';
COMMENT ON FUNCTION calculate_base_price IS 'Extracts base price from a price that may include tax';
COMMENT ON FUNCTION calculate_tax_amount IS 'Calculates tax amount for a line item';
COMMENT ON FUNCTION get_default_tax_rate_for_category IS 'Returns the default tax rate for a product category';
COMMENT ON FUNCTION get_active_tax_rates IS 'Returns all active tax rates for UI display';
