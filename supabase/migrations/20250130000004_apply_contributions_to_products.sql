-- =====================================================
-- MIGRATION: Apply Contributions to Products
-- Descripción: Actualiza la función approve_contribution para aplicar
--              realmente los cambios a los productos cuando se aprueban
-- Fecha: 2025-01-30
-- Sprint: 3 - Backoffice de Moderación
-- Tarea: 3.3 - Lógica de Aprobación/Rechazo
-- =====================================================

-- =====================================================
-- 1. ACTUALIZAR FUNCIÓN approve_contribution
-- =====================================================

CREATE OR REPLACE FUNCTION approve_contribution(
  contribution_id UUID,
  reviewer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  contribution_record RECORD;
  contribution_data JSONB;
  product_record RECORD;
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

  -- Obtener el producto
  SELECT * INTO product_record
  FROM products
  WHERE id = contribution_record.product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;

  -- Obtener los datos de la contribución
  contribution_data := contribution_record.data;

  -- Aplicar cambios según el tipo de contribución
  CASE contribution_record.contribution_type
    WHEN 'barcode' THEN
      -- Actualizar código de barras del producto
      UPDATE products
      SET
        barcode = contribution_data->>'barcode',
        updated_at = NOW()
      WHERE id = contribution_record.product_id;

    WHEN 'image' THEN
      -- Insertar nueva imagen del producto
      -- Primero verificar si ya existe la URL
      IF NOT EXISTS (
        SELECT 1 FROM product_images
        WHERE product_id = contribution_record.product_id
        AND url = contribution_data->>'imageUrl'
      ) THEN
        INSERT INTO product_images (product_id, url, alt, is_primary)
        VALUES (
          contribution_record.product_id,
          contribution_data->>'imageUrl',
          product_record.name,
          -- Es primaria solo si no hay otras imágenes
          NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = contribution_record.product_id)
        );
      END IF;

    WHEN 'price' THEN
      -- Insertar nuevo precio
      -- Primero verificar si ya existe un precio reciente para esa tienda
      INSERT INTO prices (product_id, store_id, price, source, scraped_at)
      VALUES (
        contribution_record.product_id,
        (contribution_data->>'storeId')::UUID,
        (contribution_data->>'value')::NUMERIC,
        'user_contribution',
        (contribution_data->>'date')::TIMESTAMP WITH TIME ZONE
      )
      ON CONFLICT (product_id, store_id, scraped_at)
      DO UPDATE SET
        price = EXCLUDED.price,
        updated_at = NOW();

    WHEN 'info' THEN
      -- Actualizar información del producto (solo campos no nulos)
      UPDATE products
      SET
        brand = COALESCE(contribution_data->>'brand', brand),
        description = COALESCE(contribution_data->>'description', description),
        category = COALESCE(contribution_data->>'category', category),
        manufacturer = COALESCE(contribution_data->>'manufacturer', manufacturer),
        weight = COALESCE(contribution_data->>'weight', weight),
        volume = COALESCE(contribution_data->>'volume', volume),
        updated_at = NOW()
      WHERE id = contribution_record.product_id;

    ELSE
      RAISE EXCEPTION 'Tipo de contribución desconocido: %', contribution_record.contribution_type;
  END CASE;

  -- Marcar contribución como aprobada
  UPDATE product_contributions
  SET
    status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = contribution_id;

  success := TRUE;
  RETURN success;

EXCEPTION
  WHEN OTHERS THEN
    -- Log del error (esto aparecerá en los logs de Supabase)
    RAISE WARNING 'Error al aprobar contribución %: %', contribution_id, SQLERRM;
    RAISE EXCEPTION 'Error al aprobar contribución: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION approve_contribution IS 'Aprueba una contribución y aplica los cambios al producto (solo moderadores/admins)';

-- =====================================================
-- 2. CREAR FUNCIÓN PARA REVERTIR CONTRIBUCIÓN (OPCIONAL)
-- =====================================================

-- Esta función permite revertir una contribución aprobada
-- (útil si se aprobó por error)
CREATE OR REPLACE FUNCTION revert_contribution(
  contribution_id UUID,
  reviewer_id UUID,
  revert_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  contribution_record RECORD;
  success BOOLEAN := FALSE;
BEGIN
  -- Verificar que el reviewer es admin (solo admins pueden revertir)
  IF NOT is_admin(reviewer_id) THEN
    RAISE EXCEPTION 'Solo administradores pueden revertir contribuciones aprobadas';
  END IF;

  -- Obtener la contribución
  SELECT * INTO contribution_record
  FROM product_contributions
  WHERE id = contribution_id AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribución no encontrada o no está aprobada';
  END IF;

  -- NOTA: Revertir los cambios es complejo porque requeriría
  -- mantener un historial de valores anteriores. Por ahora,
  -- solo marcamos la contribución como rejected con una razón.

  UPDATE product_contributions
  SET
    status = 'rejected',
    rejection_reason = 'REVERTIDA: ' || revert_reason,
    updated_at = NOW()
  WHERE id = contribution_id;

  success := TRUE;
  RETURN success;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al revertir contribución: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION revert_contribution IS 'Revierte una contribución aprobada (solo admins)';

-- =====================================================
-- 3. CREAR FUNCIÓN PARA OBTENER HISTORIAL DE CONTRIBUCIONES DE UN PRODUCTO
-- =====================================================

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
-- 4. CREAR ÍNDICE PARA OPTIMIZAR BÚSQUEDA DE IMÁGENES
-- =====================================================

-- Índice para verificar duplicados de imágenes más rápido
CREATE INDEX IF NOT EXISTS idx_product_images_product_url
ON product_images(product_id, url);

-- =====================================================
-- 5. AGREGAR RLS POLICY PARA product_images
-- =====================================================

-- Asegurar que RLS está habilitado
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden ver las imágenes
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
CREATE POLICY "Anyone can view product images"
ON product_images FOR SELECT
TO public
USING (true);

-- Policy: Solo moderadores/admins pueden insertar/actualizar/eliminar
DROP POLICY IF EXISTS "Moderators can manage product images" ON product_images;
CREATE POLICY "Moderators can manage product images"
ON product_images FOR ALL
TO authenticated
USING (is_moderator_or_admin(auth.uid()))
WITH CHECK (is_moderator_or_admin(auth.uid()));

-- =====================================================
-- 6. CREAR TRIGGER PARA ACTUALIZAR updated_at EN products
-- =====================================================

-- Este trigger ya debería existir, pero lo verificamos
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
