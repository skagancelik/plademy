# Plademy Project Information

## Genel Bakış

Plademy, Human-Centered, AI-Powered Learning & Development Platform. Astro framework'ü ile hybrid rendering (SSG + Edge SSR) kullanarak yüksek performanslı, çok dilli bir içerik platformu.

---

## Astro Kullanımı

### Hybrid Rendering Stratejisi

**Statik Sayfalar (SSG):**
- Homepage (`/`)
- Integrations (`/integrations`)
- Contact (`/contact`)
- Privacy (`/privacy`)
- Start (`/start`)
- Search (`/search`)

**Edge SSR Sayfalar:**
- Resources (`/resources/*`, `/resurssit/*`)
- Programs (`/programs/*`, `/ohjelmat/*`)
- Dinamik içerik Supabase'den geliyor

### Astro Config (`astro.config.mjs`)

```javascript
export default defineConfig({
  output: 'hybrid', // SSG + SSR
  adapter: netlify({
    edgeMiddleware: true, // Edge SSR için
  }),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) => {
        // Sadece statik sayfaları sitemap'e ekle
        return !page.includes('/resources/') && !page.includes('/programs/');
      },
    }),
  ],
  site: 'https://plademy.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fi', 'sv'],
    routing: { prefixDefaultLocale: false },
  },
});
```

**ÖNEMLİ:** 
- ❌ **Image domains konfigürasyonu EKLEMEYİN:** `image: { domains: [...] }` Netlify deployment'ında hata veriyor
- ✅ **Astro adapter experimental "assets" uyarısı:** Bilgilendirme amaçlı, build'i etkilemiyor
- ❌ **IIFE pattern'leri template'de kullanmayın:** `(() => { ... })()` pattern'leri esbuild tarafından parse edilemez, frontmatter'a taşıyın
- ❌ **Karmaşık expression'lar JSX attribute'larında kullanmayın:** Nested ternary, template literals gibi karmaşık expression'lar JSX attribute'larında kullanılmamalı, frontmatter'da değişkene taşınmalı

### Prerender Kontrolü

**Statik sayfalar:**
```astro
export const prerender = true; // veya default (true)
```

**Edge SSR sayfalar:**
```astro
export const prerender = false; // Edge SSR için
```

### Path Aliases

`tsconfig.json` içinde:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@layouts/` → `src/layouts/`
- `@lib/` → `src/lib/`

---

## Supabase Kullanımı

### Client Setup (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**ÖNEMLİ:** Sadece `PUBLIC_SUPABASE_ANON_KEY` kullanıyoruz. `SERVICE_ROLE_KEY` sadece n8n'de kullanılır, asla frontend'de kullanılmaz!

### RLS (Row Level Security)

**Public Access:**
- Sadece `is_published = true` olan kayıtlar okunabilir
- INSERT, UPDATE, DELETE yasak

**Service Role (n8n):**
- Tüm işlemler yapılabilir
- `SERVICE_ROLE_KEY` ile authentication

### Veri Çekme Pattern'i (OPTİMİZE EDİLDİ - 2025)

**⚠️ ESKİ PATTERN (KULLANILMIYOR - Egress Limit Sorununa Neden Oluyordu):**
```typescript
// ❌ YANLIŞ: Tüm kayıtları çekip client-side filtreleme
const { data: resources } = await supabase
  .from('resources')
  .select('*')
  .eq('language', lang)
  .limit(100);

const resource = resources.find(r => r.slug === slug);
```

**✅ YENİ PATTERN (OPTİMİZE):**
```typescript
// ✅ DOĞRU: Direct slug query - sadece ilgili kaydı çek
const { data: resource } = await supabase
  .from('resources')
  .select('*') // Detail pages için tüm alanlar gerekli
  .eq('slug', slug)
  .eq('language', lang)
  .eq('is_published', true)
  .single();
```

**Liste Sayfaları için Selective Fields:**
```typescript
// ✅ DOĞRU: Sadece gerekli alanları çek
const { data: resources } = await supabase
  .from('resources')
  .select('id, slug, title, excerpt, cover_image_url, category, published_at')
  .eq('language', lang)
  .eq('is_published', true)
  .order('published_at', { ascending: false })
  .range(offset, offset + pageSize - 1);
```

**Optimizasyon Prensipleri:**
1. **Direct Queries:** Slug bazlı direkt sorgular (client-side filtering yok)
2. **Selective Fields:** Liste sayfalarında sadece gerekli alanlar (`select('id, slug, title, ...')`)
3. **Server-side Pagination:** `limit()` ve `range()` ile sayfalama
4. **Count Queries:** `select('id', { count: 'exact', head: true })` formatı
5. **Categories:** Selective fields kullanımı (`id, slug, name_en, name_fi, name_sv, type, sort_order`)
6. **Helper Functions:** Merkezi helper fonksiyonlar (`getResourceBySlug`, `getProgramsList`, etc.)
7. **Limit Optimizasyonu:** Sadece gösterilecek kadar kayıt çek (limit = gösterilecek maksimum kayıt sayısı)
8. **Server-side Filtering:** Mümkün olduğunca database'de filtreleme, URL query params ile
9. **Gereksiz Query'ler:** Kullanılmayan query'leri kaldır

### Tablolar

**resources:**
- `id`, `slug`, `language`, `title`, `description`, `excerpt`, `content`
- `keypoints` (TEXT[]), `category`, `faqs` (JSONB)
- `cover_image_url`, `citations` (JSONB) - **YENİ: citations eklendi**
- `is_published`, `published_at`, `created_at`

**programs:**
- `id`, `slug`, `language`, `title`, `description`, `excerpt`, `content`
- `keypoints` (TEXT[]), `goal`, `audience`, `duration` - **YENİ: duration eklendi**
- `category`, `faqs` (JSONB), `cover_image_url`
- `is_published`, `published_at`, `created_at`

**categories:**
- `id`, `type` ('resource' | 'program')
- `name_en`, `name_fi`, `name_sv`
- `description_en`, `description_fi`, `description_sv`
- `slug`, `sort_order`

### Helper Functions (`src/lib/supabase.ts`)

**Selective Field Constants:**
```typescript
export const RESOURCE_LIST_FIELDS = 'id, slug, title, excerpt, cover_image_url, category, published_at';
export const PROGRAM_LIST_FIELDS = 'id, slug, title, excerpt, cover_image_url, category, published_at, goal, duration, audience';
export const SEARCH_FIELDS = 'id, slug, title, description, excerpt';
export const CATEGORY_BASIC_FIELDS = 'id, slug, name_en, name_fi, name_sv, type, sort_order';
export const CATEGORY_FULL_FIELDS = 'id, slug, name_en, name_fi, name_sv, description_en, description_fi, description_sv, type, sort_order';
```

**Helper Functions:**
- `getResourceBySlug(slug, lang)` - Direct slug query, tüm alanlar
- `getProgramBySlug(slug, lang)` - Direct slug query, tüm alanlar
- `getResourcesList(lang, page, pageSize, categoryId?)` - Paginated list, selective fields
- `getProgramsList(lang, page, pageSize, categoryId?)` - Paginated list, selective fields
- `getCategoryByIdOrSlug(identifier, type)` - Category lookup with fallback

---

## Local Development & Testing

### Setup

```bash
# 1. Dependencies yükle
npm install

# 2. Environment variables
cp .env.example .env
# .env dosyasını düzenle:
# PUBLIC_SUPABASE_URL=...
# PUBLIC_SUPABASE_ANON_KEY=...

# 3. Dev server başlat
npm run dev
```

### Development Server

```bash
npm run dev
# http://localhost:4321
```

**Özellikler:**
- Hot reload
- TypeScript type checking
- Tailwind CSS JIT
- Edge SSR simulation (local'de normal SSR)

### Build & Preview

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Testing

**Unit Tests (Vitest):**
```bash
npm test
```

**E2E Tests (Playwright):**
```bash
npm run test:e2e
npm run test:ui  # UI mode
```

**Test Coverage:**
- Forms (`tests/e2e/forms.spec.ts`)
- Homepage (`tests/e2e/home.spec.ts`)
- Search (`tests/e2e/search.spec.ts`)
- Utils (`tests/unit/utils.test.ts`)

### Local Test Checklist

1. ✅ Dev server çalışıyor mu?
2. ✅ Supabase bağlantısı var mı?
3. ✅ Resources/Programs sayfaları yükleniyor mu?
4. ✅ Search çalışıyor mu?
5. ✅ Forms submit oluyor mu?
6. ✅ Multi-language switching çalışıyor mu?
7. ✅ Build hatasız tamamlanıyor mu?

---

## Resources Sayfaları Tasarımı

### Sayfa Yapısı

**Liste Sayfaları:**
- `/resources/` - Tüm resources (EN)
- `/resurssit/` - Tüm resources (FI)
- `/resources/[category]/` - Kategori bazlı liste

**Detay Sayfası:**
- `/resources/[slug]` - Tekil resource detayı

### Component Yapısı

**ResourceCard (`src/components/resources/ResourceCard.astro`):**
- Cover image
- Category badge
- Title, excerpt
- Key points preview
- Link to detail page

**Resource Detail Page (`src/pages/resources/[slug].astro`):**
1. Cover image (eğer varsa)
2. Category badge
3. Key Points (mavi kutu, border-left)
4. Content (Markdown, HTML olarak render)
5. FAQs (accordion style)
6. Citations/References (eğer varsa) - **YENİ**
7. Back link

### Styling

**Tailwind CSS:**
- Utility-first approach
- Custom colors: `#2841CF` (primary), `#F6F7FB` (light bg)
- Responsive: mobile-first
- Typography: `@tailwindcss/typography` for content

**Key Points Box:**
```astro
<div class="bg-blue-50 border-l-4 border-primary p-6 mb-8">
  <h2 class="text-2xl font-bold mb-4">Key Points</h2>
  <ul class="space-y-2">
    {resource.keypoints.map((point) => (
      <li class="flex items-start">
        <span class="text-primary mr-2">✓</span>
        <span>{point}</span>
      </li>
    ))}
  </ul>
</div>
```

**Citations Section:**
```astro
{resource.citations && Array.isArray(resource.citations) && 
 resource.citations.length > 0 && 
 resource.citations.some(c => c && c.url) && (
  <div class="mt-12">
    <h2 class="text-3xl font-bold mb-6">Sources & References</h2>
    <div class="space-y-3">
      {resource.citations
        .filter(citation => citation && citation.url && citation.url.trim())
        .map((citation) => (
          <div class="border-l-4 border-gray-300 pl-4 py-2">
            <a href={citation.url} target="_blank" rel="noopener noreferrer">
              {citation.title || citation.url}
            </a>
            {citation.snippet && (
              <p class="text-sm text-gray-600">{citation.snippet}</p>
            )}
          </div>
        ))}
    </div>
  </div>
)}
```

### Infinite Scroll (Category Pages)

Category sayfalarında infinite scroll var:
- İlk 20 kayıt server-side render
- Scroll'da daha fazla yükle (client-side)
- Supabase'den pagination ile çek

---

## Programs Sayfaları

### Yapı

Resources ile benzer, ama ekstra alanlar:
- `goal` - Program hedefi
- `audience` - Hedef kitle
- `duration` - Program süresi (**YENİ**)

### n8n Workflow

**Plademy Programs.json:**
1. Google Sheets'ten program bilgileri çek
2. Perplexity ile research yap
3. DeepSeek ile content generate et
4. Image generate (FAL.ai)
5. Supabase'e kaydet (duration dahil)

**Duration Field:**
- Google Sheets'te "Program Duration" kolonu
- n8n'de `duration` field'ına map ediliyor
- Supabase'de `duration` TEXT kolonu

### Filter UI (Aralık 2025)

**Dropdown Filtreler:**
- Category ve Audience filtreleri dropdown olarak tasarlandı
- Tam yuvarlak tasarım (`rounded-full`)
- Dropdown ok işareti kenardan 1rem mesafede
- Clear (X) butonları: Filtre seçildiğinde görünür, tıklanınca "All" seçeneğine geçer
- Dropdown ok işareti clear butonu göründüğünde gizlenir

**Server-side Filtering:**
- URL query params ile filtreleme (`?category=...&audience=...&goal=...`)
- Filtre değiştiğinde sayfa yenileniyor (ekonomik)
- Sadece filtrelenmiş programlar çekiliyor
- Pagination: 18 program per page, "Load More" butonu

---

## Netlify Deployment

### Build Configuration

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

**ÖNEMLİ NOTLAR:**
- ❌ **Redirect Rules:** Hybrid SSR için `from = "/*" to = "/index.html"` redirect kuralı **KULLANILMAMALI**. Bu kural tüm SSR route'larını statik dosyaya yönlendirir ve deployment'ı bozar.
- ❌ **Image Transformation:** Netlify'ın image transformation özelliği Astro adapter için experimental ve deployment hatalarına neden oluyor. `[images]` section'ı `netlify.toml`'a **EKLEMEYİN**.
- ✅ **API Routes:** Astro API Routes (`src/pages/api/*.ts`) SSR function olarak çalışır. `export const prerender = false;` ile SSR olarak işaretlenmeli.
- ✅ **Environment Variables:** Runtime SSR'da `process.env` kullanılmalı, `import.meta.env` build-time'da çalışır.

### Environment Variables (Netlify Dashboard)

**Gerekli:**
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL` (form submissions için)
- `PUBLIC_SITE_URL` (optional, SEO için)

**ÖNEMLİ:** 
- `SERVICE_ROLE_KEY` asla Netlify'a ekleme! Sadece n8n'de kullan.
- `N8N_WEBHOOK_URL` Astro API Route'da kullanılır (`process.env.N8N_WEBHOOK_URL`)
- Environment variable'lar Netlify Dashboard'da tanımlı olmalı (Site settings → Environment variables)
- Runtime SSR'da `process.env` ile okunur, `import.meta.env` build-time'da çalışır

### Deployment Adımları

1. **GitHub'a Push:**
   ```bash
   git add .
   git commit -m "Deploy"
   git push origin main
   ```

2. **Netlify Auto-Deploy:**
   - GitHub repo'yu Netlify'a bağla
   - Main branch'ten otomatik deploy
   - Her push'ta yeni build

3. **Manual Deploy:**
   - Netlify Dashboard → Deploys → Trigger deploy

### Build Process

1. `npm run build` çalışır
2. Astro hybrid build:
   - Statik sayfalar → `dist/`
   - Edge SSR sayfalar → Netlify Edge Functions
3. Netlify deploy eder

**Build Troubleshooting:**
- ✅ **Build başarılı ama deployment başarısız:** Genellikle `netlify.toml` konfigürasyon hatası
- ❌ **Image transformation hatası:** `[images]` section'ını `netlify.toml`'dan kaldırın
- ❌ **Redirect hatası:** Hybrid SSR için `from = "/*"` redirect kuralını kaldırın
- ⚠️ **TypeScript warnings:** Build'i durdurmaz ama temizlenmeli (unused imports)
- ✅ **Edge Functions bundling başarılı:** `netlify/edge-functions/` dizinindeki dosyalar otomatik keşfedilir
- ❌ **esbuild parsing error "Expected ';' but found '{'":** IIFE pattern'leri (`(() => { ... })()`) template içinde kullanılmamalı, frontmatter'a taşınmalı
- ❌ **Complex expressions in JSX attributes:** Karmaşık expression'lar (nested ternary, template literals) JSX attribute'larında kullanılmamalı, frontmatter'da değişkene taşınmalı
- ⚠️ **astro check false positives:** Bazen `astro check` geçerli Astro syntax'ını hata olarak gösterir, bu durumda `build` script'inden kaldırılabilir (local'de `build:check` script'i kullanılabilir)

### Form API Route (Astro SSR)

**Form Webhook (`src/pages/api/form.ts`):**
- **Astro API Route kullanılıyor** (Edge Functions yerine)
- Node.js runtime ile çalışır (Netlify SSR Function)
- Contact form submissions
- Resource/Program sayfalarındaki form submissions
- n8n webhook'a POST request (webhook URL gizli)
- Email gönderimi
- **Avantajlar:**
  - Astro SSR sistemiyle entegre çalışır
  - Environment variable'lar `process.env` ile runtime'da okunur
  - Daha kolay debugging ve error handling
  - TypeScript desteği tam
  - Webhook URL client-side'da görünmez

**Environment Variables:**
- `N8N_WEBHOOK_URL` Netlify Dashboard'da tanımlı olmalı
- Runtime'da `process.env.N8N_WEBHOOK_URL` ile okunur
- `import.meta.env` build-time'da çalışır, runtime SSR için `process.env` kullanılmalı

**Path:**
- `/api/form` → Astro API Route
- `export const prerender = false;` ile SSR olarak çalışır
- CORS headers eklendi (OPTIONS preflight support)

**Error Handling:**
- Detaylı error logging (console.error)
- Client-side'da response body loglanıyor
- Webhook response body detaylı şekilde loglanıyor
- Environment variable debug bilgileri eklendi

### Performance Optimization

**Image Optimization:**
- ❌ **Netlify Image CDN kullanılmıyor** (experimental, deployment hatalarına neden oluyor)
- ✅ **Supabase/Cloudinary CDN:** Görüntüler zaten optimize edilmiş CDN'lerden geliyor
- ✅ **Lazy Loading:** Card images için `loading="lazy"`
- ✅ **Eager Loading:** Hero ve detail page images için `loading="eager"` + `fetchpriority="high"`
- ✅ **Width/Height Attributes:** Layout shift önleme için tüm görsellere eklendi

**Caching (OPTİMİZE EDİLDİ - 2025):**
- **Static pages:** CDN cache
- **List pages (Edge SSR):** `max-age=300` (5 dakika) + `stale-while-revalidate=600` (10 dakika)
- **Detail pages (Edge SSR):** `max-age=600` (10 dakika) + `stale-while-revalidate=1200` (20 dakika)
- **Static assets:** 1 year cache (immutable) - `public/_headers` dosyasında tanımlı

**PageSpeed Target:**
- 95+ (Edge SSR overhead ile)

---

## n8n Integration

### Workflows

**1. Plademy Resources.json:**
- Resources içerik üretimi
- Perplexity research
- DeepSeek content generation
- FAL.ai image generation
- Supabase insert
- Citations extraction (**YENİ**)

**2. Plademy Programs.json:**
- Programs içerik üretimi
- Duration field dahil (**YENİ**)
- Benzer flow (research → content → image → insert)

**3. Form Webhook Workflow:**
- Form submission'ları alır
- Email gönderimi veya diğer işlemler
- Webhook node POST method olarak ayarlanmalı

### n8n Webhook Configuration

**Webhook Node Settings:**
- **HTTP Method:** POST (GET değil!)
- **Production Mode:** Aktif olmalı (Test modunda değil)
- **Path:** `/webhook/{webhook-id}` (production için)
- **Test Path:** `/webhook-test/{webhook-id}` (sadece test için, "Execute workflow" sonrası bir kez çalışır)

**ÖNEMLİ:**
- ❌ **GET Method:** Webhook GET olarak ayarlanmışsa 404 hatası alınır: "This webhook is not registered for POST requests"
- ✅ **POST Method:** Webhook POST olarak ayarlanmalı
- ✅ **Production Mode:** Workflow aktif olmalı, test modunda değil
- ✅ **Webhook URL:** Netlify environment variable'ında tam URL olmalı: `https://n8n.plademy.com/webhook/{webhook-id}`

**Webhook URL Format:**
- Production: `https://n8n.plademy.com/webhook/{webhook-id}`
- Test: `https://n8n.plademy.com/webhook-test/{webhook-id}` (sadece test için)

**Troubleshooting:**
- **404 Error:** Webhook POST olarak ayarlı mı? Workflow aktif mi?
- **Test Webhook:** Sadece "Execute workflow" sonrası bir kez çalışır
- **Production Webhook:** Her zaman çalışır (workflow aktifse)

### Citations Extraction

**Perplexity'den Citations:**
```javascript
const perplexityData = $('Perplexity1').item.json;
const citationsArray = [];

// search_results (objects)
if (perplexityData.search_results && Array.isArray(perplexityData.search_results)) {
  perplexityData.search_results.forEach(item => {
    if (item && item.url && item.url.trim()) {
      citationsArray.push({
        url: item.url.trim(),
        title: (item.title || '').trim(),
        snippet: (item.snippet || item.description || '').trim()
      });
    }
  });
}

// citations (can be strings or objects)
if (perplexityData.citations && Array.isArray(perplexityData.citations)) {
  perplexityData.citations.forEach(item => {
    if (typeof item === 'string' && item.trim()) {
      citationsArray.push({ url: item.trim(), title: '', snippet: '' });
    } else if (item && typeof item === 'object' && (item.url || item.link)) {
      const url = (item.url || item.link || '').trim();
      if (url) {
        citationsArray.push({
          url: url,
          title: (item.title || item.name || '').trim(),
          snippet: (item.snippet || item.description || '').trim()
        });
      }
    }
  });
}

// Remove duplicates
const uniqueCitations = [];
const seenUrls = new Set();
citationsArray.forEach(citation => {
  const url = citation.url && citation.url.trim();
  if (url && !seenUrls.has(url)) {
    seenUrls.add(url);
    uniqueCitations.push(citation);
  }
});

return uniqueCitations.length > 0 ? uniqueCitations : null;
```

### Supabase Insert (n8n)

**HTTP Request Node:**
- Method: POST
- URL: `https://[project].supabase.co/rest/v1/resources`
- Headers:
  - `apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}`
  - `Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}`
  - `Content-Type: application/json`
  - `Prefer: return=minimal`

**Body:**
```json
{
  "slug": "{{ $json.slug }}",
  "language": "{{ $json.language }}",
  "title": "{{ $json.title }}",
  "description": "{{ $json.description }}",
  "excerpt": "{{ $json.excerpt }}",
  "content": "{{ $json.content }}",
  "keypoints": {{ $json.keypoints }},
  "category": "{{ $json.category }}",
  "faqs": {{ $json.faqs }},
  "cover_image_url": "{{ $json.cover_image_url }}",
  "citations": {{ $json.citations }},
  "is_published": true
}
```

---

## i18n (Internationalization)

### Dil Yapısı

**3 Dil:**
- `en` (English) - Default
- `fi` (Finnish)
- `sv` (Swedish)

### Translation Files

`src/i18n/[lang].json`:
```json
{
  "common": {
    "back": "Back",
    "search": "Search"
  },
  "resources": {
    "title": "Resources",
    "noResources": "No resources found"
  },
  "programs": {
    "title": "Programs",
    "noPrograms": "No programs found"
  }
}
```

### Dil Tespiti

**Cookie-based:**
```typescript
// src/lib/i18n.ts
export function getLanguageFromCookie(
  cookies: AstroCookies,
  url: URL
): Language | null {
  // 1. Cookie'den oku
  const cookieLang = cookies.get('lang')?.value;
  if (cookieLang && ['en', 'fi', 'sv'].includes(cookieLang)) {
    return cookieLang as Language;
  }
  
  // 2. URL path'inden oku
  const pathLang = url.pathname.split('/')[1];
  if (['fi', 'sv'].includes(pathLang)) {
    return pathLang as Language;
  }
  
  // 3. Default: en
  return 'en';
}
```

### URL Yapısı

- `/` - English (default)
- `/resources/` - English resources
- `/resurssit/` - Finnish resources
- `/programs/` - English programs
- `/ohjelmat/` - Finnish programs

---

## SEO Optimizasyonu

### Meta Tags

**SEO Component (`src/components/common/SEO.astro`):**
- `<title>` - Page title (Plademy suffix ile)
- `<meta name="description">` - Meta description
- `<meta name="robots">` - index, follow, max-image-preview:large
- `<meta name="author">` - Plademy
- `<meta name="theme-color">` - #2841CF
- `<link rel="canonical">` - Canonical URL

**Open Graph Tags:**
- `og:type`, `og:url`, `og:title`, `og:description`, `og:image`
- `og:image:alt`, `og:site_name`, `og:locale`
- `article:published_time`, `article:modified_time` (article type için)

**Twitter Card Tags:**
- `twitter:card` (summary_large_image)
- `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`
- `twitter:image:alt`, `twitter:site`, `twitter:creator`

**Language Alternates (hreflang):**
- `hreflang="en"`, `hreflang="fi"`, `hreflang="sv"`
- `hreflang="x-default"` (default: English)
- Doğru URL mapping ile (getLocalizedPath kullanarak)

**Mobile/PWA Tags:**
- `viewport` (viewport-fit=cover)
- `format-detection`, `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `apple-touch-icon`, `manifest` (site.webmanifest)
- `mobile-web-app-capable`

### Structured Data (JSON-LD)

**WebPage/Article Schema:**
- Her sayfada mevcut
- Headline, description, image, url
- Publisher (Organization), isPartOf (WebSite)
- Date published/modified (article type için)

**Organization Schema (Site-wide):**
- Organization bilgileri (name, url, logo, description)
- Address (Maria 01, Helsinki)
- Contact point, social media links (sameAs)
- Her sayfada mevcut

**Article Schema (ContentLayout):**
- Article detayları (headline, description, image)
- Author, publisher, mainEntityOfPage
- Category bilgisi, keywords
- Program-specific fields (goal, duration, audience)

**BreadcrumbList Schema:**
- Breadcrumb navigation
- Home → Category → Current Page
- ContentLayout'da mevcut

### Sitemap

**Statik sitemap:**
- `@astrojs/sitemap` integration
- Sadece statik sayfalar

**Dinamik sitemap:**
- `/sitemap.xml.ts` - Edge SSR
- Supabase'den resources/programs çek
- Her dil için URL'ler

### Google Tag Manager

- **GTM ID:** GTM-NDBXXZV
- **Location:** BaseLayout.astro (head ve body)
- **Coverage:** Tüm sayfalarda aktif

---

## Security Best Practices

### Security Headers

**Netlify `_headers` file (`public/_headers`):**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

### Content Security Policy (CSP)

- Default: 'self' only
- Scripts: 'self', 'unsafe-inline' (GTM requirement), GTM/GA domains
- Styles: 'self', 'unsafe-inline', Google Fonts
- Fonts: 'self', Google Fonts CDN
- Images: 'self', data:, https:, blob: (all HTTPS sources)
- Connect: 'self', Supabase, GTM, GA, Cloudinary
- Frames: 'self', GTM
- Object: 'none'
- Base URI: 'self'
- Form Action: 'self'
- Upgrade Insecure Requests: Enabled

### Environment Variables

**Public (Frontend):**
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

**Private (Server-only):**
- `SERVICE_ROLE_KEY` - Sadece n8n'de
- `N8N_WEBHOOK_URL` - Netlify Edge Functions'da

### RLS Policies

- Public: Sadece `is_published = true` okuyabilir
- Service Role: Tüm işlemler (n8n için)

### Form Validation

- **Client-side:** UX için (required fields, email format)
- **Server-side:** Security için (Edge Function)
  - Email format validation
  - String length limits (name: 200, email: 255, message: 5000)
  - XSS protection (HTML karakterleri kaldırılıyor)
  - URL validation (page_url için)
  - Input sanitization (tüm string alanlar)

### Form Data Tracking

- **Page URL:** Tüm form submission'lara `page_url` eklendi
- **Source Tracking:** Form tipi ve kaynak bilgisi gönderiliyor
- **Category Tracking:** Program/Resource category bilgisi dahil

---

## Performance

### Metrics

- **PageSpeed:** 95+ target
- **Lighthouse:** 95+ all categories
- **Core Web Vitals:** Pass
- **FCP:** < 1.5s
- **TTI:** < 3s

### Optimizations

1. **Hybrid Rendering:** Statik sayfalar SSG, dinamik Edge SSR
2. **Image Optimization:** 
   - Netlify Image CDN, WebP, lazy loading
   - Width/Height attributes (layout shift önleme)
   - Eager loading for above-the-fold images
   - Decoding async for non-critical images
3. **Code Splitting:** Astro Islands Architecture
4. **Caching:** 
   - Static assets: 1 year cache (immutable)
   - HTML: No cache, must-revalidate
   - API: No cache, no-store
5. **Minimal JS:** Sadece gerekli JavaScript
6. **Resource Hints:** Preconnect ve DNS prefetch for external domains
7. **Font Loading:** Preconnect + display=swap

---

## Recent Updates

### Form API Route Migration (2025)

- **Değişiklik:** Netlify Edge Functions → Astro API Route
- **Dosya:** `src/pages/api/form.ts`
- **Avantajlar:** Astro SSR ile entegre, daha kolay debugging, TypeScript desteği tam, environment variable'lar `process.env` ile runtime'da okunur
- **Runtime:** Node.js (Netlify SSR Function)
- **Path:** `/api/form` → Astro API Route
- **Environment Variables:** `process.env.N8N_WEBHOOK_URL` (runtime SSR için)

### Citations Feature (2025)

- **Migration:** `004_add_citations_to_resources.sql`
- **Field:** `citations` JSONB in resources table
- **n8n:** Perplexity'den citations extraction
- **Frontend:** "Sources & References" section

### Duration Field (2025)

- **Programs table:** `duration` TEXT column added
- **n8n:** Google Sheets'ten "Program Duration" map ediliyor
- **Frontend:** Program detay sayfasında gösterilebilir

### Homepage Redesign (2025)

- **Hero Section:** Two-column layout (text left, image right)
- **Solutions Section:** Logo'lar eklendi, "Learn More" linkleri kaldırıldı
- **Latest Content:** Resources ve Programs için kategori bazlı iki sütunlu layout
- **Alternating Layout:** Zebra pattern (sol-sağ, sağ-sol)
- **Category Descriptions:** Her kategori için ilgi çekici açıklamalar

### Footer Redesign (2025)

- **5 Column Layout:** 16% - 21% - 21% - 21% - 21% genişlikler
- **Responsive:** Mobilde tek sütun, tablet'te 2 sütun, desktop'ta 5 sütun
- **Content:** About, Latest Resources, Resource Categories, Program Categories, Latest Programs & Links
- **Social Media:** X, Facebook, LinkedIn, Instagram ikonları
- **Copyright:** Business-ID ve VAT NO altına taşındı
- **Links:** Privacy Policy ve Contact About bölümüne taşındı

### Category Pages Filters (2025)

- **Program Category Pages:** Audience filtresi ve Goal arama alanı eklendi
- **Resource Category Pages:** Filtre tasarımı program sayfalarıyla aynı yapıldı
- **Design:** Rounded-full butonlar, mavi aktif durum, hover efektleri
- **UX:** Programs sayfasındaki filtre mantığı uygulandı

### Program Cards Height Fix (2025)

- **Issue:** İçerik uzunluğuna göre kart yükseklikleri farklıydı
- **Solution:** Flexbox ile eşit yükseklik (`h-full flex flex-col`)
- **Implementation:** ProgramCard component'inde flex layout, grid item'larda `h-full`

### SEO & LLM Optimization (2025)

- **Meta Tags:** Robots, author, theme-color, og:site_name, og:image:alt, twitter:site, twitter:creator eklendi
- **JSON-LD Structured Data:** WebPage/Article, Organization, BreadcrumbList schema'ları eklendi
- **Mobile/PWA:** Apple touch icon, manifest, mobile web app meta tag'leri eklendi
- **Hreflang:** Language alternates doğru URL mapping ile güncellendi
- **LLM Friendly:** Tüm sayfalarda structured data mevcut, arama motorları ve LLM'ler için optimize edildi

### Google Tag Manager Integration (2025)

- **Implementation:** BaseLayout.astro'ya GTM script'i eklendi
- **GTM ID:** GTM-NDBXXZV
- **Location:** Head içinde (mümkün olduğunca yukarıda) ve body açılış tag'inden sonra noscript
- **Coverage:** Tüm sayfalarda aktif

### Form Security Enhancements (2025)

- **Input Validation:** Email format, string length limits, XSS protection
- **Sanitization:** Tüm string alanlar temizleniyor, HTML karakterleri kaldırılıyor
- **URL Validation:** page_url geçerli URL formatında kontrol ediliyor
- **Error Handling:** Daha detaylı hata mesajları ve logging
- **Page URL Tracking:** Tüm form submission'lara `page_url` eklendi
- **Client-side Error Logging:** Response body console'da loglanıyor, webhook response detayları gösteriliyor
- **Environment Variable Debugging:** Debug bilgileri eklendi (hasProcessEnv, hasImportMetaEnv, etc.)

### Program Form Content Personalization (2025)

- **Dynamic Titles:** Program detay sayfalarında "Start implementing this program today"
- **Dynamic Descriptions:** "AI Powered Solutions For Your {programTitle}"
- **Category Pages:** "Start implementing {categoryName} programs today" ve "AI Powered Solutions For Your {categoryName} Programs"
- **Translation Support:** Tüm form metinleri i18n dosyalarında

### Solutions Section Updates (2025)

- **Links Added:** Tüm solution kartları ilgili URL'lere linklendi
  - Mentorship Center → https://mentorship.center
  - Membership Center → https://membership.center
  - ERG Center → https://erg.center
  - Secured Integrations → https://securedintegration.com
- **New Tab:** Tüm linkler `target="_blank"` ile yeni sekmede açılıyor
- **Solutions Page:** `/solutions` sayfasında butonlar kaldırıldı, kartlar linklendi, border-radius 30px yapıldı, içerik ortalandı

### Mobile Optimizations (2025)

- **Homepage Categories:** Mobilde tek program/resource gösteriliyor (desktop'ta 2)
- **Hero Section:** Mobilde içerik yatay ortalandı
- **Category Sections:** Mobilde başlık, açıklama ve "See More" butonu ortalandı
- **Footer:** Mobilde tüm içerik yatay ortalandı

### Supabase Egress Optimization (2025)

**Problem:**
- Aylık 5GB egress limiti aşılıyordu
- Her sayfa ziyaretinde 100+ kayıt çekiliyordu (limit(100) pattern)
- Client-side filtering gereksiz veri transferine neden oluyordu
- `select('*')` kullanımı gereksiz kolonları da çekiyordu

**Çözümler:**

1. **Direct Slug Queries:**
   - ❌ Eski: `limit(100)` + client-side `find()`
   - ✅ Yeni: `.eq('slug', slug).single()` direkt sorgu
   - **Kazanım:** Her sayfa ziyaretinde %90+ veri transferi azalması

2. **Selective Fields:**
   - Liste sayfaları: `select('id, slug, title, excerpt, cover_image_url, category, published_at')`
   - Detail sayfaları: `select('*')` (tüm alanlar gerekli)
   - Categories: Basic fields (`id, slug, name_*, type, sort_order`) ve full fields (descriptions dahil)
   - **Kazanım:** ~30-40% category data transfer azalması, ~20-30% per query azalması

3. **Server-side Pagination:**
   - `range(offset, offset + pageSize - 1)` ile sayfalama
   - İlk yüklemede sadece 18-20 kayıt çekiliyor
   - **Kazanım:** İlk yüklemede %80-90 veri transferi azalması

4. **Count Query Optimization:**
   - `select('id', { count: 'exact', head: true })` formatı
   - Minimal data transfer

5. **Server-side Filtering (`/programs`):**
   - URL query params (`?category=...&audience=...&goal=...`) ile database'de filtreleme
   - Client-side filtering hala çalışıyor ama URL sync ile
   - **Kazanım:** Filtre uygulandığında %50-90 veri transferi azalması

6. **Helper Functions:**
   - `getResourceBySlug()`, `getProgramBySlug()`
   - `getResourcesList()`, `getProgramsList()`
   - `getCategoryByIdOrSlug()`
   - Tutarlı optimizasyon uygulaması

7. **Cache Headers Optimization:**
   - List pages: 300s cache (5 dakika)
   - Detail pages: 600s cache (10 dakika)
   - **Kazanım:** %60-80 database query azalması

**Sonuç:**
- ✅ Aylık egress limiti içinde kalıyor
- ✅ Sayfa yükleme performansı artıyor
- ✅ Database query sayısı azalıyor
- ✅ SEO iyileşiyor (indexable filtered URLs)

### Performance & Security Enhancements (2025)

- **Security Headers (`public/_headers`):**
  - X-Frame-Options: DENY (clickjacking koruması)
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS) with preload
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: geolocation, microphone, camera kısıtlamaları

- **Content Security Policy (CSP):**
  - Default: 'self' only
  - Scripts: GTM için 'unsafe-inline' (gerekli)
  - Images: 'self', data:, https:, blob: (Cloudinary dahil)
  - Connect: Supabase, GTM, GA, Cloudinary
  - Upgrade insecure requests enabled

- **Image Optimization:**
  - Width/Height attributes: Layout shift önleme (Hero: 1200x800, Detail: 1200x600, Cards: 400x192)
  - Lazy loading: Card images için `loading="lazy"`
  - Eager loading: Hero ve detail page images için `loading="eager"` + `fetchpriority="high"`
  - Decoding: `decoding="async"` for non-critical images

- **Font Optimization:**
  - Preconnect: Google Fonts, Supabase, GTM, Cloudinary
  - DNS Prefetch: External domains
  - Font display: `display=swap` (zaten mevcut)

- **Caching Strategy:**
  - Static assets: 1 year cache (31536000s) with immutable
  - HTML files: No cache, must-revalidate
  - API endpoints: No cache, no-store

- **Open Graph Image Optimization:**
  - Absolute URL handling: Tüm görseller absolute URL'lerle
  - Fallback mechanism: Default logo kullanımı
  - Secure URL: `og:image:secure_url` eklendi
  - WhatsApp/Twitter/Facebook uyumlu

### UI/UX Enhancements (2025)

- **Button Hover States:**
  - Header "Start" button: Hover'da siyah arka plan, beyaz yazı
  - Homepage "See More" buttons: Hover'da siyah arka plan, beyaz yazı
  - Hero "Programs" button: Hover'da border siyah (`hover:border-black`)
  - Transition: `transition-colors` kullanımı

- **Homepage Card Styling:**
  - Resource cards: Açık gri arka plan (`bg-gray-50`), border yok, border-radius 25px
  - Program cards: Açık mavi arka plan (`bg-blue-50`), border yok, border-radius 25px
  - Uniform heights: Flexbox ile eşit yükseklik (`h-full flex flex-col`)

- **Solutions Section:**
  - Border-radius: 30px (`rounded-[30px]`)
  - Logo spacing: Üstte 15px ek boşluk

- **Category Sections:**
  - Spacing: Kategoriler arası 70px boşluk (`space-y-[70px]`)

### Header Transparanlığı ve Dinamik Pozisyonlama (Aralık 2025)

- **Header Pozisyonlama:**
  - Başlangıçta (scroll yokken): Header hero section içinde `position: absolute` ile konumlandırıldı
  - Scroll yapınca: Header `position: sticky` olarak sayfanın üstünde sabit kalıyor
  - JavaScript ile dinamik pozisyon değişimi (`absolute` ↔ `sticky`)

- **Transparan Header (Anasayfa, Scroll Yokken):**
  - Arka plan: Tamamen transparan (`background-color: transparent !important`)
  - Border: Yok (`border-bottom: none !important`)
  - Logo: Beyaz logo (`plademy-white-logo.svg`)
  - Nav linkler: Beyaz yazı (`text-white`)
  - Start butonu: Beyaz arka plan, mavi yazı (`bg-white text-[#2841CF]`)
  - Language switcher: Transparan arka plan, beyaz border ve yazı

- **Normal Header (Scroll Yapınca veya Diğer Sayfalarda):**
  - Arka plan: Beyaz (`bg-white`)
  - Border: Alt border (`border-b border-gray-200`)
  - Logo: Siyah logo (`plademy-black-logo.svg`)
  - Nav linkler: Siyah yazı (`text-black`)
  - Start butonu: Normal buton stili (`btn-primary`)
  - Language switcher: Beyaz arka plan, siyah border ve yazı

- **Hero Section:**
  - Negatif margin kaldırıldı (`-mt-10` kaldırıldı)
  - Hero section artık header'ın altında başlıyor
  - Header'ın transparan görünmesi için alan açıldı

- **Hero Butonları:**
  - Programs butonu hover'da border siyah oluyor (`hover:border-black`)
  - Start butonu hover'da siyah arka plan, beyaz yazı (`hover:bg-black hover:text-white`)

- **Teknik Detaylar:**
  - Header başlangıçta: `absolute top-0 left-0 right-0` (hero section içinde)
  - Scroll yapınca: `sticky top-0` (sayfanın üstünde sabit)
  - JavaScript ile `window.scrollY > 50` kontrolü yapılıyor
  - `requestAnimationFrame` ile performans optimizasyonu
  - Inline styles ile `!important` kullanımı (CSS override için)

- **UX İyileştirmeleri:**
  - ✅ Anasayfada hero section'ın görsel bütünlüğü korunuyor
  - ✅ Scroll yapınca header otomatik olarak sabit header'a geçiyor
  - ✅ Smooth transitions (`transition-all duration-300`)
  - ✅ Responsive tasarım (tüm ekran boyutlarında çalışıyor)

### Programs Page Filter UI Redesign (Aralık 2025)

- **Dropdown Filtreler:**
  - Category ve Audience filtreleri buton yerine dropdown'a dönüştürüldü
  - Tam yuvarlak tasarım (`rounded-full`)
  - Dropdown ok işareti kenardan 1rem mesafede konumlandırıldı
  - Flexbox layout ile yan yana yerleştirildi (Category, Audience, Goal Search)

- **Clear (X) Butonları:**
  - Filtre seçildiğinde dropdown içinde X butonu görünür
  - X butonuna tıklanınca filtre temizlenir ve "All" seçeneğine geçer
  - Dropdown ok işareti clear butonu göründüğünde gizlenir (daha temiz görünüm)
  - Goal search için de clear butonu eklendi

- **Server-side Filtering:**
  - Dropdown değişikliklerinde sayfa yenileniyor (server-side filtering)
  - URL query params ile filtreleme (`?category=...&audience=...&goal=...`)
  - Filtre değiştiğinde pagination reset ediliyor (page 1)
  - Sadece filtrelenmiş programlar çekiliyor (ekonomik)

- **Pagination:**
  - İlk yüklemede 18 program gösteriliyor
  - "Load More Programs" butonu ile 18'er program daha yükleniyor
  - Filtreler korunarak pagination çalışıyor

- **Ekonomik Etki:**
  - Server-side filtering ile sadece filtrelenmiş programlar çekiliyor
  - İlk yüklemede 18 program (önceden tüm programlar çekiliyordu)
  - Filtre uygulandığında %50-90 veri transferi azalması
  - Client-side filtering kaldırıldı (gereksiz veri çekme yok)

---

## Form Submissions

### Form Types

**1. Contact Form (`src/components/forms/ContactForm.astro`):**
- Name, Email, Message
- `page_url` dahil
- `/api/form` endpoint'ine POST
- Type: `'contact'`

**2. Start Form (`src/components/forms/StartForm.astro`):**
- Name, Email, Organization, Needs
- `page_url` dahil
- `/api/form` endpoint'ine POST
- Type: `'start'`

**3. Resource Form (Resource/Program detail pages):**
- Name, Email
- Resource/Program slug ve title dahil
- `page_url` dahil
- `/api/form` endpoint'ine POST
- Type: `'resource form'` veya `'resource form bottom'`
- İki yerde: Keypoints altında ve sayfa sonunda

**4. Program Category Form (Program category pages):**
- Name, Email
- Category bilgisi dahil
- `page_url` dahil
- `/api/form` endpoint'ine POST
- Type: `'program-category-page'` veya `'program-category-page-bottom'`
- Dinamik başlık ve açıklama (kategori adı ile)

### Astro API Route Processing

**Form Data Flow:**
1. Client-side: Form submit → `/api/form` POST request
2. Astro API Route: Request alır, `N8N_WEBHOOK_URL` environment variable'dan webhook URL'i okur (`process.env.N8N_WEBHOOK_URL`)
3. Astro API Route: n8n webhook'a POST request gönderir
4. n8n: Email gönderimi veya diğer işlemler

**Security:**
- Webhook URL client-side'da görünmez (`process.env` ile runtime'da okunur)
- CORS headers eklendi (preflight support)
- POST method validation
- Input validation (email format, string length limits)
- XSS protection (HTML karakterleri kaldırılıyor)
- URL validation (page_url için)
- Input sanitization (tüm string alanlar)

**API Route Location:**
- `src/pages/api/form.ts`
- Node.js runtime (Netlify SSR Function)
- Path: `/api/form` (Astro file-based routing)
- `export const prerender = false;` ile SSR olarak çalışır

**Security Features:**
- POST method validation
- CORS headers (preflight support)
- Input validation ve sanitization
- Error handling ve logging
- Webhook URL environment variable'dan (client-side'da görünmez)
- Detaylı error logging (webhook response body dahil)
- Environment variable debugging (hasProcessEnv, hasImportMetaEnv)

**Environment Variables:**
- Runtime SSR'da `process.env.N8N_WEBHOOK_URL` kullanılır
- `import.meta.env` build-time'da çalışır, runtime SSR için uygun değil
- Netlify Dashboard'da environment variable tanımlı olmalı

---

## Troubleshooting

### Common Issues

**1. Supabase Connection Error:**
- Environment variables kontrol et
- RLS policies kontrol et
- Network connectivity kontrol et

**2. Edge SSR Not Working:**
- `export const prerender = false` kontrol et
- Netlify adapter doğru mu?
- Build log'ları kontrol et

**3. Citations Empty:**
- n8n expression syntax kontrol et
- Perplexity response format kontrol et
- Supabase insert kontrol et

**4. Build Fails:**
- Node.js version kontrol et (20+)
- Dependencies yüklü mü?
- TypeScript errors var mı?
- **esbuild parsing errors:** IIFE pattern'leri template'de kullanılmış mı? Frontmatter'a taşı
- **Complex JSX expressions:** Karmaşık expression'lar JSX attribute'larında mı? Değişkene taşı

**5. Netlify Deployment Fails (Build başarılı ama deploy başarısız):**
- ❌ **"Invalid image transformation configuration":** `netlify.toml`'dan `[images]` section'ını kaldırın
- ❌ **Redirect hatası:** `from = "/*" to = "/index.html"` redirect kuralını kaldırın (hybrid SSR için uygun değil)
- ✅ **Edge Functions:** `netlify/edge-functions/` dizinindeki dosyalar otomatik keşfedilir, path mapping gerekmez
- ⚠️ **TypeScript warnings:** Build'i durdurmaz ama temizlenmeli (unused imports)

**6. Form API Route Not Working:**
- Dosya `src/pages/api/form.ts` konumunda mı?
- `export const prerender = false;` eklendi mi?
- `POST` ve `OPTIONS` handler'ları export edildi mi?
- Environment variables Netlify dashboard'da tanımlı mı? (`N8N_WEBHOOK_URL`)
- `process.env.N8N_WEBHOOK_URL` ile okunuyor mu? (runtime SSR için)
- CORS headers eklendi mi? (OPTIONS preflight support)
- n8n webhook POST method olarak ayarlı mı? (GET değil!)
- n8n workflow aktif mi? (Production modunda)

---

## Resources

- **Astro Docs:** https://docs.astro.build
- **Supabase Docs:** https://supabase.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **n8n Docs:** https://docs.n8n.io
- **Tailwind CSS:** https://tailwindcss.com

---

## Contact & Support

- **Project:** Plademy.com
- **Repository:** GitHub (private)
- **Deployment:** Netlify
- **Database:** Supabase

---

## Performance & Security Report

Detaylı performans ve güvenlik test raporu için `PERFORMANCE_SECURITY_REPORT.md` dosyasına bakın.

**Test Araçları:**
- Lighthouse CI
- Security Headers Checker (securityheaders.com)
- Mozilla Observatory
- OWASP ZAP

**Status:** ✅ Tüm kritik performans ve güvenlik optimizasyonları uygulandı

---

## Supabase Egress Optimization (2025)

### Problem
- Aylık 5GB egress limiti aşılıyordu
- Her sayfa ziyaretinde 100+ kayıt çekiliyordu (`limit(100)` pattern)
- Client-side filtering gereksiz veri transferine neden oluyordu
- `select('*')` kullanımı gereksiz kolonları da çekiyordu

### Çözümler

1. **Direct Slug Queries:**
   - ❌ Eski: `limit(100)` + client-side `find()`
   - ✅ Yeni: `.eq('slug', slug).single()` direkt sorgu
   - **Kazanım:** Her sayfa ziyaretinde %90+ veri transferi azalması

2. **Selective Fields:**
   - Liste sayfaları: `select('id, slug, title, excerpt, cover_image_url, category, published_at')`
   - Detail sayfaları: `select('*')` (tüm alanlar gerekli)
   - Categories: Basic fields (`id, slug, name_*, type, sort_order`) ve full fields (descriptions dahil)
   - **Kazanım:** ~30-40% category data transfer azalması, ~20-30% per query azalması

3. **Server-side Pagination:**
   - `range(offset, offset + pageSize - 1)` ile sayfalama
   - İlk yüklemede sadece 18-20 kayıt çekiliyor
   - **Kazanım:** İlk yüklemede %80-90 veri transferi azalması

4. **Count Query Optimization:**
   - `select('id', { count: 'exact', head: true })` formatı
   - Minimal data transfer

5. **Server-side Filtering (`/programs`):**
   - URL query params (`?category=...&audience=...&goal=...`) ile database'de filtreleme
   - Client-side filtering hala çalışıyor ama URL sync ile
   - **Kazanım:** Filtre uygulandığında %50-90 veri transferi azalması

6. **Helper Functions:**
   - `getResourceBySlug()`, `getProgramBySlug()`
   - `getResourcesList()`, `getProgramsList()`
   - `getCategoryByIdOrSlug()`
   - Tutarlı optimizasyon uygulaması

7. **Cache Headers Optimization:**
   - List pages: 300s cache (5 dakika)
   - Detail pages: 600s cache (10 dakika)
   - **Kazanım:** %60-80 database query azalması

### Best Practices

**✅ DOĞRU Kullanım:**

1. **Detail Pages:**
   ```typescript
   const { data: resource } = await getResourceBySlug(slug, lang);
   ```

2. **List Pages:**
   ```typescript
   const { data, totalCount } = await getResourcesList(lang, page, pageSize, categoryId);
   ```

3. **Categories:**
   ```typescript
   // Basic fields (liste sayfaları için)
   const { data } = await supabase
     .from('categories')
     .select(CATEGORY_BASIC_FIELDS)
     .eq('type', 'resource');
   ```

4. **Count Queries:**
   ```typescript
   const { count } = await supabase
     .from('resources')
     .select('id', { count: 'exact', head: true })
     .eq('language', lang);
   ```

**❌ YANLIŞ Kullanım (Egress Limit Sorununa Neden Olur):**

1. **Client-side Filtering:**
   ```typescript
   // ❌ YANLIŞ: Tüm kayıtları çekip client-side filtreleme
   const { data: all } = await supabase
     .from('resources')
     .select('*')
     .eq('language', lang)
     .limit(100);
   const resource = all.find(r => r.slug === slug);
   ```

2. **Gereksiz select('*'):**
   ```typescript
   // ❌ YANLIŞ: Liste sayfasında tüm alanları çekme
   const { data } = await supabase
     .from('resources')
     .select('*') // content, faqs, citations gibi büyük alanlar gereksiz
     .eq('language', lang);
   ```

### Sonuç
- ✅ Aylık egress limiti içinde kalıyor
- ✅ Sayfa yükleme performansı artıyor
- ✅ Database query sayısı azalıyor
- ✅ SEO iyileşiyor (indexable filtered URLs)

### Category Filtering Optimizasyonu (Aralık 2025)

**Problem:**
- Category sayfalarında filtreleme çalışmıyordu (boş sonuçlar)
- `resources.category` ve `programs.category` field'ları category **NAME** olarak saklanıyor (ID değil)
- `categories.id` field'ı category **SLUG** olarak saklanıyor
- Category filtering'de `category.id` kullanılıyordu, bu yüzden eşleşme olmuyordu

**Çözüm:**
1. **Category Name Matching:**
   - Resources ve Programs için category filtering'de `category.name_en` (veya localized name) kullanılıyor
   - `category.id` yerine `category[`name_${lang}`]` kullanılıyor
   - **Kazanım:** Category sayfalarında doğru filtreleme, gereksiz boş query'ler önlendi

2. **Category Query Optimization:**
   - Detail sayfalarında (`[slug].astro`): `select('*')` → `select(CATEGORY_FULL_FIELDS)`
   - Liste sayfalarında: `select('*')` → `select(CATEGORY_BASIC_FIELDS)` veya `select(CATEGORY_FULL_FIELDS)`
   - **Kazanım:** ~30-40% category data transfer azalması

3. **Client-side Navigation Fix:**
   - Category filter linklerine `data-astro-reload` attribute'u eklendi
   - Edge SSR sayfalarında client-side navigation sorunu çözüldü
   - **Kazanım:** Kategori linklerine tıklandığında sayfa tamamen yenileniyor, içerikler doğru yükleniyor

**Etkilenen Dosyalar:**
- `src/pages/resources/[category]/index.astro` - Category name matching, selective fields
- `src/pages/resources/[slug].astro` - Category queries selective fields
- `src/pages/[slug].astro` - Category queries selective fields
- `src/pages/programs/[category]/index.astro` - Category name matching, selective fields
- `src/pages/programs/[slug].astro` - Category queries selective fields, related programs category name matching
- `src/pages/programs/index.astro` - Server-side filtering category name matching
- `src/pages/resources/index.astro` - data-astro-reload attribute

**Öğrenilenler:**
- `resources.category` ve `programs.category` field'ları category **NAME** olarak saklanıyor (örn: "Mentoring & Coaching")
- `categories.id` field'ı category **SLUG** olarak saklanıyor (örn: "mentoring-coaching")
- Category filtering yaparken category **NAME** kullanılmalı, ID veya slug değil
- Edge SSR sayfalarında client-side navigation sorunları olabilir, `data-astro-reload` ile çözülebilir
- Category queries'lerde selective fields kullanımı önemli (basic fields vs full fields)

**Ekonomik Etki:**
- ✅ Category filtering doğru çalışıyor, gereksiz boş query'ler önlendi
- ✅ Category queries'lerde selective fields kullanımı ile ~30-40% data transfer azalması
- ✅ Client-side navigation sorunu çözüldü, kullanıcı deneyimi iyileşti

---

### Genel Kod ve UX Kontrolü (Aralık 2025)

**Kontrol Edilen Alanlar:**
1. ✅ **Sorgular:** Tüm Supabase query'leri selective fields kullanıyor, pagination mevcut
2. ✅ **Listelemeler:** Server-side pagination, selective fields, count query optimization
3. ✅ **Sayfa Detayları:** Direct slug queries, related content selective fields
4. ✅ **Footer:** Selective fields kullanıyor, limit(5) ile optimize
5. ✅ **Header:** Statik, performans sorunu yok
6. ✅ **Kategori Sayfaları:** Category name matching, selective fields, pagination
7. ✅ **İçerik Sayfaları:** Related content selective fields, category name matching
8. ✅ **Arama:** Client-side Fuse.js, selective fields ile optimize (search için normal)
9. ✅ **Filtre Özellikleri:** Server-side filtering (`/programs`), URL sync

**Bulunan ve Düzeltilen Sorunlar:**

1. **LatestContent.astro - Category Filtering:**
   - ❌ Sorun: `category.id` kullanılıyordu
   - ✅ Çözüm: `category.name_en` (veya localized name) kullanılıyor
   - **Etki:** Homepage'de kategori bazlı içerikler doğru gösteriliyor

2. **resources/[slug].astro - Related Resources:**
   - ❌ Sorun: `category.id` kullanılıyordu
   - ✅ Çözüm: `category.name_en` (veya localized name) kullanılıyor
   - **Etki:** Related resources doğru şekilde gösteriliyor

3. **[slug].astro - Related Resources:**
   - ❌ Sorun: `resourceCategory.id` kullanılıyordu
   - ✅ Çözüm: `resourceCategory.name_en` (veya localized name) kullanılıyor
   - **Etki:** Related resources doğru şekilde gösteriliyor

**Optimizasyon Durumu:**

✅ **Sorgular:**
- Tüm liste sayfaları: Selective fields (`RESOURCE_LIST_FIELDS`, `PROGRAM_LIST_FIELDS`)
- Detail sayfaları: `select('*')` (tüm alanlar gerekli, doğru)
- Categories: `CATEGORY_BASIC_FIELDS` veya `CATEGORY_FULL_FIELDS`
- Count queries: `select('id', { count: 'exact', head: true })`

✅ **Pagination:**
- Server-side pagination: `range(offset, offset + pageSize - 1)`
- Page size: 20 kayıt (optimal)
- Count queries optimize edilmiş

✅ **Cache Headers:**
- List pages: `max-age=300, stale-while-revalidate=600` (5 dakika)
- Detail pages: `max-age=600, stale-while-revalidate=1200` (10 dakika)
- Static assets: 1 year cache (immutable)

✅ **Image Loading:**
- Card images: `loading="lazy"`, `width/height` attributes
- Detail page images: `loading="eager"`, `fetchpriority="high"`
- Decoding: `decoding="async"` for non-critical images

✅ **Category Filtering:**
- Category name matching: `category.name_en` (veya localized name)
- Resources ve Programs için tutarlı kullanım
- Server-side filtering (`/programs` sayfası)

✅ **Related Content:**
- Selective fields kullanılıyor
- Category name matching doğru
- Limit: 10 kayıt (optimal)

**Ekonomik Etki:**
- ✅ Category filtering doğru çalışıyor, gereksiz boş query'ler önlendi
- ✅ Related content queries optimize edildi
- ✅ Homepage LatestContent optimize edildi
- ✅ Tüm query'ler selective fields kullanıyor

**Öneriler (Gelecek Optimizasyonlar):**

1. **Search Sayfası:**
   - Şu an: Client-side'da tüm içerikleri çekiyor (Fuse.js için gerekli)
   - Alternatif: Server-side search API endpoint (Supabase full-text search)
   - **Kazanım:** İlk yüklemede daha az veri transferi, daha hızlı arama
   - **Not:** Mevcut yaklaşım da çalışıyor ve UX açısından iyi (anında sonuçlar)

2. **Infinite Scroll:**
   - Category sayfalarında infinite scroll var, ancak pagination da mevcut
   - **Durum:** Her ikisi de çalışıyor, UX açısından iyi

3. **Image Optimization:**
   - Cloudinary CDN kullanılıyor (iyi)
   - WebP format desteği (Cloudinary otomatik)
   - **Durum:** Optimize edilmiş

4. **Cache Strategy:**
   - Edge SSR cache headers optimize edilmiş
   - **Durum:** İyi, daha fazla optimizasyon gerekmiyor

**Öğrenilenler ve Best Practices:**

1. **Limit Optimizasyonu:**
   - Sadece gösterilecek kadar kayıt çekilmeli
   - `limit(6)` ile çekip sadece 2 gösterilmesi gereksiz veri transferine neden olur
   - **Kural:** Limit'i gösterilecek maksimum kayıt sayısına eşitle
   - **Örnek:** Anasayfada desktop'ta 2, mobile'da 1 gösteriliyor → `limit(2)` yeterli
   - **Kazanım:** %66 veri transferi azalması (limit(6) → limit(2))

2. **Gereksiz Query'ler:**
   - Kullanılmayan query'ler kaldırılmalı
   - Her query'nin kullanıldığından emin ol
   - **Örnek:** `latestPrograms` query'si kullanılmıyordu, footer'da zaten var → kaldırıldı
   - **Kazanım:** 1 query azalması, ~5 kayıt veri transferi azalması

3. **Her Kategori İçin Ayrı Query:**
   - Her kategori için ayrı query yapılması doğru yaklaşım
   - Farklı kategoriler, farklı içerikler gösteriyor
   - Category name matching gerekli (category NAME ile filtreleme)
   - Batch query yapmak karmaşık (category name array ile `.in()` kullanılamaz)
   - **Kural:** Her kategori için ayrı query yap, ama limit'i optimize et

4. **Server-side Filtering:**
   - Client-side filtering: Tüm kayıtları çekip JavaScript'te filtreleme (❌ gereksiz veri transferi)
   - Server-side filtering: Database'de filtreleme, sadece filtrelenmiş kayıtları çek (✅ ekonomik)
   - **Kural:** Mümkün olduğunca server-side filtering kullan
   - **Kural:** Filtreler URL query params ile çalışmalı (SEO-friendly, indexable URLs)
   - **Kazanım:** Filtre uygulandığında %50-90 veri transferi azalması

5. **Selective Fields Tutarlılığı:**
   - Constant'lar kullanılmalı (`CATEGORY_FULL_FIELDS`, `RESOURCE_LIST_FIELDS`, etc.)
   - Kod tutarlılığı ve bakım kolaylığı sağlar
   - **Kural:** Selective fields için constant'lar kullan

**Sonuç:**
- ✅ Tüm kritik optimizasyonlar uygulanmış
- ✅ Category filtering sorunları çözülmüş
- ✅ Related content queries optimize edilmiş
- ✅ Anasayfa optimizasyonu uygulandı (%68 veri transferi azalması)
- ✅ Programs category pages server-side filtering uygulandı
- ✅ Ekonomik kullanım hedefleri karşılanmış
- ✅ Performans optimizasyonları mevcut

### Programs Page Filter UI Redesign (Aralık 2025)

**Değişiklikler:**
1. **Dropdown Filtreler:**
   - Category ve Audience filtreleri buton yerine dropdown'a dönüştürüldü
   - Tam yuvarlak tasarım (`rounded-full`)
   - Dropdown ok işareti kenardan 1rem mesafede konumlandırıldı
   - Flexbox layout ile yan yana yerleştirildi (Category, Audience, Goal Search)

2. **Clear (X) Butonları:**
   - Filtre seçildiğinde dropdown içinde X butonu görünür
   - X butonuna tıklanınca filtre temizlenir ve "All" seçeneğine geçer
   - Dropdown ok işareti clear butonu göründüğünde gizlenir
   - Goal search için de clear butonu eklendi

3. **Server-side Filtering:**
   - Dropdown değişikliklerinde sayfa yenileniyor (server-side filtering)
   - URL query params ile filtreleme (`?category=...&audience=...&goal=...`)
   - Filtre değiştiğinde pagination reset ediliyor (page 1)
   - Sadece filtrelenmiş programlar çekiliyor (ekonomik)

4. **Pagination:**
   - İlk yüklemede 18 program gösteriliyor
   - "Load More Programs" butonu ile 18'er program daha yükleniyor
   - Filtreler korunarak pagination çalışıyor

**Ekonomik Etki:**
- ✅ Server-side filtering ile sadece filtrelenmiş programlar çekiliyor
- ✅ İlk yüklemede 18 program (önceden tüm programlar çekiliyordu)
- ✅ Filtre uygulandığında %50-90 veri transferi azalması
- ✅ Client-side filtering kaldırıldı (gereksiz veri çekme yok)

**UX İyileştirmeleri:**
- ✅ Dropdown'lar daha temiz ve modern görünüm
- ✅ Clear butonları ile kolay filtre temizleme
- ✅ Dropdown ok işareti clear butonu göründüğünde gizleniyor (daha temiz görünüm)
- ✅ Responsive tasarım (mobilde alt alta, desktop'ta yan yana)

**Etkilenen Dosyalar:**
- `src/pages/programs/index.astro` - Dropdown filtreler, clear butonları, server-side filtering

### Genel Kod ve UX Kontrolü - Aralık 2025 (Detaylı Rapor)

**Kontrol Tarihi:** Aralık 2025

**Genel Durum:** ✅ İYİ - Tüm kritik optimizasyonlar uygulanmış

**Kontrol Edilen Alanlar:**
1. ✅ **Sorgular:** Tüm Supabase query'leri selective fields kullanıyor, pagination mevcut
2. ✅ **Listelemeler:** Server-side pagination, selective fields, count query optimization
3. ✅ **Sayfa Detayları:** Direct slug queries, related content selective fields
4. ✅ **Footer:** Selective fields kullanıyor, limit(5) ile optimize
5. ✅ **Header:** Statik, performans sorunu yok
6. ⚠️ **Kategori Sayfaları:** Programs category pages'de client-side filtering (Audience, Goal) - iyileştirme fırsatı
7. ✅ **İçerik Sayfaları:** Related content selective fields, category name matching
8. ⚠️ **Arama:** Client-side Fuse.js (opsiyonel server-side search iyileştirmesi)
9. ✅ **Filtre Özellikleri:** Programs page server-side filtering, dropdown UI

**Bulunan İyileştirme Fırsatları:**

1. **Programs Category Pages - Server-side Filtering (ÖNCELİKLİ):**
   - `programs/[category]/index.astro` sayfasında Audience ve Goal filtreleri client-side çalışıyor
   - Tüm programlar çekiliyor, client-side'da filtreleme yapılıyor
   - **Öneri:** Audience ve Goal filtrelerini URL query params ile server-side'a taşı
   - **Kazanım:** Filtre uygulandığında %50-90 veri transferi azalması

2. **Search Sayfası - Server-side Search (OPSİYONEL):**
   - İlk yüklemede tüm içerikler çekiliyor (selective fields ile optimize edilmiş)
   - **Öneri:** Supabase full-text search ile server-side search API endpoint
   - **Kazanım:** İlk yüklemede %90+ veri transferi azalması
   - **Not:** Mevcut yaklaşım da çalışıyor ve UX açısından iyi (anında sonuçlar)

**Detaylı Rapor:**
- `project-plan/CODE_UX_AUDIT_DECEMBER_2025.md` dosyasına bakın

### Programs Category Pages Server-side Filtering (Aralık 2025)

**Yapılan İyileştirme:**
- `programs/[category]/index.astro` sayfasında Audience ve Goal filtreleri server-side'a çevrildi
- Client-side filtering kaldırıldı (tüm programları çekip filtreleme yok)
- Dropdown UI eklendi (tıpkı `/programs` sayfasındaki gibi)
- Clear butonları eklendi (X işareti)
- URL query params ile filtreleme (`?audience=...&goal=...`)
- Pagination linkleri filtreleri koruyor

**Ekonomik Etki:**
- ✅ Filtre uygulandığında sadece filtrelenmiş programlar çekiliyor
- ✅ %50-90 veri transferi azalması (filtre uygulandığında)
- ✅ Database'de filtreleme (daha hızlı ve ekonomik)
- ✅ Client-side filtering kaldırıldı (gereksiz veri çekme yok)

**UX İyileştirmeleri:**
- ✅ Dropdown'lar daha temiz ve modern görünüm
- ✅ Clear butonları ile kolay filtre temizleme
- ✅ Dropdown ok işareti clear butonu göründüğünde gizleniyor
- ✅ Server-side filtering ile daha hızlı sonuçlar

**Etkilenen Dosya:**
- `src/pages/programs/[category]/index.astro` - Server-side filtering, dropdown UI, clear butonları

**Sonuç:**
- ✅ Tüm kritik optimizasyonlar uygulanmış
- ✅ Ekonomik kullanım hedefleri karşılanmış
- ✅ Performans optimizasyonları mevcut
- ✅ Programs category pages server-side filtering uygulandı

### Anasayfa Optimizasyonu (Aralık 2025)

**Yapılan İyileştirmeler:**
1. **Limit Optimizasyonu:**
   - Resource ve Program kategorileri için `limit(6)` → `limit(2)`
   - Sadece gösterilecek kadar kayıt çekiliyor (desktop: 2, mobile: 1)
   - **Kazanım:** Her kategori için %66 veri transferi azalması

2. **Gereksiz Query Kaldırıldı:**
   - `latestPrograms` query kaldırıldı (kullanılmıyordu, footer'da zaten var)
   - **Kazanım:** 1 query azalması, ~5 kayıt veri transferi azalması

3. **Selective Fields Tutarlılığı:**
   - Category queries'de `CATEGORY_FULL_FIELDS` constant kullanılıyor
   - **Kazanım:** Kod tutarlılığı, bakım kolaylığı

**Ekonomik Etki:**
- ✅ **%68 veri transferi azalması** (89 → 28 kayıt)
- ✅ **1 query azalması**
- ✅ **%100 veri kullanım verimliliği** (önceden %31, şimdi %100)

**Not:** Her kategori için ayrı query yapılması doğru yaklaşım (farklı kategoriler, farklı içerikler). Limit optimizasyonu ile gereksiz veri transferi önlendi.

**Detaylı Rapor:**
- `project-plan/HOMEPAGE_OPTIMIZATION_DECEMBER_2025.md` dosyasına bakın

**Etkilenen Dosya:**
- `src/components/home/LatestContent.astro` - Limit optimizasyonu, gereksiz query kaldırıldı

### Header Transparanlığı ve Dinamik Pozisyonlama (Aralık 2025)

**Yapılan İyileştirmeler:**
1. **Header Pozisyonlama:**
   - Başlangıçta (scroll yokken): Header hero section içinde `position: absolute` ile konumlandırıldı
   - Scroll yapınca: Header `position: sticky` olarak sayfanın üstünde sabit kalıyor
   - JavaScript ile dinamik pozisyon değişimi (`absolute` ↔ `sticky`)

2. **Transparan Header (Anasayfa, Scroll Yokken):**
   - Arka plan: Tamamen transparan (`background-color: transparent !important`)
   - Border: Yok (`border-bottom: none !important`)
   - Logo: Beyaz logo (`plademy-white-logo.svg`)
   - Nav linkler: Beyaz yazı (`text-white`)
   - Start butonu: Beyaz arka plan, mavi yazı (`bg-white text-[#2841CF]`)
   - Language switcher: Transparan arka plan, beyaz border ve yazı

3. **Normal Header (Scroll Yapınca veya Diğer Sayfalarda):**
   - Arka plan: Beyaz (`bg-white`)
   - Border: Alt border (`border-b border-gray-200`)
   - Logo: Siyah logo (`plademy-black-logo.svg`)
   - Nav linkler: Siyah yazı (`text-black`)
   - Start butonu: Normal buton stili (`btn-primary`)
   - Language switcher: Beyaz arka plan, siyah border ve yazı

4. **Hero Section:**
   - Negatif margin kaldırıldı (`-mt-10` kaldırıldı)
   - Hero section artık header'ın altında başlıyor
   - Header'ın transparan görünmesi için alan açıldı

5. **Hero Butonları:**
   - Programs butonu hover'da border siyah oluyor (`hover:border-black`)
   - Start butonu hover'da siyah arka plan, beyaz yazı (`hover:bg-black hover:text-white`)

**Teknik Detaylar:**
- Header başlangıçta: `absolute top-0 left-0 right-0` (hero section içinde)
- Scroll yapınca: `sticky top-0` (sayfanın üstünde sabit)
- JavaScript ile `window.scrollY > 50` kontrolü yapılıyor
- `requestAnimationFrame` ile performans optimizasyonu
- Inline styles ile `!important` kullanımı (CSS override için)

**UX İyileştirmeleri:**
- ✅ Anasayfada hero section'ın görsel bütünlüğü korunuyor
- ✅ Scroll yapınca header otomatik olarak sabit header'a geçiyor
- ✅ Smooth transitions (`transition-all duration-300`)
- ✅ Responsive tasarım (tüm ekran boyutlarında çalışıyor)

**Etkilenen Dosyalar:**
- `src/components/common/Header.astro` - Dinamik pozisyonlama, transparan header, JavaScript logic
- `src/components/home/Hero.astro` - Negatif margin kaldırıldı, Programs butonu hover efekti
- `src/styles/global.css` - Header Start butonu hover CSS

### Öğrenilenler ve Best Practices (Aralık 2025)

**Anasayfa Optimizasyonu Öğrenilenler:**

1. **Limit Optimizasyonu:**
   - Sadece gösterilecek kadar kayıt çekilmeli
   - `limit(6)` ile çekip sadece 2 gösterilmesi gereksiz veri transferine neden olur
   - **Kural:** Limit'i gösterilecek maksimum kayıt sayısına eşitle
   - **Kazanım:** %66 veri transferi azalması (limit(6) → limit(2))

2. **Gereksiz Query'ler:**
   - Kullanılmayan query'ler kaldırılmalı
   - `latestPrograms` query'si kullanılmıyordu, footer'da zaten var
   - **Kural:** Her query'nin kullanıldığından emin ol
   - **Kazanım:** 1 query azalması, ~5 kayıt veri transferi azalması

3. **Her Kategori İçin Ayrı Query:**
   - Her kategori için ayrı query yapılması doğru yaklaşım
   - Farklı kategoriler, farklı içerikler gösteriyor
   - Category name matching gerekli (category NAME ile filtreleme)
   - Batch query yapmak karmaşık (category name array ile `.in()` kullanılamaz)
   - **Kural:** Her kategori için ayrı query yap, ama limit'i optimize et

4. **Selective Fields Tutarlılığı:**
   - Constant'lar kullanılmalı (`CATEGORY_FULL_FIELDS`)
   - Kod tutarlılığı ve bakım kolaylığı sağlar
   - **Kural:** Selective fields için constant'lar kullan

**Programs Category Pages Server-side Filtering Öğrenilenler:**

1. **Client-side vs Server-side Filtering:**
   - Client-side filtering: Tüm kayıtları çekip JavaScript'te filtreleme (❌ gereksiz veri transferi)
   - Server-side filtering: Database'de filtreleme, sadece filtrelenmiş kayıtları çek (✅ ekonomik)
   - **Kural:** Mümkün olduğunca server-side filtering kullan

2. **URL Query Params ile Filtering:**
   - Filtreler URL'de saklanmalı (`?audience=...&goal=...`)
   - Sayfa yenilendiğinde filtreler korunur
   - SEO-friendly (indexable filtered URLs)
   - **Kural:** Filtreler URL query params ile çalışmalı

3. **Dropdown UI:**
   - Modern ve kullanıcı dostu
   - Clear butonları ile kolay filtre temizleme
   - Dropdown ok işareti clear butonu göründüğünde gizlenmeli
   - **Kural:** Filtreler için dropdown UI kullan, clear butonları ekle

**Genel Optimizasyon Prensipleri:**

1. **Selective Fields:**
   - Liste sayfaları: Sadece gerekli alanlar
   - Detail sayfaları: Tüm alanlar (doğru)
   - Categories: Basic fields (liste) veya full fields (detail)

2. **Pagination:**
   - Server-side pagination kullan
   - İlk yüklemede 18-20 kayıt (optimal)
   - "Load More" veya "Next" butonları

3. **Count Queries:**
   - `select('id', { count: 'exact', head: true })` formatı
   - Minimal data transfer

4. **Cache Headers:**
   - List pages: 300s (5 dakika)
   - Detail pages: 600s (10 dakika)

5. **Limit Optimizasyonu:**
   - Sadece gösterilecek kadar kayıt çek
   - Gereksiz veri transferi önle
   - **Kural:** Limit = gösterilecek maksimum kayıt sayısı

6. **Header Positioning:**
   - Hero section içinde header için `absolute` positioning
   - Scroll sonrası `sticky` positioning
   - JavaScript ile dinamik pozisyon değişimi
   - **Kural:** Header pozisyonu scroll durumuna göre değişmeli

7. **Transparan Header:**
   - Inline styles ile `!important` kullanımı CSS override için gerekli
   - `background-color: transparent !important` ile tamamen transparan arka plan
   - `border-bottom: none !important` ile border kaldırılabilir
   - **Kural:** Transparan header için inline styles + `!important` kullan

8. **Scroll Detection:**
   - `window.scrollY > 50` ile scroll durumu kontrol edilebilir
   - `requestAnimationFrame` ile performans optimizasyonu yapılmalı
   - `DOMContentLoaded` kontrolü ile element hazırlığı garanti edilmeli
   - **Kural:** Scroll event'lerinde `requestAnimationFrame` kullan

**Ekonomik Kullanım Hedefleri:**

- ✅ Aylık egress limiti içinde kalıyor
- ✅ Sayfa yükleme performansı iyi
- ✅ Database query sayısı optimize edilmiş
- ✅ Veri kullanım verimliliği %100 (sadece gösterilecek kadar çekiliyor)

### Programs Page URL Structure Refactoring (Aralık 2025)

**Problem:**
- Program linklerine tıklandığında yanlış URL'lere yönlendiriliyordu (`/programs?category=[program-slug]` yerine `/programs/[program-slug]` olmalıydı)
- Astro'nun client-side router'ı dinamik route'ları yanlış yorumluyordu
- Filter URL'leri ve program detail URL'leri çakışıyordu

**Çözüm: Yeni URL Yapısı**

1. **Yeni URL Format:**
   - Filter sayfaları: `/programs/[category-slug]/[audience-slug]`
   - Program detail: `/programs/[program-slug]`
   - "All" durumları: `/programs/all-categories/all-audiences`
   - Goal search: Query parameter olarak (`?goal=...`)

2. **Redirect Logic (`src/pages/programs/index.astro`):**
   - `/programs` → `/programs/all-categories/all-audiences` (301 redirect)
   - `/programs?category=...&audience=...` → `/programs/[category-slug]/[audience-slug]` (301 redirect)
   - Eski query parameter format'ından yeni path-based format'a otomatik yönlendirme
   - Program slug kontrolü: Eğer path program slug'ı ise, `[slug].astro`'ya yönlendir

3. **Filter Page (`src/pages/programs/[category]/[audience].astro`):**
   - Category ve audience path'ten alınıyor (`Astro.params`)
   - Goal filter query parameter'dan alınıyor (`?goal=...`)
   - Server-side filtering ile ekonomik çalışıyor
   - Program slug kontrolü: Eğer `categorySlug` aslında program slug'ı ise, `/programs/[slug]`'a redirect

4. **Program Links (`src/components/programs/ProgramCard.astro`):**
   - `rel="external"` attribute eklendi (Astro client-side router'ı bypass eder)
   - `data-astro-reload` attribute mevcut
   - Full page reload ile program detail sayfasına gidiyor

5. **Goal Search Filter:**
   - Input field: `id="goal-search"` ile HTML'de mevcut
   - Server-side filtering: `goal` query parameter ile Supabase'de `ilike` sorgusu
   - Clear button: Goal filter aktifken görünür, tıklanınca temizlenir
   - JavaScript handler: Debounced input (500ms), URL'yi günceller
   - URL format: `/programs/[category]/[audience]?goal=...`

**Teknik Detaylar:**

- **301 Redirects:** Eski URL format'larından yeni format'a kalıcı yönlendirme
- **Path-based Routing:** Filter parametreleri artık path'te (`/programs/[category]/[audience]`)
- **Query Parameters:** Sadece goal search için query parameter kullanılıyor
- **External Links:** Program detail linklerinde `rel="external"` ile full page reload
- **Slug Detection:** Hem redirect logic'te hem filter page'de program slug kontrolü yapılıyor

**Ekonomik Etki:**
- ✅ Server-side filtering ile sadece filtrelenmiş programlar çekiliyor
- ✅ URL yapısı daha temiz ve SEO-friendly
- ✅ Program linkleri doğru çalışıyor
- ✅ Filter URL'leri ve program detail URL'leri artık çakışmıyor

**UX İyileştirmeleri:**
- ✅ Program kartlarına tıklandığında doğru sayfaya gidiyor
- ✅ Filter URL'leri daha okunabilir (`/programs/mentoring-program/employees` vs `/programs?category=mentoring-program&audience=employees`)
- ✅ Goal search filter çalışıyor ve clear button ile temizlenebiliyor
- ✅ Browser back/forward butonları doğru çalışıyor

**Etkilenen Dosyalar:**
- `src/pages/programs/index.astro` - Sadece redirect logic (301 redirects)
- `src/pages/programs/[category]/[audience].astro` - Yeni filter page (server-side filtering, goal search)
- `src/pages/programs/[slug].astro` - Program detail page (değişiklik yok, sadece slug handling)
- `src/components/programs/ProgramCard.astro` - `rel="external"` attribute eklendi
- `src/components/common/Footer.astro` - Program category linkleri yeni format'a güncellendi (`/programs/[category-slug]/all-audiences`)

**Öğrenilenler:**

1. **Astro Client-side Router:**
   - Astro'nun client-side router'ı dinamik route'ları agresif şekilde intercept ediyor
   - `rel="external"` attribute ile client-side router bypass edilebilir
   - `data-astro-reload` attribute ile full page reload yapılabilir

2. **URL Structure Design:**
   - Filter parametreleri path-based olmalı (SEO-friendly, okunabilir)
   - Search parametreleri query parameter olarak kalabilir
   - "All" durumları için özel slug'lar kullanılmalı (`all-categories`, `all-audiences`)

3. **301 Redirects:**
   - Eski URL format'larından yeni format'a 301 redirect yapılmalı (SEO için)
   - Redirect logic'te program slug kontrolü yapılmalı (yanlış yönlendirmeyi önlemek için)

4. **Slug Detection:**
   - Program slug'ları genellikle uzun ve çoklu tire içerir (örn: `strategic-partnership-accelerator-entrepreneurs-startups`)
   - Category slug'ları genellikle kısa ve tek kelime (örn: `mentoring-program`)
   - Slug detection için uzunluk ve tire sayısı kontrol edilebilir

5. **Browser Testing:**
   - Routing sorunlarını tespit etmek için browser'dan test yapılmalı
   - Client-side navigation ve full page reload farklı davranışlar sergileyebilir
   - URL'lerin doğru çalıştığından emin olmak için tüm senaryolar test edilmeli

**Sonuç:**
- ✅ Program linkleri doğru çalışıyor
- ✅ Filter URL'leri temiz ve SEO-friendly
- ✅ Goal search filter çalışıyor
- ✅ Eski URL'ler yeni format'a yönlendiriliyor (301 redirect)
- ✅ Browser testleri başarılı

*Son güncelleme: Aralık 2025*
