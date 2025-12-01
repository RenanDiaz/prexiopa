-- Migration: Change quantity column to DECIMAL for weight-based products
-- Allows decimal quantities like 0.735 kg for products sold by weight

-- Step 1: Drop the generated column 'subtotal' that depends on 'quantity'
ALTER TABLE shopping_items
  DROP COLUMN IF EXISTS subtotal;

-- Step 2: Change quantity column type from INTEGER to DECIMAL(10, 3)
-- This allows up to 9,999,999.999 units with 3 decimal places precision
ALTER TABLE shopping_items
  ALTER COLUMN quantity TYPE DECIMAL(10, 3);

-- Step 3: Also change price to DECIMAL if it's not already (for precision in calculations)
ALTER TABLE shopping_items
  ALTER COLUMN price TYPE DECIMAL(10, 2);

-- Step 4: Recreate the subtotal column as a regular column (not generated)
-- We'll make it a regular column and update it via triggers or application logic
ALTER TABLE shopping_items
  ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Step 5: Update existing rows to calculate subtotal
UPDATE shopping_items
SET subtotal = price * quantity;

-- Step 6: Create a trigger function to automatically calculate subtotal on insert/update
CREATE OR REPLACE FUNCTION calculate_shopping_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal = NEW.price * NEW.quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to auto-calculate subtotal before insert or update
DROP TRIGGER IF EXISTS trigger_calculate_subtotal ON shopping_items;
CREATE TRIGGER trigger_calculate_subtotal
  BEFORE INSERT OR UPDATE OF price, quantity
  ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_shopping_item_subtotal();

-- Step 8: Update the check constraint if there's one (ensure quantity > 0)
ALTER TABLE shopping_items
  DROP CONSTRAINT IF EXISTS check_quantity_positive;

ALTER TABLE shopping_items
  ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0);

-- Step 9: Add comments for documentation
COMMENT ON COLUMN shopping_items.quantity IS 'Quantity of the product (allows decimals for weight-based products like 0.735 kg)';
COMMENT ON COLUMN shopping_items.subtotal IS 'Calculated subtotal (price * quantity), auto-updated via trigger';
