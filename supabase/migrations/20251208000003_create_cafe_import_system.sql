-- =====================================================
-- CAFE Import System Migration
-- Stores imported electronic invoices from DGI Panama
-- =====================================================

-- Create table for imported invoices
CREATE TABLE IF NOT EXISTS imported_invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- CUFE and invoice identification
  cufe text NOT NULL,
  invoice_number text NOT NULL,
  point_of_sale text,

  -- Dates
  issue_date timestamp with time zone NOT NULL,
  authorization_date timestamp with time zone,
  authorization_protocol text,

  -- Emitter (Store/Business) information
  emitter_ruc text NOT NULL,
  emitter_name text NOT NULL,
  emitter_dv text,
  emitter_branch text,
  emitter_address text,
  emitter_phone text,

  -- Receiver (Customer) information
  receiver_ruc text,
  receiver_name text,
  receiver_type text,

  -- Totals
  subtotal decimal(12, 2) NOT NULL DEFAULT 0,
  total_tax decimal(12, 2) NOT NULL DEFAULT 0,
  grand_total decimal(12, 2) NOT NULL DEFAULT 0,
  taxable_amount_7 decimal(12, 2) DEFAULT 0,
  taxable_amount_10 decimal(12, 2) DEFAULT 0,
  taxable_amount_15 decimal(12, 2) DEFAULT 0,
  exempt_amount decimal(12, 2) DEFAULT 0,
  discount_amount decimal(12, 2) DEFAULT 0,

  -- Payment information
  payment_method text,
  amount_paid decimal(12, 2),
  change_amount decimal(12, 2),

  -- Item count
  item_count integer NOT NULL DEFAULT 0,

  -- Full invoice data as JSON (for reference and re-import)
  invoice_data jsonb NOT NULL,

  -- Link to shopping session created from this invoice
  shopping_session_id uuid REFERENCES shopping_sessions(id) ON DELETE SET NULL,

  -- Metadata
  source_url text,
  raw_xml text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create table for imported invoice items (individual lines)
CREATE TABLE IF NOT EXISTS imported_invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  imported_invoice_id uuid REFERENCES imported_invoices(id) ON DELETE CASCADE NOT NULL,

  -- Line information
  line_number integer NOT NULL,
  description text NOT NULL,
  quantity decimal(12, 4) NOT NULL DEFAULT 1,
  unit text DEFAULT 'UND',

  -- Prices
  unit_price decimal(12, 4) NOT NULL,
  total_price decimal(12, 2) NOT NULL,

  -- Tax information
  tax_code text NOT NULL DEFAULT '1', -- DGI tax code (0, 1, 2, 3)
  tax_rate decimal(5, 2) NOT NULL DEFAULT 7,
  tax_amount decimal(12, 2) NOT NULL DEFAULT 0,

  -- Product matching (optional - linked to our products table)
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_code text, -- Barcode or internal code from invoice

  -- Was this item imported to shopping list?
  imported_to_shopping boolean DEFAULT false,
  shopping_item_id uuid REFERENCES shopping_items(id) ON DELETE SET NULL,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for user's imported invoices
CREATE INDEX IF NOT EXISTS idx_imported_invoices_user_id
  ON imported_invoices(user_id);

-- Index for CUFE lookups (unique per user to allow re-import)
CREATE UNIQUE INDEX IF NOT EXISTS idx_imported_invoices_user_cufe
  ON imported_invoices(user_id, cufe);

-- Index for emitter RUC (to find invoices by store)
CREATE INDEX IF NOT EXISTS idx_imported_invoices_emitter_ruc
  ON imported_invoices(emitter_ruc);

-- Index for issue date (for history queries)
CREATE INDEX IF NOT EXISTS idx_imported_invoices_issue_date
  ON imported_invoices(issue_date DESC);

-- Index for shopping session link
CREATE INDEX IF NOT EXISTS idx_imported_invoices_session_id
  ON imported_invoices(shopping_session_id);

-- Index for invoice items by invoice
CREATE INDEX IF NOT EXISTS idx_imported_invoice_items_invoice_id
  ON imported_invoice_items(imported_invoice_id);

-- Index for product matching
CREATE INDEX IF NOT EXISTS idx_imported_invoice_items_product_id
  ON imported_invoice_items(product_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE imported_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_invoice_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own imported invoices
CREATE POLICY "Users can view own imported invoices"
  ON imported_invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own imported invoices
CREATE POLICY "Users can insert own imported invoices"
  ON imported_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own imported invoices
CREATE POLICY "Users can update own imported invoices"
  ON imported_invoices FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own imported invoices
CREATE POLICY "Users can delete own imported invoices"
  ON imported_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Invoice items policies (via parent invoice)
CREATE POLICY "Users can view own imported invoice items"
  ON imported_invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM imported_invoices
      WHERE imported_invoices.id = imported_invoice_items.imported_invoice_id
      AND imported_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own imported invoice items"
  ON imported_invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM imported_invoices
      WHERE imported_invoices.id = imported_invoice_items.imported_invoice_id
      AND imported_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own imported invoice items"
  ON imported_invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM imported_invoices
      WHERE imported_invoices.id = imported_invoice_items.imported_invoice_id
      AND imported_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own imported invoice items"
  ON imported_invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM imported_invoices
      WHERE imported_invoices.id = imported_invoice_items.imported_invoice_id
      AND imported_invoices.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_imported_invoice_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_imported_invoices_updated_at ON imported_invoices;
CREATE TRIGGER trigger_imported_invoices_updated_at
  BEFORE UPDATE ON imported_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_imported_invoice_timestamp();

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Function to check if a CUFE has already been imported by the user
CREATE OR REPLACE FUNCTION check_cufe_imported(p_cufe text)
RETURNS TABLE (
  is_imported boolean,
  imported_invoice_id uuid,
  shopping_session_id uuid,
  imported_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    true as is_imported,
    ii.id as imported_invoice_id,
    ii.shopping_session_id,
    ii.created_at as imported_at
  FROM imported_invoices ii
  WHERE ii.user_id = auth.uid()
  AND ii.cufe = p_cufe
  LIMIT 1;

  -- If no rows returned, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::uuid, null::timestamp with time zone;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's imported invoices with summary
CREATE OR REPLACE FUNCTION get_imported_invoices_summary(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  cufe text,
  invoice_number text,
  emitter_name text,
  emitter_ruc text,
  issue_date timestamp with time zone,
  grand_total decimal,
  item_count integer,
  shopping_session_id uuid,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ii.id,
    ii.cufe,
    ii.invoice_number,
    ii.emitter_name,
    ii.emitter_ruc,
    ii.issue_date,
    ii.grand_total,
    ii.item_count,
    ii.shopping_session_id,
    ii.created_at
  FROM imported_invoices ii
  WHERE ii.user_id = auth.uid()
  ORDER BY ii.issue_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get import statistics for user
CREATE OR REPLACE FUNCTION get_import_statistics()
RETURNS TABLE (
  total_imports integer,
  total_amount decimal,
  total_items integer,
  unique_stores integer,
  first_import timestamp with time zone,
  last_import timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer as total_imports,
    COALESCE(SUM(ii.grand_total), 0)::decimal as total_amount,
    COALESCE(SUM(ii.item_count), 0)::integer as total_items,
    COUNT(DISTINCT ii.emitter_ruc)::integer as unique_stores,
    MIN(ii.created_at) as first_import,
    MAX(ii.created_at) as last_import
  FROM imported_invoices ii
  WHERE ii.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORE MATCHING (Optional - link emitters to stores)
-- =====================================================

-- Create a table to map emitter RUCs to our stores
CREATE TABLE IF NOT EXISTS store_ruc_mappings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  ruc text NOT NULL,
  dv text,
  branch_name text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,

  UNIQUE(store_id, ruc)
);

-- Index for RUC lookups
CREATE INDEX IF NOT EXISTS idx_store_ruc_mappings_ruc
  ON store_ruc_mappings(ruc);

-- Enable RLS (public read, admin write)
ALTER TABLE store_ruc_mappings ENABLE ROW LEVEL SECURITY;

-- Anyone can read store mappings
CREATE POLICY "Anyone can view store RUC mappings"
  ON store_ruc_mappings FOR SELECT
  USING (true);

-- Function to find store by emitter RUC
CREATE OR REPLACE FUNCTION find_store_by_ruc(p_ruc text)
RETURNS TABLE (
  store_id uuid,
  store_name text,
  is_verified boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as store_id,
    s.name as store_name,
    srm.is_verified
  FROM store_ruc_mappings srm
  JOIN stores s ON s.id = srm.store_id
  WHERE srm.ruc = p_ruc
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE imported_invoices IS 'Stores electronic invoices (CAFE) imported from DGI Panama';
COMMENT ON TABLE imported_invoice_items IS 'Individual line items from imported invoices';
COMMENT ON TABLE store_ruc_mappings IS 'Maps business RUCs to our stores table for automatic store matching';
COMMENT ON COLUMN imported_invoices.cufe IS 'Código Único de Factura Electrónica - unique identifier from DGI';
COMMENT ON COLUMN imported_invoices.invoice_data IS 'Full invoice data as JSON for reference and potential re-processing';
COMMENT ON COLUMN imported_invoice_items.tax_code IS 'DGI tax code: 0=Exempt, 1=7%, 2=10%, 3=15%';
