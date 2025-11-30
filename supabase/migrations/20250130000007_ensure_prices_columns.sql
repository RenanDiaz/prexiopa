-- Migration: Ensure prices table has all required columns
-- Fecha: 2025-01-30
-- Descripción: Agrega columnas faltantes a la tabla prices de forma idempotente

-- =====================================================
-- Add columns if they don't exist (idempotent)
-- =====================================================

-- Quantity purchased (for deals like "2 for $5")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prices' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE prices ADD COLUMN quantity INTEGER DEFAULT 1;
  END IF;
END $$;

-- Discount applied (e.g., $1 off)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prices' AND column_name = 'discount'
  ) THEN
    ALTER TABLE prices ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Total price paid (calculated: price * quantity - discount)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prices' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE prices ADD COLUMN total_price DECIMAL(10, 2);
  END IF;
END $$;

-- Is this a promotional price?
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prices' AND column_name = 'is_promotion'
  ) THEN
    ALTER TABLE prices ADD COLUMN is_promotion BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Notes about the deal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prices' AND column_name = 'notes'
  ) THEN
    ALTER TABLE prices ADD COLUMN notes TEXT;
  END IF;
END $$;

-- User who reported this price
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prices' AND column_name = 'reported_by'
  ) THEN
    ALTER TABLE prices ADD COLUMN reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- Add constraints (if they don't exist)
-- =====================================================

-- Ensure quantity is positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'prices_quantity_check' AND table_name = 'prices'
  ) THEN
    ALTER TABLE prices
      ADD CONSTRAINT prices_quantity_check
      CHECK (quantity IS NULL OR quantity > 0);
  END IF;
END $$;

-- Ensure discount is non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'prices_discount_check' AND table_name = 'prices'
  ) THEN
    ALTER TABLE prices
      ADD CONSTRAINT prices_discount_check
      CHECK (discount IS NULL OR discount >= 0);
  END IF;
END $$;

-- Ensure total_price is non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'prices_total_price_check' AND table_name = 'prices'
  ) THEN
    ALTER TABLE prices
      ADD CONSTRAINT prices_total_price_check
      CHECK (total_price IS NULL OR total_price >= 0);
  END IF;
END $$;

-- =====================================================
-- Add column comments
-- =====================================================

COMMENT ON COLUMN prices.price IS 'Unit price of the product (price per single item)';
COMMENT ON COLUMN prices.quantity IS 'Quantity purchased (default 1, use >1 for deals like "2 for $5")';
COMMENT ON COLUMN prices.discount IS 'Discount applied to the total (e.g., $1 off)';
COMMENT ON COLUMN prices.total_price IS 'Total price paid (price * quantity - discount)';
COMMENT ON COLUMN prices.is_promotion IS 'Whether this is a promotional/sale price';
COMMENT ON COLUMN prices.notes IS 'Notes about the deal (e.g., "2x1", "3 por $10")';
COMMENT ON COLUMN prices.reported_by IS 'User who reported this price';

-- =====================================================
-- Create trigger to auto-calculate total_price
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

-- Drop existing trigger if exists (to recreate)
DROP TRIGGER IF EXISTS trigger_calculate_total_price ON prices;

-- Create trigger
CREATE TRIGGER trigger_calculate_total_price
  BEFORE INSERT OR UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_price();

-- =====================================================
-- Update existing prices with default values
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
-- Create indexes for new columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_prices_is_promotion ON prices(is_promotion) WHERE is_promotion = true;
CREATE INDEX IF NOT EXISTS idx_prices_reported_by ON prices(reported_by);
