-- =====================================================
-- Migration: Add RLS policies for products table
-- Description: Enables RLS and creates policies for reading and writing products
-- Date: 2025-01-30
-- =====================================================

-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- READ POLICIES (SELECT)
-- =====================================================

-- Policy: Anyone can view all products (public read access)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
TO public
USING (true);

-- =====================================================
-- WRITE POLICIES (INSERT)
-- =====================================================

-- Policy: Authenticated users can create products
DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
CREATE POLICY "Authenticated users can create products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- UPDATE POLICIES
-- =====================================================

-- Policy: Moderators and admins can update products
DROP POLICY IF EXISTS "Moderators can update products" ON products;
CREATE POLICY "Moderators can update products"
ON products FOR UPDATE
TO authenticated
USING (is_moderator_or_admin(auth.uid()))
WITH CHECK (is_moderator_or_admin(auth.uid()));

-- =====================================================
-- DELETE POLICIES
-- =====================================================

-- Policy: Only admins can delete products
DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Anyone can view products" ON products IS
'Public read access - anyone can view all products';

COMMENT ON POLICY "Authenticated users can create products" ON products IS
'Authenticated users can create new products (crowdsourced data)';

COMMENT ON POLICY "Moderators can update products" ON products IS
'Only moderators and admins can update existing products';

COMMENT ON POLICY "Admins can delete products" ON products IS
'Only admins can delete products';
