-- Migration: Create Promotions System
-- Supports 7 types of promotions/discounts

-- =====================================================
-- PROMOTIONS TABLE
-- Main table for all promotion types
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Promotion type
  -- percentage: 15% off
  -- fixed_amount: $2 off (or from $6.99 to $4.99)
  -- buy_x_get_y: Buy 2, get 1 free (2x1, 3x2, etc)
  -- bulk_price: Buy 4, each costs $0.76 instead of $0.80
  -- bundle_free: Buy products X+Y, get product Z free
  -- coupon: Requires coupon code
  -- loyalty: Requires loyalty card/stickers
  promotion_type VARCHAR(30) NOT NULL CHECK (promotion_type IN (
    'percentage',
    'fixed_amount',
    'buy_x_get_y',
    'bulk_price',
    'bundle_free',
    'coupon',
    'loyalty'
  )),

  -- Store association (which store has this promotion)
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  store_name VARCHAR(255),

  -- Validity dates (null means unknown/indefinite)
  start_date DATE,
  end_date DATE,
  is_indefinite BOOLEAN DEFAULT false,

  -- Promotion details (varies by type, stored as JSONB)
  -- percentage: { "discount_percent": 15 }
  -- fixed_amount: { "original_price": 6.99, "promo_price": 4.99 } or { "discount_amount": 2.00 }
  -- buy_x_get_y: { "buy_quantity": 2, "get_quantity": 1, "pay_quantity": 2 } // 3x2
  -- bulk_price: { "min_quantity": 4, "unit_price": 0.76, "regular_price": 0.80 }
  -- bundle_free: { "required_products": ["uuid1", "uuid2"], "free_product_id": "uuid3" }
  -- coupon: { "coupon_code": "SUMMER20", "discount_percent": 20 } or { "discount_amount": 5 }
  -- loyalty: { "stickers_required": 10, "discount_percent": 50 }
  details JSONB NOT NULL DEFAULT '{}',

  -- Contribution tracking
  contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Verification status
  -- pending: awaiting moderation
  -- verified: confirmed by moderator
  -- unverified: user-contributed, not yet reviewed (still usable with warning)
  -- rejected: rejected by moderator
  -- expired: past end_date
  status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (status IN (
    'pending',
    'verified',
    'unverified',
    'rejected',
    'expired'
  )),

  -- Moderation
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Verification count (crowdsourcing: how many users confirmed this promo works)
  verification_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROMOTION_PRODUCTS TABLE
-- Links promotions to products (many-to-many)
-- =====================================================
CREATE TABLE IF NOT EXISTS promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Role in the promotion
  -- 'main': the product that has the promotion
  -- 'required': required product in bundle
  -- 'free': the free product in bundle
  role VARCHAR(20) NOT NULL DEFAULT 'main' CHECK (role IN ('main', 'required', 'free')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint to avoid duplicates
  UNIQUE(promotion_id, product_id, role)
);

-- =====================================================
-- PROMOTION_VERIFICATIONS TABLE
-- Track user verifications of promotions
-- =====================================================
CREATE TABLE IF NOT EXISTS promotion_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Did the promotion work?
  confirmed BOOLEAN NOT NULL,
  comment TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One verification per user per promotion
  UNIQUE(promotion_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for active promotions by store
CREATE INDEX IF NOT EXISTS idx_promotions_store_status
  ON promotions(store_id, status)
  WHERE status IN ('verified', 'unverified');

-- Index for promotions by type
CREATE INDEX IF NOT EXISTS idx_promotions_type
  ON promotions(promotion_type);

-- Index for active promotions by date
CREATE INDEX IF NOT EXISTS idx_promotions_dates
  ON promotions(start_date, end_date)
  WHERE status IN ('verified', 'unverified');

-- Index for pending promotions (moderation queue)
CREATE INDEX IF NOT EXISTS idx_promotions_pending
  ON promotions(created_at)
  WHERE status = 'pending';

-- Index for promotion_products by product
CREATE INDEX IF NOT EXISTS idx_promotion_products_product
  ON promotion_products(product_id);

-- Index for promotion_products by promotion
CREATE INDEX IF NOT EXISTS idx_promotion_products_promotion
  ON promotion_products(promotion_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if a promotion is currently active
CREATE OR REPLACE FUNCTION is_promotion_active(p_promotion promotions)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check status first
  IF p_promotion.status NOT IN ('verified', 'unverified') THEN
    RETURN false;
  END IF;

  -- If indefinite, it's active
  IF p_promotion.is_indefinite THEN
    RETURN true;
  END IF;

  -- Check date range
  IF p_promotion.start_date IS NOT NULL AND p_promotion.start_date > CURRENT_DATE THEN
    RETURN false;
  END IF;

  IF p_promotion.end_date IS NOT NULL AND p_promotion.end_date < CURRENT_DATE THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get active promotions for a product
CREATE OR REPLACE FUNCTION get_product_promotions(p_product_id UUID, p_store_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  promotion_type VARCHAR(30),
  store_id UUID,
  store_name VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_indefinite BOOLEAN,
  details JSONB,
  status VARCHAR(20),
  verification_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.name,
    p.description,
    p.promotion_type,
    p.store_id,
    p.store_name,
    p.start_date,
    p.end_date,
    p.is_indefinite,
    p.details,
    p.status,
    p.verification_count
  FROM promotions p
  INNER JOIN promotion_products pp ON p.id = pp.promotion_id
  WHERE pp.product_id = p_product_id
    AND pp.role IN ('main', 'required')
    AND p.status IN ('verified', 'unverified')
    AND (p.is_indefinite = true
         OR (p.start_date IS NULL OR p.start_date <= CURRENT_DATE)
         AND (p.end_date IS NULL OR p.end_date >= CURRENT_DATE))
    AND (p_store_id IS NULL OR p.store_id = p_store_id)
  ORDER BY
    CASE WHEN p.status = 'verified' THEN 0 ELSE 1 END,
    p.verification_count DESC,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get pending promotions for moderation
CREATE OR REPLACE FUNCTION get_pending_promotions(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  promotion_type VARCHAR(30),
  store_name VARCHAR(255),
  details JSONB,
  contributor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  product_names TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.promotion_type,
    p.store_name,
    p.details,
    p.contributor_id,
    p.created_at,
    ARRAY_AGG(pr.name) as product_names
  FROM promotions p
  LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
  LEFT JOIN products pr ON pp.product_id = pr.id
  WHERE p.status = 'pending'
  GROUP BY p.id
  ORDER BY p.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to verify a promotion
CREATE OR REPLACE FUNCTION verify_promotion(
  p_promotion_id UUID,
  p_user_id UUID,
  p_confirmed BOOLEAN,
  p_comment TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update verification
  INSERT INTO promotion_verifications (promotion_id, user_id, confirmed, comment)
  VALUES (p_promotion_id, p_user_id, p_confirmed, p_comment)
  ON CONFLICT (promotion_id, user_id)
  DO UPDATE SET confirmed = p_confirmed, comment = p_comment;

  -- Update verification count
  UPDATE promotions
  SET verification_count = (
    SELECT COUNT(*) FROM promotion_verifications
    WHERE promotion_id = p_promotion_id AND confirmed = true
  )
  WHERE id = p_promotion_id;

  -- Auto-verify if enough confirmations (threshold: 3)
  UPDATE promotions
  SET status = 'verified'
  WHERE id = p_promotion_id
    AND status = 'unverified'
    AND verification_count >= 3;
END;
$$ LANGUAGE plpgsql;

-- Function to approve a promotion (moderator action)
CREATE OR REPLACE FUNCTION approve_promotion(
  p_promotion_id UUID,
  p_reviewer_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE promotions
  SET
    status = 'verified',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_promotion_id;

  -- Award reputation to contributor
  UPDATE user_roles
  SET
    reputation_score = reputation_score + 5,
    contributions_approved = contributions_approved + 1
  WHERE user_id = (SELECT contributor_id FROM promotions WHERE id = p_promotion_id);
END;
$$ LANGUAGE plpgsql;

-- Function to reject a promotion (moderator action)
CREATE OR REPLACE FUNCTION reject_promotion(
  p_promotion_id UUID,
  p_reviewer_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE promotions
  SET
    status = 'rejected',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_promotion_id;

  -- Decrease reputation for contributor
  UPDATE user_roles
  SET
    reputation_score = GREATEST(0, reputation_score - 2),
    contributions_rejected = contributions_rejected + 1
  WHERE user_id = (SELECT contributor_id FROM promotions WHERE id = p_promotion_id);
END;
$$ LANGUAGE plpgsql;

-- Function to expire old promotions (can be run periodically)
CREATE OR REPLACE FUNCTION expire_old_promotions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE promotions
  SET status = 'expired', updated_at = NOW()
  WHERE status IN ('verified', 'unverified')
    AND is_indefinite = false
    AND end_date IS NOT NULL
    AND end_date < CURRENT_DATE;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_verifications ENABLE ROW LEVEL SECURITY;

-- Promotions: Everyone can view active/verified/unverified promotions
CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  USING (status IN ('verified', 'unverified') OR contributor_id = auth.uid());

-- Promotions: Authenticated users can create promotions
CREATE POLICY "Authenticated users can create promotions"
  ON promotions FOR INSERT
  TO authenticated
  WITH CHECK (contributor_id = auth.uid());

-- Promotions: Contributors can update their own pending promotions
CREATE POLICY "Contributors can update own pending promotions"
  ON promotions FOR UPDATE
  TO authenticated
  USING (contributor_id = auth.uid() AND status IN ('pending', 'unverified'))
  WITH CHECK (contributor_id = auth.uid());

-- Promotions: Moderators can update any promotion
CREATE POLICY "Moderators can update promotions"
  ON promotions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('moderator', 'admin')
    )
  );

-- Promotion products: Same as promotions
CREATE POLICY "Anyone can view promotion products"
  ON promotion_products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add promotion products"
  ON promotion_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM promotions
      WHERE id = promotion_id
      AND contributor_id = auth.uid()
    )
  );

-- Verifications: Users can verify promotions
CREATE POLICY "Users can view verifications"
  ON promotion_verifications FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can verify promotions"
  ON promotion_verifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own verifications"
  ON promotion_verifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at on promotions
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE promotions IS 'Stores all types of promotions and discounts contributed by users';
COMMENT ON TABLE promotion_products IS 'Links promotions to products (many-to-many relationship)';
COMMENT ON TABLE promotion_verifications IS 'Tracks user verifications of promotions';
COMMENT ON COLUMN promotions.promotion_type IS 'Type: percentage, fixed_amount, buy_x_get_y, bulk_price, bundle_free, coupon, loyalty';
COMMENT ON COLUMN promotions.details IS 'JSONB with type-specific details (discount_percent, buy_quantity, etc.)';
COMMENT ON COLUMN promotions.status IS 'unverified = user-contributed not reviewed, verified = confirmed by mod, pending = awaiting review';
