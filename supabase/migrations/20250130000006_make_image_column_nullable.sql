-- =====================================================
-- Migration: Make image column nullable in products
-- Description: Allow products to be created without an image
-- Date: 2025-01-30
-- =====================================================

-- Make image column nullable and set a default value
ALTER TABLE products
ALTER COLUMN image DROP NOT NULL;

-- Set default value for image column
ALTER TABLE products
ALTER COLUMN image SET DEFAULT '/images/products/default.png';

-- Update any existing NULL images to use the default
UPDATE products
SET image = '/images/products/default.png'
WHERE image IS NULL;

-- Add comment
COMMENT ON COLUMN products.image IS 'Product image URL (defaults to /images/products/default.png if not provided)';
