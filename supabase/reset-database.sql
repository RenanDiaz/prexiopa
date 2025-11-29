-- =====================================================
-- PREXIOPÁ - RESET COMPLETO DE BASE DE DATOS
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- PASO 1: ELIMINAR TODAS LAS TABLAS
-- (en orden por dependencias)
-- =====================================================
DROP TABLE IF EXISTS shopping_items CASCADE;
DROP TABLE IF EXISTS shopping_sessions CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- =====================================================
-- PASO 2: ELIMINAR FUNCIONES
-- =====================================================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS should_trigger_alert(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_alerts_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_session_total() CASCADE;
DROP FUNCTION IF EXISTS set_completed_at() CASCADE;
DROP FUNCTION IF EXISTS get_active_shopping_session(UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_shopping_session(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_shopping_stats(UUID) CASCADE;

-- =====================================================
-- PASO 3: HABILITAR EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PASO 4: CREAR TABLAS BASE
-- =====================================================

-- STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(255),
  barcode VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT products_barcode_unique UNIQUE (barcode)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name));

-- PRICES TABLE
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT prices_product_store_date_unique UNIQUE (product_id, store_id, date)
);

CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_store_id ON prices(store_id);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date DESC);

-- FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT favorites_user_product_unique UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- =====================================================
-- PASO 5: CREAR TABLA DE ALERTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  target_price DECIMAL(10, 2) NOT NULL CHECK (target_price > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_store_id ON alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON alerts(user_id, active) WHERE active = true;

-- =====================================================
-- PASO 6: CREAR TABLAS DE SHOPPING
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

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES shopping_sessions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
  unit VARCHAR(20) DEFAULT 'unidad',
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (price * quantity) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id ON shopping_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_store_id ON shopping_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_status ON shopping_sessions(status);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_date ON shopping_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_status ON shopping_sessions(user_id, status) WHERE status = 'in_progress';
CREATE INDEX IF NOT EXISTS idx_shopping_items_session_id ON shopping_items(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_product_id ON shopping_items(product_id);

-- =====================================================
-- PASO 7: HABILITAR ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 8: CREAR POLICIES
-- =====================================================

-- Stores: Public read
CREATE POLICY "Stores are viewable by everyone" ON stores FOR SELECT USING (true);

-- Products: Public read
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Prices: Public read
CREATE POLICY "Prices are viewable by everyone" ON prices FOR SELECT USING (true);

-- Favorites
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Alerts
CREATE POLICY "Users can view their own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON alerts FOR DELETE USING (auth.uid() = user_id);

-- Shopping Sessions
CREATE POLICY "Users can view their own shopping sessions" ON shopping_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own shopping sessions" ON shopping_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping sessions" ON shopping_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping sessions" ON shopping_sessions FOR DELETE USING (auth.uid() = user_id);

-- Shopping Items
CREATE POLICY "Users can view items from their own sessions" ON shopping_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM shopping_sessions WHERE shopping_sessions.id = shopping_items.session_id AND shopping_sessions.user_id = auth.uid()));
CREATE POLICY "Users can create items in their own sessions" ON shopping_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM shopping_sessions WHERE shopping_sessions.id = shopping_items.session_id AND shopping_sessions.user_id = auth.uid()));
CREATE POLICY "Users can update items in their own sessions" ON shopping_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM shopping_sessions WHERE shopping_sessions.id = shopping_items.session_id AND shopping_sessions.user_id = auth.uid()));
CREATE POLICY "Users can delete items from their own sessions" ON shopping_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM shopping_sessions WHERE shopping_sessions.id = shopping_items.session_id AND shopping_sessions.user_id = auth.uid()));

-- =====================================================
-- PASO 9: CREAR FUNCIONES Y TRIGGERS
-- =====================================================

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_sessions_updated_at BEFORE UPDATE ON shopping_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON shopping_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: update_session_total
CREATE OR REPLACE FUNCTION update_session_total()
RETURNS TRIGGER AS $$
DECLARE
  session_total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0.00) INTO session_total
  FROM shopping_items WHERE session_id = COALESCE(NEW.session_id, OLD.session_id);

  UPDATE shopping_sessions SET total = session_total, updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_total_on_insert AFTER INSERT ON shopping_items FOR EACH ROW EXECUTE FUNCTION update_session_total();
CREATE TRIGGER trigger_update_session_total_on_update AFTER UPDATE ON shopping_items FOR EACH ROW EXECUTE FUNCTION update_session_total();
CREATE TRIGGER trigger_update_session_total_on_delete AFTER DELETE ON shopping_items FOR EACH ROW EXECUTE FUNCTION update_session_total();

-- Function: set_completed_at
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

CREATE TRIGGER trigger_set_completed_at BEFORE UPDATE ON shopping_sessions FOR EACH ROW EXECUTE FUNCTION set_completed_at();

-- Function: should_trigger_alert
CREATE OR REPLACE FUNCTION should_trigger_alert(alert_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  alert_record RECORD;
  current_price DECIMAL(10,2);
BEGIN
  SELECT * INTO alert_record FROM alerts WHERE id = alert_id AND active = true;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  IF alert_record.store_id IS NULL THEN
    SELECT MIN(price) INTO current_price FROM prices
    WHERE product_id = alert_record.product_id AND in_stock = true AND date = CURRENT_DATE;
  ELSE
    SELECT price INTO current_price FROM prices
    WHERE product_id = alert_record.product_id AND store_id = alert_record.store_id AND in_stock = true AND date = CURRENT_DATE
    ORDER BY date DESC LIMIT 1;
  END IF;

  IF current_price IS NOT NULL AND current_price <= alert_record.target_price THEN RETURN TRUE; END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function: get_user_alerts_summary
CREATE OR REPLACE FUNCTION get_user_alerts_summary(p_user_id UUID)
RETURNS TABLE (
  alert_id UUID, product_name TEXT, product_image TEXT, store_name TEXT,
  target_price DECIMAL(10,2), current_price DECIMAL(10,2), price_diff DECIMAL(10,2),
  should_notify BOOLEAN, created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as alert_id, p.name as product_name, p.image as product_image,
    COALESCE(s.name, 'Todas las tiendas') as store_name, a.target_price,
    COALESCE((SELECT MIN(pr.price) FROM prices pr WHERE pr.product_id = a.product_id
      AND (a.store_id IS NULL OR pr.store_id = a.store_id) AND pr.in_stock = true
      AND pr.date >= CURRENT_DATE - INTERVAL '7 days'), 0.00) as current_price,
    a.target_price - COALESCE((SELECT MIN(pr.price) FROM prices pr WHERE pr.product_id = a.product_id
      AND (a.store_id IS NULL OR pr.store_id = a.store_id) AND pr.in_stock = true
      AND pr.date >= CURRENT_DATE - INTERVAL '7 days'), 999.99) as price_diff,
    should_trigger_alert(a.id) as should_notify, a.created_at
  FROM alerts a
  JOIN products p ON p.id = a.product_id
  LEFT JOIN stores s ON s.id = a.store_id
  WHERE a.user_id = p_user_id AND a.active = true
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_active_shopping_session
CREATE OR REPLACE FUNCTION get_active_shopping_session(p_user_id UUID)
RETURNS UUID AS $$
DECLARE session_id UUID;
BEGIN
  SELECT id INTO session_id FROM shopping_sessions
  WHERE user_id = p_user_id AND status = 'in_progress'
  ORDER BY created_at DESC LIMIT 1;
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: complete_shopping_session
CREATE OR REPLACE FUNCTION complete_shopping_session(p_session_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
  item_record RECORD;
BEGIN
  SELECT * INTO session_record FROM shopping_sessions WHERE id = p_session_id AND status = 'in_progress';
  IF NOT FOUND THEN RAISE EXCEPTION 'Session not found or already completed'; END IF;

  UPDATE shopping_sessions SET status = 'completed', completed_at = NOW() WHERE id = p_session_id;

  FOR item_record IN SELECT * FROM shopping_items WHERE session_id = p_session_id AND product_id IS NOT NULL
  LOOP
    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (item_record.product_id, session_record.store_id, item_record.price, session_record.date, true)
    ON CONFLICT (product_id, store_id, date) DO UPDATE SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_user_shopping_stats
CREATE OR REPLACE FUNCTION get_user_shopping_stats(p_user_id UUID)
RETURNS TABLE (
  total_sessions INTEGER, completed_sessions INTEGER, total_spent DECIMAL(10,2),
  total_items INTEGER, avg_session_total DECIMAL(10,2), most_visited_store TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_sessions,
    COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0.00)::DECIMAL(10,2) as total_spent,
    (SELECT COUNT(*)::INTEGER FROM shopping_items si JOIN shopping_sessions ss ON ss.id = si.session_id
     WHERE ss.user_id = p_user_id AND ss.status = 'completed') as total_items,
    COALESCE(AVG(total) FILTER (WHERE status = 'completed'), 0.00)::DECIMAL(10,2) as avg_session_total,
    (SELECT s.name FROM shopping_sessions ss JOIN stores s ON s.id = ss.store_id
     WHERE ss.user_id = p_user_id AND ss.status = 'completed' GROUP BY s.name ORDER BY COUNT(*) DESC LIMIT 1) as most_visited_store
  FROM shopping_sessions WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- LISTO! Base de datos reseteada y recreada
-- =====================================================
