-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'fi', 'sv')),
  title TEXT NOT NULL,
  description TEXT,
  excerpt TEXT,
  content TEXT,
  keypoints TEXT[],
  category TEXT NOT NULL,
  faqs JSONB,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, language)
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'fi', 'sv')),
  title TEXT NOT NULL,
  description TEXT,
  excerpt TEXT,
  content TEXT,
  keypoints TEXT[],
  goal TEXT,
  audience TEXT,
  category TEXT NOT NULL,
  faqs JSONB,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, language)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('resource', 'program')),
  name_en TEXT NOT NULL,
  name_fi TEXT,
  name_sv TEXT,
  description_en TEXT,
  description_fi TEXT,
  description_sv TEXT,
  slug TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resources_lang_cat ON resources(language, category);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_slug_lang ON resources(slug, language);
CREATE INDEX IF NOT EXISTS idx_programs_lang_cat ON programs(language, category);
CREATE INDEX IF NOT EXISTS idx_programs_published ON programs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_programs_slug_lang ON programs(slug, language);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

