-- Add citations column to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT NULL;

-- Add index for citations queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_resources_citations ON resources USING GIN (citations);

-- Add comment
COMMENT ON COLUMN resources.citations IS 'Citations from Perplexity API research results, stored as JSONB array of citation objects with url, title, etc.';
