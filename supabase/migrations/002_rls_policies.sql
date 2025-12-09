-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can read published resources
CREATE POLICY "Public can read published resources"
ON resources FOR SELECT
USING (is_published = true);

-- Public can read published programs
CREATE POLICY "Public can read published programs"
ON programs FOR SELECT
USING (is_published = true);

-- Public can read all categories
CREATE POLICY "Public can read categories"
ON categories FOR SELECT
USING (true);

-- Service role has full access to resources (for n8n)
CREATE POLICY "Service role full access resources"
ON resources FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Service role has full access to programs (for n8n)
CREATE POLICY "Service role full access programs"
ON programs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Service role has full access to categories (for n8n)
CREATE POLICY "Service role full access categories"
ON categories FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

