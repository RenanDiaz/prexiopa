-- =====================================================================================
-- Admin Analytics Dashboard - RPC Functions
-- =====================================================================================
-- Creates functions to fetch analytics data for the admin dashboard
-- Includes contribution trends, product completeness stats, and user activity metrics

-- =====================================================================================
-- Function: get_contribution_trends
-- Description: Returns contribution counts grouped by date for the last N days
-- Parameters:
--   - p_days: Number of days to look back (default: 30)
-- Returns: Array of {date, total, approved, rejected, pending}
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_contribution_trends(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total BIGINT,
  approved BIGINT,
  rejected BIGINT,
  pending BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::DATE AS date
  )
  SELECT
    ds.date,
    COALESCE(COUNT(pc.id), 0) AS total,
    COALESCE(COUNT(pc.id) FILTER (WHERE pc.status = 'approved'), 0) AS approved,
    COALESCE(COUNT(pc.id) FILTER (WHERE pc.status = 'rejected'), 0) AS rejected,
    COALESCE(COUNT(pc.id) FILTER (WHERE pc.status = 'pending'), 0) AS pending
  FROM date_series ds
  LEFT JOIN product_contributions pc ON DATE(pc.created_at) = ds.date
  GROUP BY ds.date
  ORDER BY ds.date ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_contribution_trends(INTEGER) TO authenticated;

COMMENT ON FUNCTION get_contribution_trends(INTEGER) IS
'Returns daily contribution counts for the last N days, grouped by status';

-- =====================================================================================
-- Function: get_contributions_by_type
-- Description: Returns contribution counts grouped by type
-- Parameters: None
-- Returns: Array of {contribution_type, total, approved, rejected, pending, approval_rate}
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_contributions_by_type()
RETURNS TABLE (
  contribution_type TEXT,
  total BIGINT,
  approved BIGINT,
  rejected BIGINT,
  pending BIGINT,
  approval_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.contribution_type,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE pc.status = 'approved') AS approved,
    COUNT(*) FILTER (WHERE pc.status = 'rejected') AS rejected,
    COUNT(*) FILTER (WHERE pc.status = 'pending') AS pending,
    CASE
      WHEN COUNT(*) FILTER (WHERE pc.status IN ('approved', 'rejected')) > 0
      THEN ROUND(
        (COUNT(*) FILTER (WHERE pc.status = 'approved')::NUMERIC /
         COUNT(*) FILTER (WHERE pc.status IN ('approved', 'rejected'))::NUMERIC) * 100,
        1
      )
      ELSE 0
    END AS approval_rate
  FROM product_contributions pc
  GROUP BY pc.contribution_type
  ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_contributions_by_type() TO authenticated;

COMMENT ON FUNCTION get_contributions_by_type() IS
'Returns contribution statistics grouped by type (barcode, image, price, info)';

-- =====================================================================================
-- Function: get_review_time_stats
-- Description: Returns average review time for contributions
-- Parameters: None
-- Returns: Single row with avg_review_hours, median_review_hours, fastest_review_hours
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_review_time_stats()
RETURNS TABLE (
  avg_review_hours NUMERIC,
  median_review_hours NUMERIC,
  fastest_review_hours NUMERIC,
  slowest_review_hours NUMERIC,
  total_reviewed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH review_times AS (
    SELECT
      EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600 AS hours
    FROM product_contributions
    WHERE reviewed_at IS NOT NULL
  )
  SELECT
    COALESCE(ROUND(AVG(hours), 2), 0) AS avg_review_hours,
    COALESCE(ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hours), 2), 0) AS median_review_hours,
    COALESCE(ROUND(MIN(hours), 2), 0) AS fastest_review_hours,
    COALESCE(ROUND(MAX(hours), 2), 0) AS slowest_review_hours,
    COUNT(*) AS total_reviewed
  FROM review_times;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_review_time_stats() TO authenticated;

COMMENT ON FUNCTION get_review_time_stats() IS
'Returns statistics about contribution review times in hours';

-- =====================================================================================
-- Function: get_active_contributors_count
-- Description: Returns count of users who contributed in the last N days
-- Parameters:
--   - p_days: Number of days to look back (default: 30)
-- Returns: Single value with count
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_active_contributors_count(p_days INTEGER DEFAULT 30)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT contributor_id)
    FROM product_contributions
    WHERE created_at >= CURRENT_DATE - p_days
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_active_contributors_count(INTEGER) TO authenticated;

COMMENT ON FUNCTION get_active_contributors_count(INTEGER) IS
'Returns count of unique contributors in the last N days';

-- =====================================================================================
-- Function: get_completeness_by_category
-- Description: Returns average product completeness grouped by category
-- Parameters: None
-- Returns: Array of {category_name, avg_completeness, total_products, incomplete_products}
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_completeness_by_category()
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  avg_completeness NUMERIC,
  total_products BIGINT,
  incomplete_products BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS category_id,
    c.name AS category_name,
    ROUND(AVG(calculate_product_completeness(p.*)), 1) AS avg_completeness,
    COUNT(*) AS total_products,
    COUNT(*) FILTER (WHERE calculate_product_completeness(p.*) < 100) AS incomplete_products
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  GROUP BY c.id, c.name
  HAVING COUNT(*) > 0
  ORDER BY avg_completeness ASC, total_products DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_completeness_by_category() TO authenticated;

COMMENT ON FUNCTION get_completeness_by_category() IS
'Returns average product completeness for top 10 categories';

-- =====================================================================================
-- Function: get_daily_activity_stats
-- Description: Returns high-level stats for today vs yesterday
-- Parameters: None
-- Returns: Single row with comparison metrics
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_daily_activity_stats()
RETURNS TABLE (
  contributions_today BIGINT,
  contributions_yesterday BIGINT,
  reviews_today BIGINT,
  reviews_yesterday BIGINT,
  new_products_today BIGINT,
  new_products_yesterday BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM product_contributions WHERE DATE(created_at) = CURRENT_DATE) AS contributions_today,
    (SELECT COUNT(*) FROM product_contributions WHERE DATE(created_at) = CURRENT_DATE - 1) AS contributions_yesterday,
    (SELECT COUNT(*) FROM product_contributions WHERE DATE(reviewed_at) = CURRENT_DATE) AS reviews_today,
    (SELECT COUNT(*) FROM product_contributions WHERE DATE(reviewed_at) = CURRENT_DATE - 1) AS reviews_yesterday,
    (SELECT COUNT(*) FROM products WHERE DATE(created_at) = CURRENT_DATE) AS new_products_today,
    (SELECT COUNT(*) FROM products WHERE DATE(created_at) = CURRENT_DATE - 1) AS new_products_yesterday;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_daily_activity_stats() TO authenticated;

COMMENT ON FUNCTION get_daily_activity_stats() IS
'Returns daily activity statistics comparing today vs yesterday';

-- =====================================================================================
-- Create indexes for better performance on analytics queries
-- =====================================================================================

-- Index for contribution trends queries (by date)
CREATE INDEX IF NOT EXISTS idx_contributions_created_date
ON product_contributions(DATE(created_at));

-- Index for reviewed contributions queries
CREATE INDEX IF NOT EXISTS idx_contributions_reviewed_date
ON product_contributions(DATE(reviewed_at)) WHERE reviewed_at IS NOT NULL;

-- Index for product creation date queries
CREATE INDEX IF NOT EXISTS idx_products_created_date
ON products(DATE(created_at));

COMMENT ON INDEX idx_contributions_created_date IS 'Optimizes queries for contribution trends by creation date';
COMMENT ON INDEX idx_contributions_reviewed_date IS 'Optimizes queries for review time statistics';
COMMENT ON INDEX idx_products_created_date IS 'Optimizes queries for new product statistics';
