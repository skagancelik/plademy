# Database Schema

## Tables

### resources

Stores resource content (articles, guides, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL slug (unique per language) |
| language | TEXT | 'en', 'fi', or 'sv' |
| title | TEXT | Resource title |
| description | TEXT | Meta description |
| excerpt | TEXT | Short excerpt |
| content | TEXT | Full content (Markdown) |
| keypoints | TEXT[] | Array of 3 key points |
| category | TEXT | Category ID (FK to categories) |
| faqs | JSONB | Array of {question, answer} objects |
| cover_image_url | TEXT | Cover image URL |
| is_published | BOOLEAN | Publication status |
| published_at | TIMESTAMPTZ | Publication date |
| created_at | TIMESTAMPTZ | Creation date |

**Indexes:**
- `(language, category)`
- `(is_published, published_at DESC)`
- `(slug, language)` (unique)

---

### programs

Stores program content

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL slug (unique per language) |
| language | TEXT | 'en', 'fi', or 'sv' |
| title | TEXT | Program title |
| description | TEXT | Meta description |
| excerpt | TEXT | Short excerpt |
| content | TEXT | Full content (Markdown) |
| keypoints | TEXT[] | Array of 3 key points |
| goal | TEXT | Program goal |
| audience | TEXT | Target audience |
| category | TEXT | Category ID (FK to categories) |
| faqs | JSONB | Array of {question, answer} objects |
| cover_image_url | TEXT | Cover image URL |
| is_published | BOOLEAN | Publication status |
| published_at | TIMESTAMPTZ | Publication date |
| created_at | TIMESTAMPTZ | Creation date |

**Indexes:**
- `(language, category)`
- `(is_published, published_at DESC)`
- `(slug, language)` (unique)

---

### categories

Stores category information (multilingual)

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (e.g., 'mentoring-coaching') |
| type | TEXT | 'resource' or 'program' |
| name_en | TEXT | English name |
| name_fi | TEXT | Finnish name |
| name_sv | TEXT | Swedish name |
| description_en | TEXT | English description |
| description_fi | TEXT | Finnish description |
| description_sv | TEXT | Swedish description |
| slug | TEXT | URL slug |
| sort_order | INT | Display order |

**Indexes:**
- `(type)`

---

## Row Level Security (RLS)

### Resources
- **Public SELECT:** Only `is_published = true`
- **Service Role:** Full access (for n8n)

### Programs
- **Public SELECT:** Only `is_published = true`
- **Service Role:** Full access (for n8n)

### Categories
- **Public SELECT:** All categories
- **Service Role:** Full access (for n8n)

---

## Migrations

1. `001_initial_schema.sql` - Create tables and indexes
2. `002_rls_policies.sql` - Enable RLS and create policies
3. `003_seed_categories.sql` - Seed category data

---

## n8n Integration

n8n uses `SERVICE_ROLE` key to insert/update content:

```http
POST https://[project].supabase.co/rest/v1/resources
Headers:
  apikey: [SERVICE_ROLE_KEY]
  Authorization: Bearer [SERVICE_ROLE_KEY]
  Content-Type: application/json
Body:
{
  "slug": "article-slug",
  "language": "en",
  "title": "Article Title",
  "description": "Meta description",
  "excerpt": "Short excerpt",
  "content": "Full markdown content",
  "keypoints": ["Point 1", "Point 2", "Point 3"],
  "category": "mentoring-coaching",
  "faqs": [
    {"question": "Q1", "answer": "A1"},
    ...
  ],
  "cover_image_url": "https://...",
  "is_published": true
}
```

---

## Example Queries

### Get published resources for a language
```sql
SELECT * FROM resources
WHERE language = 'en'
  AND is_published = true
ORDER BY published_at DESC
LIMIT 20;
```

### Get resources by category
```sql
SELECT * FROM resources
WHERE language = 'en'
  AND category = 'mentoring-coaching'
  AND is_published = true
ORDER BY published_at DESC;
```

### Get single resource
```sql
SELECT * FROM resources
WHERE slug = 'article-slug'
  AND language = 'en'
  AND is_published = true
LIMIT 1;
```

