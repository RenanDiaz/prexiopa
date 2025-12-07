-- Migration: Enhanced Price Tracking (Phase 5.2)
-- Fecha: 2025-01-25
-- Descripción: Mejora el sistema de precios para soportar cantidad, descuentos, y promociones

-- =====================================================
-- STEP 1: Add new columns to prices table
-- =====================================================

-- Quantity purchased (for deals like "2 for $5")
ALTER TABLE prices
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Discount applied (e.g., $1 off)
ALTER TABLE prices
  ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;

-- Total price paid (calculated: price * quantity - discount)
ALTER TABLE prices
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

-- Is this a promotional price?
ALTER TABLE prices
  ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT false;

-- Notes about the deal (e.g., "2x1", "3 por $10", "Oferta de fin de semana")
ALTER TABLE prices
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- User who reported this price (for crowdsourcing)
ALTER TABLE prices
  ADD COLUMN IF NOT EXISTS reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 2: Add constraints
-- =====================================================

-- Ensure quantity is positive
ALTER TABLE prices
  ADD CONSTRAINT prices_quantity_check
  CHECK (quantity IS NULL OR quantity > 0);

-- Ensure discount is non-negative
ALTER TABLE prices
  ADD CONSTRAINT prices_discount_check
  CHECK (discount IS NULL OR discount >= 0);

-- Ensure total_price is non-negative
ALTER TABLE prices
  ADD CONSTRAINT prices_total_price_check
  CHECK (total_price IS NULL OR total_price >= 0);

-- =====================================================
-- STEP 3: Rename price to unit_price for clarity
-- =====================================================

-- Note: We'll keep 'price' as is for backward compatibility
-- but add a comment explaining it's the unit price
COMMENT ON COLUMN prices.price IS 'Unit price of the product (price per single item)';
COMMENT ON COLUMN prices.quantity IS 'Quantity purchased (default 1, use >1 for deals like "2 for $5")';
COMMENT ON COLUMN prices.discount IS 'Discount applied to the total (e.g., $1 off)';
COMMENT ON COLUMN prices.total_price IS 'Total price paid (price * quantity - discount)';
COMMENT ON COLUMN prices.is_promotion IS 'Whether this is a promotional/sale price';
COMMENT ON COLUMN prices.notes IS 'Notes about the deal (e.g., "2x1", "3 por $10")';
COMMENT ON COLUMN prices.reported_by IS 'User who reported this price';

-- =====================================================
-- STEP 4: Create trigger to auto-calculate total_price
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_total_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total_price if not explicitly set
  IF NEW.total_price IS NULL THEN
    NEW.total_price := (COALESCE(NEW.price, 0) * COALESCE(NEW.quantity, 1)) - COALESCE(NEW.discount, 0);
  END IF;

  -- Ensure total_price is not negative
  IF NEW.total_price < 0 THEN
    NEW.total_price := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_calculate_total_price ON prices;

-- Create trigger
CREATE TRIGGER trigger_calculate_total_price
  BEFORE INSERT OR UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_price();

-- =====================================================
-- STEP 5: Update existing prices with default values
-- =====================================================

-- Set quantity to 1 for existing prices
UPDATE prices
SET quantity = 1
WHERE quantity IS NULL;

-- Set discount to 0 for existing prices
UPDATE prices
SET discount = 0
WHERE discount IS NULL;

-- Calculate total_price for existing prices
UPDATE prices
SET total_price = (price * COALESCE(quantity, 1)) - COALESCE(discount, 0)
WHERE total_price IS NULL;

-- =====================================================
-- STEP 6: Create indexes for new columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_prices_is_promotion ON prices(is_promotion) WHERE is_promotion = true;
CREATE INDEX IF NOT EXISTS idx_prices_reported_by ON prices(reported_by);

-- =====================================================
-- STEP 7: Create view for price history with calculations
-- =====================================================

CREATE OR REPLACE VIEW price_history_detailed AS
SELECT
  p.id,
  p.product_id,
  p.store_id,
  p.price AS unit_price,
  p.quantity,
  p.discount,
  p.total_price,
  p.is_promotion,
  p.notes,
  p.in_stock,
  p.date,
  p.reported_by,
  p.created_at,
  -- Calculate effective unit price (total / quantity)
  CASE
    WHEN p.quantity > 0 THEN ROUND(p.total_price / p.quantity, 2)
    ELSE p.price
  END AS effective_unit_price,
  -- Calculate savings percentage
  CASE
    WHEN p.discount > 0 AND (p.price * p.quantity) > 0
    THEN ROUND((p.discount / (p.price * p.quantity)) * 100, 1)
    ELSE 0
  END AS savings_percentage,
  -- Store info
  s.name AS store_name,
  s.logo AS store_logo,
  -- Product info
  pr.name AS product_name,
  pr.unit AS product_unit,
  pr.measurement_value AS product_measurement
FROM prices p
JOIN stores s ON p.store_id = s.id
JOIN products pr ON p.product_id = pr.id;

-- =====================================================
-- STEP 8: Update RLS policies for prices
-- =====================================================

-- Allow authenticated users to insert prices (crowdsourcing)
CREATE POLICY "Authenticated users can insert prices"
  ON prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update prices they reported
CREATE POLICY "Users can update their own price reports"
  ON prices FOR UPDATE
  TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

-- =====================================================
-- STEP 9: Create function to get best deal for a product
-- =====================================================

CREATE OR REPLACE FUNCTION get_best_deal(p_product_id UUID)
RETURNS TABLE (
  store_id UUID,
  store_name VARCHAR,
  unit_price DECIMAL,
  quantity INTEGER,
  total_price DECIMAL,
  effective_unit_price DECIMAL,
  is_promotion BOOLEAN,
  notes TEXT,
  date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.store_id,
    s.name AS store_name,
    p.price AS unit_price,
    p.quantity,
    p.total_price,
    CASE
      WHEN p.quantity > 0 THEN ROUND(p.total_price / p.quantity, 2)
      ELSE p.price
    END AS effective_unit_price,
    p.is_promotion,
    p.notes,
    p.date
  FROM prices p
  JOIN stores s ON p.store_id = s.id
  WHERE p.product_id = p_product_id
    AND p.in_stock = true
    AND p.date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY
    CASE WHEN p.quantity > 0 THEN p.total_price / p.quantity ELSE p.price END ASC,
    p.date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_best_deal IS 'Returns the best current deal for a product based on effective unit price';
