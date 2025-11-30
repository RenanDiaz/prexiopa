-- Migration: Fix RLS policies for prices table
-- Fecha: 2025-01-30
-- Descripción: Configura políticas RLS para permitir a usuarios autenticados insertar y actualizar precios

-- =====================================================
-- STEP 1: Enable RLS if not already enabled
-- =====================================================

ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop existing policies (to recreate them)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert prices" ON prices;
DROP POLICY IF EXISTS "Users can update their own price reports" ON prices;
DROP POLICY IF EXISTS "Anyone can read prices" ON prices;
DROP POLICY IF EXISTS "Public read access to prices" ON prices;

-- =====================================================
-- STEP 3: Create policies for prices table
-- =====================================================

-- Allow everyone to read prices (public data)
CREATE POLICY "Public read access to prices"
  ON prices FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert prices (crowdsourcing)
CREATE POLICY "Authenticated users can insert prices"
  ON prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update prices they reported
CREATE POLICY "Users can update their own price reports"
  ON prices FOR UPDATE
  TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

-- Allow users to delete prices they reported
CREATE POLICY "Users can delete their own price reports"
  ON prices FOR DELETE
  TO authenticated
  USING (reported_by = auth.uid());

-- =====================================================
-- STEP 4: Grant necessary permissions
-- =====================================================

-- Grant usage on the table
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON prices TO authenticated;
GRANT SELECT ON prices TO anon;
