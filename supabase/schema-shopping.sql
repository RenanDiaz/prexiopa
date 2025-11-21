-- Prexiopá Shopping Lists Schema
-- Sistema de listas de compras para crowdsourcing de precios
-- Ejecutar DESPUÉS de schema.sql

-- =====================================================
-- SHOPPING SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shopping_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total DECIMAL(10, 2) DEFAULT 0.00 CHECK (total >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SHOPPING ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES shopping_sessions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Nombre manual si no existe en BD
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
  unit VARCHAR(20) DEFAULT 'unidad', -- unidad, kg, g, L, ml, lb, oz
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (price * quantity) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES (Para optimizar consultas)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id
  ON shopping_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_store_id
  ON shopping_sessions(store_id);

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_status
  ON shopping_sessions(status);

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_date
  ON shopping_sessions(date DESC);

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_status
  ON shopping_sessions(user_id, status)
  WHERE status = 'in_progress';

CREATE INDEX IF NOT EXISTS idx_shopping_items_session_id
  ON shopping_items(session_id);

CREATE INDEX IF NOT EXISTS idx_shopping_items_product_id
  ON shopping_items(product_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update session total when items change
CREATE OR REPLACE FUNCTION update_session_total()
RETURNS TRIGGER AS $$
DECLARE
  session_total DECIMAL(10,2);
BEGIN
  -- Calculate new total for the session
  SELECT COALESCE(SUM(subtotal), 0.00)
  INTO session_total
  FROM shopping_items
  WHERE session_id = COALESCE(NEW.session_id, OLD.session_id);

  -- Update session total
  UPDATE shopping_sessions
  SET total = session_total,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_total_on_insert
  AFTER INSERT ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_session_total();

CREATE TRIGGER trigger_update_session_total_on_update
  AFTER UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_session_total();

CREATE TRIGGER trigger_update_session_total_on_delete
  AFTER DELETE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_session_total();

-- Trigger: Update shopping_sessions updated_at
CREATE TRIGGER update_shopping_sessions_updated_at
  BEFORE UPDATE ON shopping_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update shopping_items updated_at
CREATE TRIGGER update_shopping_items_updated_at
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_completed_at
  BEFORE UPDATE ON shopping_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE shopping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Shopping Sessions Policies
CREATE POLICY "Users can view their own shopping sessions"
  ON shopping_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping sessions"
  ON shopping_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping sessions"
  ON shopping_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping sessions"
  ON shopping_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Shopping Items Policies (scoped by session owner)
CREATE POLICY "Users can view items from their own sessions"
  ON shopping_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
        AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their own sessions"
  ON shopping_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
        AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own sessions"
  ON shopping_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
        AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their own sessions"
  ON shopping_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
        AND shopping_sessions.user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get active shopping session for user
CREATE OR REPLACE FUNCTION get_active_shopping_session(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  SELECT id INTO session_id
  FROM shopping_sessions
  WHERE user_id = p_user_id
    AND status = 'in_progress'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete shopping session and update prices
CREATE OR REPLACE FUNCTION complete_shopping_session(p_session_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
  item_record RECORD;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM shopping_sessions
  WHERE id = p_session_id
    AND status = 'in_progress';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or already completed';
  END IF;

  -- Update session status
  UPDATE shopping_sessions
  SET status = 'completed',
      completed_at = NOW()
  WHERE id = p_session_id;

  -- Insert prices into prices table for products with valid product_id
  FOR item_record IN
    SELECT *
    FROM shopping_items
    WHERE session_id = p_session_id
      AND product_id IS NOT NULL
  LOOP
    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      item_record.product_id,
      session_record.store_id,
      item_record.price,
      session_record.date,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price,
        in_stock = EXCLUDED.in_stock;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get shopping statistics for user
CREATE OR REPLACE FUNCTION get_user_shopping_stats(p_user_id UUID)
RETURNS TABLE (
  total_sessions INTEGER,
  completed_sessions INTEGER,
  total_spent DECIMAL(10,2),
  total_items INTEGER,
  avg_session_total DECIMAL(10,2),
  most_visited_store TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_sessions,
    COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0.00)::DECIMAL(10,2) as total_spent,
    (
      SELECT COUNT(*)::INTEGER
      FROM shopping_items si
      JOIN shopping_sessions ss ON ss.id = si.session_id
      WHERE ss.user_id = p_user_id AND ss.status = 'completed'
    ) as total_items,
    COALESCE(AVG(total) FILTER (WHERE status = 'completed'), 0.00)::DECIMAL(10,2) as avg_session_total,
    (
      SELECT s.name
      FROM shopping_sessions ss
      JOIN stores s ON s.id = ss.store_id
      WHERE ss.user_id = p_user_id AND ss.status = 'completed'
      GROUP BY s.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_visited_store
  FROM shopping_sessions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS (Documentación)
-- =====================================================
COMMENT ON TABLE shopping_sessions IS 'Sesiones de compra de usuarios para crowdsourcing de precios';
COMMENT ON TABLE shopping_items IS 'Items individuales en sesiones de compra';

COMMENT ON COLUMN shopping_sessions.status IS 'in_progress, completed, cancelled';
COMMENT ON COLUMN shopping_items.subtotal IS 'Calculado automáticamente: price * quantity';

COMMENT ON FUNCTION update_session_total() IS 'Actualiza el total de la sesión cuando cambian los items';
COMMENT ON FUNCTION get_active_shopping_session(UUID) IS 'Obtiene la sesión activa del usuario';
COMMENT ON FUNCTION complete_shopping_session(UUID) IS 'Completa una sesión y actualiza precios en la BD';
COMMENT ON FUNCTION get_user_shopping_stats(UUID) IS 'Estadísticas de compras del usuario';
