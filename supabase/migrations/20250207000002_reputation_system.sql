-- Migration: User Reputation System
-- Description: Adds reputation scoring based on contribution quality
-- Date: 2025-12-07

-- ============================================================================
-- ALTER TABLE: Add reputation_score to user_roles
-- ============================================================================
ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS contributions_approved INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS contributions_rejected INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_reputation_update TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint for reputation score (0-1000)
ALTER TABLE user_roles
ADD CONSTRAINT reputation_score_range CHECK (reputation_score >= 0 AND reputation_score <= 1000);

-- Add comment
COMMENT ON COLUMN user_roles.reputation_score IS 'User reputation score based on contribution quality (0-1000)';
COMMENT ON COLUMN user_roles.contributions_approved IS 'Total number of approved contributions';
COMMENT ON COLUMN user_roles.contributions_rejected IS 'Total number of rejected contributions';
COMMENT ON COLUMN user_roles.last_reputation_update IS 'Last time reputation was updated';

-- ============================================================================
-- FUNCTION: Update user reputation
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_reputation(
  p_user_id UUID,
  p_contribution_status TEXT,
  p_contribution_type TEXT
)
RETURNS VOID AS $$
DECLARE
  current_score INTEGER;
  score_change INTEGER := 0;
BEGIN
  -- Get current reputation score
  SELECT reputation_score INTO current_score
  FROM user_roles
  WHERE user_id = p_user_id;

  -- If user doesn't have a role entry yet, create one with default role
  IF NOT FOUND THEN
    INSERT INTO user_roles (user_id, role, reputation_score, contributions_approved, contributions_rejected)
    VALUES (p_user_id, 'user', 0, 0, 0);
    current_score := 0;
  END IF;

  -- Calculate score change based on contribution status and type
  IF p_contribution_status = 'approved' THEN
    -- Base points for approval
    score_change := 5;

    -- Bonus points for high-priority contributions
    IF p_contribution_type = 'barcode' THEN
      score_change := score_change + 3; -- Most important field
    ELSIF p_contribution_type = 'image' THEN
      score_change := score_change + 2;
    ELSIF p_contribution_type = 'price' THEN
      score_change := score_change + 2;
    END IF;

    -- Update approved count
    UPDATE user_roles
    SET
      contributions_approved = contributions_approved + 1,
      reputation_score = LEAST(current_score + score_change, 1000), -- Cap at 1000
      last_reputation_update = NOW()
    WHERE user_id = p_user_id;

  ELSIF p_contribution_status = 'rejected' THEN
    -- Penalty for rejection (smaller than reward)
    score_change := -2;

    -- Update rejected count
    UPDATE user_roles
    SET
      contributions_rejected = contributions_rejected + 1,
      reputation_score = GREATEST(current_score + score_change, 0), -- Floor at 0
      last_reputation_update = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION update_user_reputation IS 'Updates user reputation based on contribution approval/rejection';

-- ============================================================================
-- FUNCTION: Auto-approve contributions for high reputation users
-- ============================================================================
CREATE OR REPLACE FUNCTION should_auto_approve_contribution(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_score INTEGER;
BEGIN
  -- Get user reputation score
  SELECT reputation_score INTO user_score
  FROM user_roles
  WHERE user_id = p_user_id;

  -- If no score found, don't auto-approve
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Auto-approve if reputation >= 100
  RETURN user_score >= 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION should_auto_approve_contribution IS 'Returns true if user has high enough reputation for auto-approval (>= 100)';

-- ============================================================================
-- FUNCTION: Get reputation badge/level
-- ============================================================================
CREATE OR REPLACE FUNCTION get_reputation_badge(p_reputation_score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_reputation_score >= 500 THEN
    RETURN 'expert'; -- Gold badge
  ELSIF p_reputation_score >= 250 THEN
    RETURN 'trusted'; -- Silver badge
  ELSIF p_reputation_score >= 100 THEN
    RETURN 'contributor'; -- Bronze badge
  ELSIF p_reputation_score >= 50 THEN
    RETURN 'helper'; -- Green badge
  ELSE
    RETURN 'beginner'; -- Gray badge
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment
COMMENT ON FUNCTION get_reputation_badge IS 'Returns reputation badge level based on score';

-- ============================================================================
-- FUNCTION: Get user reputation details
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_reputation(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  reputation_score INTEGER,
  badge TEXT,
  contributions_approved INTEGER,
  contributions_rejected INTEGER,
  success_rate NUMERIC,
  can_auto_approve BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.user_id,
    ur.reputation_score,
    get_reputation_badge(ur.reputation_score) AS badge,
    ur.contributions_approved,
    ur.contributions_rejected,
    CASE
      WHEN (ur.contributions_approved + ur.contributions_rejected) > 0 THEN
        ROUND(
          (ur.contributions_approved::NUMERIC / (ur.contributions_approved + ur.contributions_rejected)) * 100,
          2
        )
      ELSE
        0
    END AS success_rate,
    should_auto_approve_contribution(ur.user_id) AS can_auto_approve
  FROM user_roles ur
  WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_user_reputation IS 'Returns complete reputation details for a user';

-- ============================================================================
-- FUNCTION: Get top contributors (leaderboard)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_top_contributors(
  p_limit INTEGER DEFAULT 10,
  p_min_contributions INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  reputation_score INTEGER,
  badge TEXT,
  contributions_approved INTEGER,
  contributions_rejected INTEGER,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.user_id,
    au.email,
    au.raw_user_meta_data->>'full_name' AS full_name,
    ur.reputation_score,
    get_reputation_badge(ur.reputation_score) AS badge,
    ur.contributions_approved,
    ur.contributions_rejected,
    CASE
      WHEN (ur.contributions_approved + ur.contributions_rejected) > 0 THEN
        ROUND(
          (ur.contributions_approved::NUMERIC / (ur.contributions_approved + ur.contributions_rejected)) * 100,
          2
        )
      ELSE
        0
    END AS success_rate
  FROM user_roles ur
  INNER JOIN auth.users au ON au.id = ur.user_id
  WHERE (ur.contributions_approved + ur.contributions_rejected) >= p_min_contributions
  ORDER BY ur.reputation_score DESC, ur.contributions_approved DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_top_contributors IS 'Returns leaderboard of top contributors by reputation';

-- ============================================================================
-- TRIGGER: Update reputation when contribution is reviewed
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_update_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update reputation when status changes to approved or rejected
  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    PERFORM update_user_reputation(
      NEW.contributor_id,
      NEW.status,
      NEW.contribution_type
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on product_contributions
DROP TRIGGER IF EXISTS update_reputation_on_review ON product_contributions;
CREATE TRIGGER update_reputation_on_review
  AFTER UPDATE ON product_contributions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_reputation();

-- Add comment
COMMENT ON TRIGGER update_reputation_on_review ON product_contributions IS 'Automatically updates user reputation when contribution is reviewed';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION update_user_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION should_auto_approve_contribution TO authenticated;
GRANT EXECUTE ON FUNCTION get_reputation_badge TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_contributors TO authenticated;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_roles_reputation ON user_roles(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================================
-- TESTING QUERIES (commented out - for manual testing)
-- ============================================================================

-- Test reputation calculation
-- SELECT * FROM get_user_reputation('user-uuid-here');

-- Test leaderboard
-- SELECT * FROM get_top_contributors(10, 1);

-- Test auto-approve check
-- SELECT should_auto_approve_contribution('user-uuid-here');

-- Manual reputation update test
-- SELECT update_user_reputation('user-uuid-here', 'approved', 'barcode');
