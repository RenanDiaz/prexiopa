-- =====================================================
-- MIGRATION: Fix get_pending_contributions Type Mismatch
-- Descripción: Corrige el tipo de retorno de product_name
--              para que coincida con VARCHAR(500) de la tabla products
-- Fecha: 2025-01-30
-- Sprint: 3 - Backoffice de Moderación
-- Bug Fix: HTTP 400 - type mismatch error
-- =====================================================

-- =====================================================
-- REEMPLAZAR FUNCIÓN get_pending_contributions
-- =====================================================

DROP FUNCTION IF EXISTS get_pending_contributions(INT);

CREATE OR REPLACE FUNCTION get_pending_contributions(limit_count INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name VARCHAR(500),  -- Cambiado de TEXT a VARCHAR(500)
  contributor_id UUID,
  contributor_name TEXT,
  contribution_type TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.product_id,
    p.name AS product_name,
    pc.contributor_id,
    u.raw_user_meta_data->>'full_name' AS contributor_name,
    pc.contribution_type,
    pc.data,
    pc.created_at
  FROM product_contributions pc
  JOIN products p ON pc.product_id = p.id
  JOIN auth.users u ON pc.contributor_id = u.id
  WHERE pc.status = 'pending'
  ORDER BY pc.created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_pending_contributions IS 'Obtiene contribuciones pendientes de revisión (solo para moderadores/admins)';

-- =====================================================
-- ACTUALIZAR FUNCIÓN get_product_contribution_history
-- =====================================================

DROP FUNCTION IF EXISTS get_product_contribution_history(UUID, INT);

CREATE OR REPLACE FUNCTION get_product_contribution_history(
  target_product_id UUID,
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  contributor_id UUID,
  contributor_name TEXT,
  contribution_type TEXT,
  data JSONB,
  status TEXT,
  reviewed_by UUID,
  reviewer_name TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.contributor_id,
    u1.raw_user_meta_data->>'full_name' AS contributor_name,
    pc.contribution_type,
    pc.data,
    pc.status,
    pc.reviewed_by,
    u2.raw_user_meta_data->>'full_name' AS reviewer_name,
    pc.reviewed_at,
    pc.rejection_reason,
    pc.created_at
  FROM product_contributions pc
  LEFT JOIN auth.users u1 ON pc.contributor_id = u1.id
  LEFT JOIN auth.users u2 ON pc.reviewed_by = u2.id
  WHERE pc.product_id = target_product_id
  ORDER BY pc.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_product_contribution_history IS 'Obtiene el historial de contribuciones de un producto específico';

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
