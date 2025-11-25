-- ============================================================
-- Phase 5.3: Dual-Mode Shopping Sessions
-- ============================================================
-- Adds 'mode' column to shopping_sessions to distinguish between:
-- - 'planning': Future purchases (use prices from DB)
-- - 'completed': Past purchases (user enters actual paid prices)
--
-- When a 'completed' session is finalized, prices can be saved to price history
-- ============================================================

-- Add mode column to shopping_sessions
ALTER TABLE shopping_sessions
  ADD COLUMN IF NOT EXISTS mode VARCHAR(20) DEFAULT 'planning'
  CHECK (mode IN ('planning', 'completed'));

-- Add paid_price fields to shopping_items for completed mode
ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS paid_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS paid_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS paid_discount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS save_to_history BOOLEAN DEFAULT false;

-- Add index for mode filtering
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_mode ON shopping_sessions(mode);

-- Add index for save_to_history filtering
CREATE INDEX IF NOT EXISTS idx_shopping_items_save_to_history ON shopping_items(save_to_history) WHERE save_to_history = true;

-- ============================================================
-- Function: Save completed session items to price history
-- ============================================================
-- This function creates price entries from shopping items when:
-- 1. Session mode is 'completed'
-- 2. Session status changes to 'completed'
-- 3. Item has save_to_history = true
-- ============================================================

CREATE OR REPLACE FUNCTION save_session_to_price_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if:
  -- 1. Mode is 'completed'
  -- 2. Status changed to 'completed'
  -- 3. Status was not 'completed' before
  IF NEW.mode = 'completed'
     AND NEW.status = 'completed'
     AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Insert prices from shopping_items where save_to_history is true
    INSERT INTO prices (
      product_id,
      store_id,
      price,
      quantity,
      discount,
      total_price,
      is_promotion,
      notes,
      date,
      in_stock,
      reported_by
    )
    SELECT
      si.product_id,
      COALESCE(si.store_id, NEW.store_id),
      COALESCE(si.paid_price, si.price),
      COALESCE(si.paid_quantity, si.quantity),
      COALESCE(si.paid_discount, 0),
      (COALESCE(si.paid_price, si.price) * COALESCE(si.paid_quantity, si.quantity)) - COALESCE(si.paid_discount, 0),
      false,
      CONCAT('Registrado desde sesión de compras: ', NEW.id),
      NEW.date,
      true,
      NEW.user_id
    FROM shopping_items si
    WHERE si.session_id = NEW.id
      AND si.product_id IS NOT NULL
      AND si.save_to_history = true
      AND COALESCE(si.store_id, NEW.store_id) IS NOT NULL;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_save_session_to_price_history ON shopping_sessions;
CREATE TRIGGER trg_save_session_to_price_history
  AFTER UPDATE ON shopping_sessions
  FOR EACH ROW
  EXECUTE FUNCTION save_session_to_price_history();

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON COLUMN shopping_sessions.mode IS 'Session mode: planning (future) or completed (past purchase)';
COMMENT ON COLUMN shopping_items.paid_price IS 'Actual price paid (for completed mode)';
COMMENT ON COLUMN shopping_items.paid_quantity IS 'Actual quantity purchased (for completed mode)';
COMMENT ON COLUMN shopping_items.paid_discount IS 'Actual discount applied (for completed mode)';
COMMENT ON COLUMN shopping_items.save_to_history IS 'Whether to save this item to price history when session completes';
