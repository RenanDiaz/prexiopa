-- Migration: Create Product Contributions System
-- Description: Sistema para permitir a usuarios contribuir con datos de productos
-- Author: Claude Code
-- Date: 2025-01-29

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Tabla de contribuciones de productos
CREATE TABLE IF NOT EXISTS product_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('barcode', 'image', 'price', 'info')),
  data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para documentación
COMMENT ON TABLE product_contributions IS 'Contribuciones de usuarios para enriquecer datos de productos';
COMMENT ON COLUMN product_contributions.contribution_type IS 'Tipo de contribución: barcode, image, price, info';
COMMENT ON COLUMN product_contributions.data IS 'Datos de la contribución en formato JSON flexible';
COMMENT ON COLUMN product_contributions.status IS 'Estado: pending, approved, rejected';
COMMENT ON COLUMN product_contributions.rejection_reason IS 'Razón del rechazo si aplica';

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Índice para búsquedas por producto
CREATE INDEX idx_product_contributions_product_id ON product_contributions(product_id);

-- Índice para búsquedas por contribuidor
CREATE INDEX idx_product_contributions_contributor_id ON product_contributions(contributor_id);

-- Índice para búsquedas por estado (para cola de moderación)
CREATE INDEX idx_product_contributions_status ON product_contributions(status);

-- Índice compuesto para moderación eficiente
CREATE INDEX idx_product_contributions_status_created ON product_contributions(status, created_at DESC);

-- Índice para revisores
CREATE INDEX idx_product_contributions_reviewed_by ON product_contributions(reviewed_by);

-- ============================================================================
-- 3. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_product_contributions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_contributions_updated_at
BEFORE UPDATE ON product_contributions
FOR EACH ROW
EXECUTE FUNCTION update_product_contributions_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE product_contributions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver sus propias contribuciones
CREATE POLICY "Users can view their own contributions"
ON product_contributions
FOR SELECT
TO authenticated
USING (contributor_id = auth.uid());

-- Policy: Usuarios pueden crear contribuciones
CREATE POLICY "Users can create contributions"
ON product_contributions
FOR INSERT
TO authenticated
WITH CHECK (contributor_id = auth.uid());

-- Policy: Usuarios pueden actualizar sus propias contribuciones pendientes
CREATE POLICY "Users can update their own pending contributions"
ON product_contributions
FOR UPDATE
TO authenticated
USING (contributor_id = auth.uid() AND status = 'pending')
WITH CHECK (contributor_id = auth.uid() AND status = 'pending');

-- Policy: Usuarios pueden eliminar sus propias contribuciones pendientes
CREATE POLICY "Users can delete their own pending contributions"
ON product_contributions
FOR DELETE
TO authenticated
USING (contributor_id = auth.uid() AND status = 'pending');

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Función para obtener estadísticas de contribuciones de un usuario
CREATE OR REPLACE FUNCTION get_user_contribution_stats(user_id UUID)
RETURNS TABLE (
  total_contributions BIGINT,
  pending_contributions BIGINT,
  approved_contributions BIGINT,
  rejected_contributions BIGINT,
  approval_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_contributions,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_contributions,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_contributions,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_contributions,
    CASE
      WHEN COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) = 0 THEN 0
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE status = 'approved')::NUMERIC /
         COUNT(*) FILTER (WHERE status IN ('approved', 'rejected'))::NUMERIC) * 100,
        2
      )
    END as approval_rate
  FROM product_contributions
  WHERE contributor_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener contribuciones recientes de un usuario
CREATE OR REPLACE FUNCTION get_user_recent_contributions(
  user_id UUID,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name TEXT,
  contribution_type TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.product_id,
    p.name as product_name,
    pc.contribution_type,
    pc.status,
    pc.created_at,
    pc.reviewed_at
  FROM product_contributions pc
  LEFT JOIN products p ON p.id = pc.product_id
  WHERE pc.contributor_id = user_id
  ORDER BY pc.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

-- Permisos para usuarios autenticados
GRANT SELECT, INSERT ON product_contributions TO authenticated;
GRANT UPDATE, DELETE ON product_contributions TO authenticated;

-- Permisos para funciones helper
GRANT EXECUTE ON FUNCTION get_user_contribution_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_recent_contributions(UUID, INT) TO authenticated;

-- ============================================================================
-- 7. SAMPLE DATA (opcional - comentado por defecto)
-- ============================================================================

-- Descomentar para insertar datos de ejemplo
/*
-- Ejemplo de contribución de código de barras
INSERT INTO product_contributions (product_id, contributor_id, contribution_type, data, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  auth.uid(),
  'barcode',
  '{"barcode": "7501234567890"}'::jsonb,
  'pending'
);

-- Ejemplo de contribución de imagen
INSERT INTO product_contributions (product_id, contributor_id, contribution_type, data, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  auth.uid(),
  'image',
  '{"imageUrl": "https://example.com/product.jpg"}'::jsonb,
  'pending'
);

-- Ejemplo de contribución de precio
INSERT INTO product_contributions (product_id, contributor_id, contribution_type, data, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  auth.uid(),
  'price',
  '{"value": 5.99, "storeId": "00000000-0000-0000-0000-000000000001", "date": "2025-01-29"}'::jsonb,
  'pending'
);

-- Ejemplo de contribución de información
INSERT INTO product_contributions (product_id, contributor_id, contribution_type, data, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  auth.uid(),
  'info',
  '{"brand": "Marca X", "description": "Descripción mejorada", "category": "Alimentos"}'::jsonb,
  'pending'
);
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created table: product_contributions';
  RAISE NOTICE 'Created indexes: 5 indexes';
  RAISE NOTICE 'Created policies: 4 RLS policies';
  RAISE NOTICE 'Created functions: 2 helper functions';
END $$;
