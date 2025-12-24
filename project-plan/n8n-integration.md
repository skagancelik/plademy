# n8n Integration Guide

## Overview

n8n automates content generation and insertion into Supabase. Each workflow generates content (via AI) and inserts it into the database using Supabase REST API.

---

## Workflow Structure

### 1. Content Generation
- AI node (OpenAI, Anthropic, etc.) generates content
- Output includes: title, description, excerpt, content, keypoints, FAQs, etc.

### 2. Image Generation (Optional)
- DALL-E or similar generates cover image
- Image URL stored in `cover_image_url`

### 3. Database Insert
- HTTP Request node → Supabase REST API
- Uses `SERVICE_ROLE` key for full access

---

## Supabase API Endpoint

### Resources

```http
POST https://[project-ref].supabase.co/rest/v1/resources
Headers:
  apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}
  Content-Type: application/json
  Prefer: return=minimal
Body:
{
  "slug": "article-slug",
  "language": "en",
  "title": "Article Title",
  "description": "Meta description for SEO",
  "excerpt": "Short excerpt for preview",
  "content": "# Full Markdown Content\n\n...",
  "keypoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "category": "mentoring-coaching",
  "faqs": [
    {
      "question": "Question 1?",
      "answer": "Answer 1"
    },
    {
      "question": "Question 2?",
      "answer": "Answer 2"
    },
    // ... up to 7 FAQs
  ],
  "cover_image_url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "is_published": true
}
```

### Programs

```http
POST https://[project-ref].supabase.co/rest/v1/programs
Headers:
  apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}
  Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}
  Content-Type: application/json
  Prefer: return=minimal
Body:
{
  "slug": "program-slug",
  "language": "en",
  "title": "Program Title",
  "description": "Meta description",
  "excerpt": "Short excerpt",
  "content": "# Full Markdown Content\n\n...",
  "keypoints": ["Point 1", "Point 2", "Point 3"],
  "goal": "Program goal description",
  "audience": "Target audience description",
  "duration": "6 weeks",
  "category": "talent-career-starter",
  "faqs": [
    {"question": "Q1", "answer": "A1"},
    // ... up to 7 FAQs
  ],
  "cover_image_url": "https://...",
  "citations": [
    {
      "url": "https://example.com",
      "title": "Example Title",
      "snippet": "Example snippet"
    }
  ],
  "is_published": true
}
```

---

## n8n Node Configuration

### HTTP Request Node

**Method:** POST  
**URL:** `https://[project-ref].supabase.co/rest/v1/resources`  
**Authentication:** None (key in headers)  
**Headers:**
```json
{
  "apikey": "{{$env.SUPABASE_SERVICE_ROLE_KEY}}",
  "Authorization": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}",
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
}
```

**Body:**
```json
{{ $json }}
```

---

## Environment Variables

n8n'de şu environment variable'ları ayarla:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://[project-ref].supabase.co
```

**ÖNEMLİ:** `SERVICE_ROLE_KEY` asla public'e expose etme!

---

## Content Fields

### Required Fields
- `slug` - URL slug (unique per language)
- `language` - 'en', 'fi', or 'sv'
- `title` - Content title
- `category` - Category ID (from categories table)
- `is_published` - true/false

### Optional Fields
- `description` - Meta description (SEO)
- `excerpt` - Short preview text
- `content` - Full Markdown content
- `keypoints` - Array of 3 strings
- `faqs` - Array of {question, answer} objects (max 7)
- `cover_image_url` - Image URL
- `citations` - Array of {url, title, snippet} objects (resources only)
- `goal` - Program goal (programs only)
- `audience` - Target audience (programs only)
- `duration` - Program duration, e.g., "6 weeks" (programs only)

---

## Category IDs

### Resource Categories
- `mentoring-coaching`
- `career-talent`
- `employee-experience`
- `hr-tech`
- `entrepreneurship`
- `community-management`

### Program Categories
- `talent-career-starter`
- `professional-development`
- `entrepreneurship-program`
- `leadership`
- `mentoring-program`
- `coaching-program`
- `erg`
- `dei`

---

## Multi-Language Content

Her içerik için 3 dilde ayrı kayıt oluştur:

1. **English** (`language: 'en'`)
2. **Finnish** (`language: 'fi'`)
3. **Swedish** (`language: 'sv'`)

Aynı `slug` kullanılabilir, `(slug, language)` unique constraint var.

---

## Error Handling

### Duplicate Key Error
Eğer aynı `(slug, language)` kombinasyonu varsa:
- Update yap (PUT request) veya
- Farklı slug kullan

### RLS Policy Error
Eğer `ANON_KEY` kullanıyorsan:
- `SERVICE_ROLE_KEY` kullan (yazma için gerekli)

---

## Testing

### Test Workflow
1. Test içerik oluştur
2. Supabase'de kontrol et
3. Sitede görünür mü kontrol et (Edge SSR)
4. SEO meta tags kontrol et

### Manual Test
```bash
curl -X POST https://[project].supabase.co/rest/v1/resources \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-article",
    "language": "en",
    "title": "Test Article",
    "category": "mentoring-coaching",
    "is_published": true
  }'
```

---

## Automation

### Scheduled Workflow
- Her gün X içerik üret
- Her hafta Y program üret
- Otomatik publish veya draft olarak kaydet

### Trigger Options
- Schedule (cron)
- Webhook (manual trigger)
- External API call

---

## Best Practices

1. **Slug Generation:** URL-friendly, unique per language
2. **Content Quality:** AI-generated content'i review et
3. **Image URLs:** Valid, accessible URLs kullan
4. **FAQs:** 5-7 FAQ optimal
5. **Keypoints:** Tam 3 keypoint
6. **Publishing:** Test için `is_published: false`, sonra `true`

