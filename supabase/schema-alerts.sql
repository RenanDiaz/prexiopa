-- Prexiopá Alerts Schema
-- Sistema de alertas de precios para notificar a usuarios
-- Ejecutar DESPUÉS de schema.sql

-- =====================================================
-- ALERTS TABLE (Alertas de Precios)
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- NULL = todas las tiendas
  target_price DECIMAL(10, 2) NOT NULL CHECK (target_price > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  notified_at TIMESTAMP WITH TIME ZONE, -- Última vez que se notificó
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: Un usuario no puede tener alertas duplicadas para el mismo producto/tienda
  UNIQUE(user_id, product_id, store_id)
);

-- =====================================================
-- INDEXES (Para optimizar consultas)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_alerts_user_id
  ON alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_product_id
  ON alerts(product_id);

CREATE INDEX IF NOT EXISTS idx_alerts_store_id
  ON alerts(store_id);

CREATE INDEX IF NOT EXISTS idx_alerts_active
  ON alerts(active)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_alerts_user_active
  ON alerts(user_id, active)
  WHERE active = true;

-- =====================================================
-- TRIGGER FOR updated_at
-- =====================================================
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propias alertas
CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden crear sus propias alertas
CREATE POLICY "Users can create their own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar sus propias alertas
CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus propias alertas
CREATE POLICY "Users can delete their own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Check if alert should trigger
-- =====================================================
-- Esta función verifica si una alerta debe activarse
-- basándose en los precios actuales
CREATE OR REPLACE FUNCTION should_trigger_alert(alert_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  alert_record RECORD;
  current_price DECIMAL(10,2);
BEGIN
  -- Obtener alerta
  SELECT * INTO alert_record
  FROM alerts
  WHERE id = alert_id AND active = true;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Obtener precio actual
  IF alert_record.store_id IS NULL THEN
    -- Buscar precio más bajo en todas las tiendas
    SELECT MIN(price) INTO current_price
    FROM prices
    WHERE product_id = alert_record.product_id
      AND in_stock = true
      AND date = CURRENT_DATE;
  ELSE
    -- Buscar precio en tienda específica
    SELECT price INTO current_price
    FROM prices
    WHERE product_id = alert_record.product_id
      AND store_id = alert_record.store_id
      AND in_stock = true
      AND date = CURRENT_DATE
    ORDER BY date DESC
    LIMIT 1;
  END IF;

  -- Verificar si se cumple la condición
  IF current_price IS NOT NULL AND current_price <= alert_record.target_price THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Get active alerts for user
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_alerts_summary(p_user_id UUID)
RETURNS TABLE (
  alert_id UUID,
  product_name TEXT,
  product_image TEXT,
  store_name TEXT,
  target_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  price_diff DECIMAL(10,2),
  should_notify BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as alert_id,
    p.name as product_name,
    p.image as product_image,
    COALESCE(s.name, 'Todas las tiendas') as store_name,
    a.target_price,
    COALESCE(
      (
        SELECT MIN(pr.price)
        FROM prices pr
        WHERE pr.product_id = a.product_id
          AND (a.store_id IS NULL OR pr.store_id = a.store_id)
          AND pr.in_stock = true
          AND pr.date >= CURRENT_DATE - INTERVAL '7 days'
      ),
      0.00
    ) as current_price,
    a.target_price - COALESCE(
      (
        SELECT MIN(pr.price)
        FROM prices pr
        WHERE pr.product_id = a.product_id
          AND (a.store_id IS NULL OR pr.store_id = a.store_id)
          AND pr.in_stock = true
          AND pr.date >= CURRENT_DATE - INTERVAL '7 days'
      ),
      999.99
    ) as price_diff,
    should_trigger_alert(a.id) as should_notify,
    a.created_at
  FROM alerts a
  JOIN products p ON p.id = a.product_id
  LEFT JOIN stores s ON s.id = a.store_id
  WHERE a.user_id = p_user_id
    AND a.active = true
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS (Documentación)
-- =====================================================
COMMENT ON TABLE alerts IS 'Alertas de precios configuradas por usuarios';
COMMENT ON COLUMN alerts.user_id IS 'Usuario propietario de la alerta';
COMMENT ON COLUMN alerts.product_id IS 'Producto a monitorear';
COMMENT ON COLUMN alerts.store_id IS 'Tienda específica (NULL = todas)';
COMMENT ON COLUMN alerts.target_price IS 'Precio objetivo para activar alerta';
COMMENT ON COLUMN alerts.active IS 'Si la alerta está activa';
COMMENT ON COLUMN alerts.notified_at IS 'Última vez que se envió notificación';

COMMENT ON FUNCTION should_trigger_alert(UUID) IS 'Verifica si una alerta debe activarse basándose en precios actuales';
COMMENT ON FUNCTION get_user_alerts_summary(UUID) IS 'Obtiene resumen de alertas de un usuario con precios actuales';
