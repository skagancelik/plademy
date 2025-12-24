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

### Veri Çekme Pattern'i

**Edge SSR sayfalarında:**
```typescript
// Önce dil bazlı çek
const { data: resources } = await supabase
  .from('resources')
  .select('*')
  .eq('language', lang)
  .eq('is_published', true)
  .order('published_at', { ascending: false })
  .limit(100);

// Slug'a göre filtrele (client-side)
const resource = resources.find(r => r.slug === slug);
```

**Neden bu pattern?**
- Supabase Edge Functions'da `.eq('slug', slug)` bazen çalışmıyor
- `.limit(100)` ile tüm kayıtları çekip client-side filtreleme daha güvenilir

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
- ✅ **Edge Functions:** Otomatik discovery kullanılıyor. `netlify/edge-functions/` dizinindeki dosyalar otomatik olarak keşfedilir. Path mapping gerekmez.
- ✅ **Edge Functions kullanılıyor**, Netlify Functions değil!

### Environment Variables (Netlify Dashboard)

**Gerekli:**
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL` (form submissions için)
- `PUBLIC_SITE_URL` (optional, SEO için)

**ÖNEMLİ:** 
- `SERVICE_ROLE_KEY` asla Netlify'a ekleme! Sadece n8n'de kullan.
- `N8N_WEBHOOK_URL` Edge Functions'da kullanılır (Deno.env.get ile)

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

### Edge Functions

**Form Webhook (`netlify/edge-functions/form-webhook.ts`):**
- **Edge Functions kullanılıyor** (Netlify Functions yerine)
- Deno runtime ile çalışır
- Contact form submissions
- Resource/Program sayfalarındaki form submissions
- n8n webhook'a POST request (webhook URL gizli)
- Email gönderimi
- **Avantajlar:**
  - Ayda 1 milyon ücretsiz çağrı (Functions: 125K)
  - Daha hızlı (edge'de çalışır)
  - Webhook URL client-side'da görünmez
  - Daha düşük gecikme

**Auto-Discovery:**
- Edge Functions `netlify/edge-functions/` dizininde otomatik keşfedilir
- Path mapping gerekmez (Netlify otomatik olarak dosya adını path olarak kullanır)
- Örnek: `form-webhook.ts` → `/form-webhook` path'inde çalışır
- Eğer özel path istiyorsanız, `netlify.toml`'a `[[edge_functions]]` ekleyebilirsiniz, ama genellikle gerekmez

### Performance Optimization

**Image Optimization:**
- ❌ **Netlify Image CDN kullanılmıyor** (experimental, deployment hatalarına neden oluyor)
- ✅ **Supabase/Cloudinary CDN:** Görüntüler zaten optimize edilmiş CDN'lerden geliyor
- ✅ **Lazy Loading:** Card images için `loading="lazy"`
- ✅ **Eager Loading:** Hero ve detail page images için `loading="eager"` + `fetchpriority="high"`
- ✅ **Width/Height Attributes:** Layout shift önleme için tüm görsellere eklendi

**Caching:**
- Static pages: CDN cache
- Edge SSR: 60s cache + stale-while-revalidate 300s
- Static assets: 1 year cache (immutable) - `public/_headers` dosyasında tanımlı

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

### Edge Functions Migration (2024)

- **Değişiklik:** Netlify Functions → Netlify Edge Functions
- **Dosya:** `netlify/edge-functions/form-webhook.ts`
- **Avantajlar:** Daha fazla ücretsiz kullanım (1M çağrı/ay), daha hızlı, webhook URL gizli
- **Runtime:** Deno (Edge Functions için)
- **Path:** `/api/form` → Edge Function

### Citations Feature (2024)

- **Migration:** `004_add_citations_to_resources.sql`
- **Field:** `citations` JSONB in resources table
- **n8n:** Perplexity'den citations extraction
- **Frontend:** "Sources & References" section

### Duration Field (2024)

- **Programs table:** `duration` TEXT column added
- **n8n:** Google Sheets'ten "Program Duration" map ediliyor
- **Frontend:** Program detay sayfasında gösterilebilir

### Homepage Redesign (2024)

- **Hero Section:** Two-column layout (text left, image right)
- **Solutions Section:** Logo'lar eklendi, "Learn More" linkleri kaldırıldı
- **Latest Content:** Resources ve Programs için kategori bazlı iki sütunlu layout
- **Alternating Layout:** Zebra pattern (sol-sağ, sağ-sol)
- **Category Descriptions:** Her kategori için ilgi çekici açıklamalar

### Footer Redesign (2024)

- **5 Column Layout:** 16% - 21% - 21% - 21% - 21% genişlikler
- **Responsive:** Mobilde tek sütun, tablet'te 2 sütun, desktop'ta 5 sütun
- **Content:** About, Latest Resources, Resource Categories, Program Categories, Latest Programs & Links
- **Social Media:** X, Facebook, LinkedIn, Instagram ikonları
- **Copyright:** Business-ID ve VAT NO altına taşındı
- **Links:** Privacy Policy ve Contact About bölümüne taşındı

### Category Pages Filters (2024)

- **Program Category Pages:** Audience filtresi ve Goal arama alanı eklendi
- **Resource Category Pages:** Filtre tasarımı program sayfalarıyla aynı yapıldı
- **Design:** Rounded-full butonlar, mavi aktif durum, hover efektleri
- **UX:** Programs sayfasındaki filtre mantığı uygulandı

### Program Cards Height Fix (2024)

- **Issue:** İçerik uzunluğuna göre kart yükseklikleri farklıydı
- **Solution:** Flexbox ile eşit yükseklik (`h-full flex flex-col`)
- **Implementation:** ProgramCard component'inde flex layout, grid item'larda `h-full`

### SEO & LLM Optimization (2024)

- **Meta Tags:** Robots, author, theme-color, og:site_name, og:image:alt, twitter:site, twitter:creator eklendi
- **JSON-LD Structured Data:** WebPage/Article, Organization, BreadcrumbList schema'ları eklendi
- **Mobile/PWA:** Apple touch icon, manifest, mobile web app meta tag'leri eklendi
- **Hreflang:** Language alternates doğru URL mapping ile güncellendi
- **LLM Friendly:** Tüm sayfalarda structured data mevcut, arama motorları ve LLM'ler için optimize edildi

### Google Tag Manager Integration (2024)

- **Implementation:** BaseLayout.astro'ya GTM script'i eklendi
- **GTM ID:** GTM-NDBXXZV
- **Location:** Head içinde (mümkün olduğunca yukarıda) ve body açılış tag'inden sonra noscript
- **Coverage:** Tüm sayfalarda aktif

### Form Security Enhancements (2024)

- **Input Validation:** Email format, string length limits, XSS protection
- **Sanitization:** Tüm string alanlar temizleniyor, HTML karakterleri kaldırılıyor
- **URL Validation:** page_url geçerli URL formatında kontrol ediliyor
- **Error Handling:** Daha detaylı hata mesajları ve logging
- **Page URL Tracking:** Tüm form submission'lara `page_url` eklendi

### Program Form Content Personalization (2024)

- **Dynamic Titles:** Program detay sayfalarında "Start implementing this program today"
- **Dynamic Descriptions:** "AI Powered Solutions For Your {programTitle}"
- **Category Pages:** "Start implementing {categoryName} programs today" ve "AI Powered Solutions For Your {categoryName} Programs"
- **Translation Support:** Tüm form metinleri i18n dosyalarında

### Solutions Section Updates (2024)

- **Links Added:** Tüm solution kartları ilgili URL'lere linklendi
  - Mentorship Center → https://mentorship.center
  - Membership Center → https://membership.center
  - ERG Center → https://erg.center
  - Secured Integrations → https://securedintegration.com
- **New Tab:** Tüm linkler `target="_blank"` ile yeni sekmede açılıyor
- **Solutions Page:** `/solutions` sayfasında butonlar kaldırıldı, kartlar linklendi, border-radius 30px yapıldı, içerik ortalandı

### Mobile Optimizations (2024)

- **Homepage Categories:** Mobilde tek program/resource gösteriliyor (desktop'ta 2)
- **Hero Section:** Mobilde içerik yatay ortalandı
- **Category Sections:** Mobilde başlık, açıklama ve "See More" butonu ortalandı
- **Footer:** Mobilde tüm içerik yatay ortalandı

### Performance & Security Enhancements (2024)

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

### UI/UX Enhancements (2024)

- **Button Hover States:**
  - Header "Start" button: Hover'da siyah arka plan, beyaz yazı
  - Homepage "See More" buttons: Hover'da siyah arka plan, beyaz yazı
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

### Edge Function Processing

**Form Data Flow:**
1. Client-side: Form submit → `/api/form` POST request
2. Edge Function: Request alır, `N8N_WEBHOOK_URL` environment variable'dan webhook URL'i okur
3. Edge Function: n8n webhook'a POST request gönderir
4. n8n: Email gönderimi veya diğer işlemler

**Security:**
- Webhook URL client-side'da görünmez (Deno.env.get ile)
- CORS headers eklendi (preflight support)
- POST method validation
- Input validation (email format, string length limits)
- XSS protection (HTML karakterleri kaldırılıyor)
- URL validation (page_url için)
- Input sanitization (tüm string alanlar)

**Edge Function Location:**
- `netlify/edge-functions/form-webhook.ts`
- Deno runtime
- Path: `/api/form` (netlify.toml'da map edildi)

**Security Features:**
- POST method validation
- CORS headers (preflight support)
- Input validation ve sanitization
- Error handling ve logging
- Webhook URL environment variable'dan (client-side'da görünmez)

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

**5. Netlify Deployment Fails (Build başarılı ama deploy başarısız):**
- ❌ **"Invalid image transformation configuration":** `netlify.toml`'dan `[images]` section'ını kaldırın
- ❌ **Redirect hatası:** `from = "/*" to = "/index.html"` redirect kuralını kaldırın (hybrid SSR için uygun değil)
- ✅ **Edge Functions:** `netlify/edge-functions/` dizinindeki dosyalar otomatik keşfedilir, path mapping gerekmez
- ⚠️ **TypeScript warnings:** Build'i durdurmaz ama temizlenmeli (unused imports)

**6. Edge Function Not Working:**
- Dosya `netlify/edge-functions/` dizininde mi?
- Export format doğru mu? (`export default async (request: Request) => {...}`)
- Environment variables Netlify dashboard'da tanımlı mı? (`N8N_WEBHOOK_URL`)
- CORS headers eklendi mi? (OPTIONS preflight support)

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

*Son güncelleme: Aralık 2024*
