-- Migration: Incomplete Products View and Functions
-- Description: Creates functions to identify and retrieve incomplete products
-- Date: 2025-12-07

-- ============================================================================
-- FUNCTION: Calculate product completeness score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_product_completeness(product_row products)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  total_fields INTEGER := 6;
  recent_price_exists BOOLEAN;
BEGIN
  -- Check barcode (weight: 1)
  IF product_row.barcode IS NOT NULL AND product_row.barcode != '' THEN
    score := score + 1;
  END IF;

  -- Check image (weight: 1)
  IF product_row.image_url IS NOT NULL AND product_row.image_url != '' THEN
    score := score + 1;
  END IF;

  -- Check brand (weight: 1)
  IF product_row.brand IS NOT NULL AND product_row.brand != '' THEN
    score := score + 1;
  END IF;

  -- Check description (weight: 1)
  IF product_row.description IS NOT NULL AND product_row.description != '' THEN
    score := score + 1;
  END IF;

  -- Check category (weight: 1)
  IF product_row.category_id IS NOT NULL THEN
    score := score + 1;
  END IF;

  -- Check recent price (last 30 days) (weight: 1)
  SELECT EXISTS(
    SELECT 1
    FROM prices
    WHERE product_id = product_row.id
      AND date >= CURRENT_DATE - INTERVAL '30 days'
  ) INTO recent_price_exists;

  IF recent_price_exists THEN
    score := score + 1;
  END IF;

  -- Return percentage (0-100)
  RETURN (score * 100) / total_fields;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION calculate_product_completeness IS 'Calculates completeness score (0-100) for a product based on available fields';

-- ============================================================================
-- FUNCTION: Get incomplete products
-- ============================================================================
CREATE OR REPLACE FUNCTION get_incomplete_products(
  p_min_completeness INTEGER DEFAULT 0,
  p_max_completeness INTEGER DEFAULT 99,
  p_category_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  category_id UUID,
  barcode TEXT,
  image_url TEXT,
  brand TEXT,
  description TEXT,
  completeness_score INTEGER,
  missing_fields TEXT[],
  last_updated TIMESTAMPTZ,
  has_recent_price BOOLEAN,
  contribution_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH product_stats AS (
    SELECT
      p.id,
      p.name,
      c.name AS category,
      p.category_id,
      p.barcode,
      p.image_url,
      p.brand,
      p.description,
      p.updated_at AS last_updated,
      -- Calculate completeness
      calculate_product_completeness(p.*) AS completeness_score,
      -- Check for recent prices
      EXISTS(
        SELECT 1
        FROM prices pr
        WHERE pr.product_id = p.id
          AND pr.date >= CURRENT_DATE - INTERVAL '30 days'
      ) AS has_recent_price,
      -- Count contributions
      COALESCE(
        (SELECT COUNT(*)
         FROM product_contributions pc
         WHERE pc.product_id = p.id),
        0
      ) AS contribution_count
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE
      -- Filter by category if provided
      (p_category_id IS NULL OR p.category_id = p_category_id)
  )
  SELECT
    ps.id,
    ps.name,
    ps.category,
    ps.category_id,
    ps.barcode,
    ps.image_url,
    ps.brand,
    ps.description,
    ps.completeness_score,
    -- Generate missing fields array
    ARRAY(
      SELECT field_name
      FROM (
        SELECT 'barcode' AS field_name, ps.barcode IS NULL OR ps.barcode = '' AS is_missing
        UNION ALL
        SELECT 'image', ps.image_url IS NULL OR ps.image_url = ''
        UNION ALL
        SELECT 'brand', ps.brand IS NULL OR ps.brand = ''
        UNION ALL
        SELECT 'description', ps.description IS NULL OR ps.description = ''
        UNION ALL
        SELECT 'category', ps.category_id IS NULL
        UNION ALL
        SELECT 'price', NOT ps.has_recent_price
      ) AS fields
      WHERE is_missing
    ) AS missing_fields,
    ps.last_updated,
    ps.has_recent_price,
    ps.contribution_count
  FROM product_stats ps
  WHERE
    ps.completeness_score >= p_min_completeness
    AND ps.completeness_score <= p_max_completeness
  ORDER BY
    ps.completeness_score ASC,
    ps.last_updated ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_incomplete_products IS 'Retrieves incomplete products with completeness score and missing fields';

-- ============================================================================
-- FUNCTION: Get incomplete products count
-- ============================================================================
CREATE OR REPLACE FUNCTION get_incomplete_products_count(
  p_min_completeness INTEGER DEFAULT 0,
  p_max_completeness INTEGER DEFAULT 99,
  p_category_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO total_count
  FROM products p
  WHERE
    calculate_product_completeness(p.*) >= p_min_completeness
    AND calculate_product_completeness(p.*) <= p_max_completeness
    AND (p_category_id IS NULL OR p.category_id = p_category_id);

  RETURN total_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_incomplete_products_count IS 'Returns total count of incomplete products matching filters';

-- ============================================================================
-- FUNCTION: Get completeness statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION get_completeness_stats()
RETURNS TABLE (
  total_products INTEGER,
  complete_products INTEGER,
  incomplete_products INTEGER,
  missing_barcode INTEGER,
  missing_image INTEGER,
  missing_brand INTEGER,
  missing_description INTEGER,
  missing_category INTEGER,
  missing_recent_price INTEGER,
  avg_completeness NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_products,
    COUNT(*) FILTER (WHERE calculate_product_completeness(p.*) = 100)::INTEGER AS complete_products,
    COUNT(*) FILTER (WHERE calculate_product_completeness(p.*) < 100)::INTEGER AS incomplete_products,
    COUNT(*) FILTER (WHERE p.barcode IS NULL OR p.barcode = '')::INTEGER AS missing_barcode,
    COUNT(*) FILTER (WHERE p.image_url IS NULL OR p.image_url = '')::INTEGER AS missing_image,
    COUNT(*) FILTER (WHERE p.brand IS NULL OR p.brand = '')::INTEGER AS missing_brand,
    COUNT(*) FILTER (WHERE p.description IS NULL OR p.description = '')::INTEGER AS missing_description,
    COUNT(*) FILTER (WHERE p.category_id IS NULL)::INTEGER AS missing_category,
    COUNT(*) FILTER (WHERE NOT EXISTS(
      SELECT 1 FROM prices pr
      WHERE pr.product_id = p.id
        AND pr.date >= CURRENT_DATE - INTERVAL '30 days'
    ))::INTEGER AS missing_recent_price,
    ROUND(AVG(calculate_product_completeness(p.*)), 2) AS avg_completeness
  FROM products p;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_completeness_stats IS 'Returns overall statistics about product data completeness';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute to authenticated users (moderators will check via RLS)
GRANT EXECUTE ON FUNCTION calculate_product_completeness TO authenticated;
GRANT EXECUTE ON FUNCTION get_incomplete_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_incomplete_products_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_completeness_stats TO authenticated;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes to improve performance of completeness queries
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prices_product_date ON prices(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_product_contributions_product ON product_contributions(product_id);

-- ============================================================================
-- TESTING QUERIES (commented out - for manual testing)
-- ============================================================================

-- Test completeness calculation
-- SELECT id, name, calculate_product_completeness(products.*) AS score
-- FROM products
-- ORDER BY score ASC
-- LIMIT 10;

-- Test get incomplete products
-- SELECT * FROM get_incomplete_products(0, 80, NULL, 10, 0);

-- Test completeness stats
-- SELECT * FROM get_completeness_stats();

-- Test count
-- SELECT get_incomplete_products_count(0, 80, NULL);
