-- Migration: Create Shopping Lists Tables
-- Creates tables for shopping sessions and items

-- Create shopping_sessions table
CREATE TABLE IF NOT EXISTS shopping_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  store_name TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create shopping_items table
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES shopping_sessions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unidad',
  subtotal DECIMAL(10, 2) NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  store_name TEXT,
  purchased BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id ON shopping_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_status ON shopping_sessions(status);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_date ON shopping_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_items_session_id ON shopping_items(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_purchased ON shopping_items(session_id, purchased);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_shopping_sessions_updated_at
  BEFORE UPDATE ON shopping_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE shopping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopping_sessions
CREATE POLICY "Users can view their own shopping sessions"
  ON shopping_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping sessions"
  ON shopping_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping sessions"
  ON shopping_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping sessions"
  ON shopping_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for shopping_items
CREATE POLICY "Users can view items in their shopping sessions"
  ON shopping_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their shopping sessions"
  ON shopping_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their shopping sessions"
  ON shopping_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their shopping sessions"
  ON shopping_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_sessions
      WHERE shopping_sessions.id = shopping_items.session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE shopping_sessions IS 'Shopping sessions for tracking user shopping lists';
COMMENT ON TABLE shopping_items IS 'Items in shopping sessions';
COMMENT ON COLUMN shopping_sessions.store_name IS 'Cached store name for display (optional)';
COMMENT ON COLUMN shopping_items.store_name IS 'Store name where item was found';
COMMENT ON COLUMN shopping_items.purchased IS 'Whether item has been purchased during shopping';
COMMENT ON COLUMN shopping_items.subtotal IS 'Calculated subtotal (price * quantity)';
