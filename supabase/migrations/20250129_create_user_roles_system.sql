-- =====================================================
-- MIGRATION: User Roles System
-- Descripción: Sistema de roles para usuarios (user, moderator, admin)
-- Fecha: 2025-01-29
-- Sprint: 3 - Backoffice de Moderación
-- Tarea: 3.1 - Sistema de Roles y Permisos
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA DE ROLES DE USUARIO
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'moderator', 'admin')) DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para documentación
COMMENT ON TABLE user_roles IS 'Tabla de roles de usuario para control de permisos';
COMMENT ON COLUMN user_roles.user_id IS 'ID del usuario (único, referencia a auth.users)';
COMMENT ON COLUMN user_roles.role IS 'Rol del usuario: user (default), moderator, admin';
COMMENT ON COLUMN user_roles.assigned_by IS 'ID del admin que asignó el rol';
COMMENT ON COLUMN user_roles.assigned_at IS 'Fecha en que se asignó el rol';

-- =====================================================
-- 2. CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

-- =====================================================
-- 3. CREAR FUNCIÓN HELPER PARA OBTENER ROL DE USUARIO
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role(target_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM user_roles WHERE user_id = target_user_id),
    'user' -- Default role si no existe en la tabla
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role IS 'Obtiene el rol de un usuario (default: user)';

-- =====================================================
-- 4. CREAR FUNCIÓN HELPER PARA VERIFICAR SI ES MODERADOR O ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION is_moderator_or_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = target_user_id
    AND role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_moderator_or_admin IS 'Verifica si un usuario es moderador o admin';

-- =====================================================
-- 5. CREAR FUNCIÓN HELPER PARA VERIFICAR SI ES ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = target_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'Verifica si un usuario es admin';

-- =====================================================
-- 6. TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Todos los usuarios autenticados pueden ver su propio rol
CREATE POLICY "Users can view their own role"
ON user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Moderadores y admins pueden ver todos los roles
CREATE POLICY "Moderators and admins can view all roles"
ON user_roles FOR SELECT
TO authenticated
USING (is_moderator_or_admin(auth.uid()));

-- Policy: Solo admins pueden asignar roles
CREATE POLICY "Only admins can insert roles"
ON user_roles FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Policy: Solo admins pueden actualizar roles
CREATE POLICY "Only admins can update roles"
ON user_roles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy: Solo admins pueden eliminar roles
CREATE POLICY "Only admins can delete roles"
ON user_roles FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- =====================================================
-- 8. ACTUALIZAR RLS POLICIES DE product_contributions
-- =====================================================

-- Eliminar la policy anterior de "view all" si existe
DROP POLICY IF EXISTS "Users can view all contributions" ON product_contributions;

-- Policy: Moderadores y admins pueden ver TODAS las contribuciones
CREATE POLICY "Moderators and admins can view all contributions"
ON product_contributions FOR SELECT
TO authenticated
USING (is_moderator_or_admin(auth.uid()));

-- Policy: Moderadores y admins pueden actualizar cualquier contribución
CREATE POLICY "Moderators and admins can update all contributions"
ON product_contributions FOR UPDATE
TO authenticated
USING (is_moderator_or_admin(auth.uid()))
WITH CHECK (is_moderator_or_admin(auth.uid()));

-- Policy: Solo admins pueden eliminar contribuciones de otros usuarios
CREATE POLICY "Admins can delete any contribution"
ON product_contributions FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- =====================================================
-- 9. CREAR FUNCIÓN RPC PARA OBTENER ESTADÍSTICAS DE MODERACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_moderators BIGINT,
  total_admins BIGINT,
  pending_contributions BIGINT,
  approved_contributions BIGINT,
  rejected_contributions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users)::BIGINT,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'moderator')::BIGINT,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'admin')::BIGINT,
    (SELECT COUNT(*) FROM product_contributions WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM product_contributions WHERE status = 'approved')::BIGINT,
    (SELECT COUNT(*) FROM product_contributions WHERE status = 'rejected')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_moderation_stats IS 'Obtiene estadísticas generales de moderación (solo para moderadores/admins)';

-- =====================================================
-- 10. CREAR FUNCIÓN RPC PARA OBTENER CONTRIBUCIONES PENDIENTES
-- =====================================================

CREATE OR REPLACE FUNCTION get_pending_contributions(limit_count INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name TEXT,
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
-- 11. CREAR FUNCIÓN RPC PARA APROBAR CONTRIBUCIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION approve_contribution(
  contribution_id UUID,
  reviewer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  contribution_record RECORD;
  success BOOLEAN := FALSE;
BEGIN
  -- Verificar que el reviewer es moderador o admin
  IF NOT is_moderator_or_admin(reviewer_id) THEN
    RAISE EXCEPTION 'Solo moderadores y admins pueden aprobar contribuciones';
  END IF;

  -- Obtener la contribución
  SELECT * INTO contribution_record
  FROM product_contributions
  WHERE id = contribution_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribución no encontrada o ya fue procesada';
  END IF;

  -- Actualizar estado de la contribución
  UPDATE product_contributions
  SET
    status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = contribution_id;

  -- TODO: Aquí se podría aplicar la contribución al producto
  -- Por ejemplo, si es un barcode, actualizar products.barcode
  -- Si es una imagen, agregarla a product_images, etc.
  -- Esto se implementará en una tarea posterior

  success := TRUE;
  RETURN success;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al aprobar contribución: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION approve_contribution IS 'Aprueba una contribución pendiente (solo moderadores/admins)';

-- =====================================================
-- 12. CREAR FUNCIÓN RPC PARA RECHAZAR CONTRIBUCIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION reject_contribution(
  contribution_id UUID,
  reviewer_id UUID,
  reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := FALSE;
BEGIN
  -- Verificar que el reviewer es moderador o admin
  IF NOT is_moderator_or_admin(reviewer_id) THEN
    RAISE EXCEPTION 'Solo moderadores y admins pueden rechazar contribuciones';
  END IF;

  -- Verificar que existe la contribución y está pendiente
  IF NOT EXISTS (
    SELECT 1 FROM product_contributions
    WHERE id = contribution_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Contribución no encontrada o ya fue procesada';
  END IF;

  -- Actualizar estado de la contribución
  UPDATE product_contributions
  SET
    status = 'rejected',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    rejection_reason = reason,
    updated_at = NOW()
  WHERE id = contribution_id;

  success := TRUE;
  RETURN success;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al rechazar contribución: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reject_contribution IS 'Rechaza una contribución pendiente con razón (solo moderadores/admins)';

-- =====================================================
-- 13. INSERTAR ROLES INICIALES (OPCIONAL)
-- =====================================================

-- Este bloque es opcional y se puede ejecutar manualmente
-- para asignar roles iniciales a usuarios específicos

-- NOTA: Reemplaza 'TU_USER_ID_AQUI' con el UUID real del usuario
-- que quieres hacer admin. Puedes obtenerlo desde Supabase Dashboard
-- en Authentication > Users

-- Ejemplo (comentado por seguridad):
-- INSERT INTO user_roles (user_id, role, assigned_by, assigned_at)
-- VALUES ('TU_USER_ID_AQUI', 'admin', 'TU_USER_ID_AQUI', NOW())
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
