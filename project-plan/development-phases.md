# Development Phases

## Faz 1: Temel Altyapi (3-4 gün)

### Tamamlanan Görevler
- ✅ Astro projesi kurulumu (hybrid mode)
- ✅ Netlify adapter konfigürasyonu
- ✅ Tailwind CSS v4 setup
- ✅ Supabase client ve environment variables
- ✅ i18n altyapısı (JSON dosyaları + helper functions)
- ✅ Base layout (Header, Footer, SEO component)
- ✅ TypeScript konfigürasyonu
- ✅ Test framework setup (Vitest, Playwright)

### Dosyalar
- `package.json` - Dependencies
- `astro.config.mjs` - Astro + Netlify + Tailwind config
- `src/lib/supabase.ts` - Supabase client
- `src/lib/i18n.ts` - i18n helpers
- `src/lib/utils.ts` - Utility functions
- `src/i18n/*.json` - Çeviri dosyaları
- `src/layouts/*.astro` - Layout componentleri
- `src/components/common/*.astro` - Header, Footer, SEO

---

## Faz 2: Statik Sayfalar (3-4 gün)

### Tamamlanan Görevler
- ✅ Home page (Hero, Features, LatestContent)
- ✅ Integrations page
- ✅ Start page + form
- ✅ Privacy page
- ✅ Contact page + form
- ✅ Form → n8n webhook entegrasyonu
- ✅ SEO components

### Dosyalar
- `src/pages/[lang]/index.astro` - Home
- `src/pages/[lang]/integrations.astro`
- `src/pages/[lang]/start.astro`
- `src/pages/[lang]/privacy.astro`
- `src/pages/[lang]/contact.astro`
- `src/components/forms/*.astro` - Form componentleri
- `src/components/home/*.astro` - Home page componentleri
- `netlify/functions/form-webhook.ts` - Form handler

---

## Faz 3: Dinamik Sistem (4-5 gün)

### Tamamlanan Görevler
- ✅ Supabase schema (migrations)
- ✅ RLS politikaları
- ✅ Category seed data
- ✅ Resources Edge SSR sayfaları (liste, kategori, detay)
- ✅ Programs Edge SSR sayfaları (liste, kategori, detay)
- ✅ Footer'da son içerikler (canlı veri)

### Dosyalar
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_seed_categories.sql`
- `src/pages/[lang]/resources/*.astro` - Resources sayfaları
- `src/pages/[lang]/programs/*.astro` - Programs sayfaları
- `src/components/resources/*.astro` - Resource componentleri
- `src/components/programs/*.astro` - Program componentleri

---

## Faz 4: Arama + Optimizasyon (2-3 gün)

### Tamamlanan Görevler
- ✅ Fuse.js arama implementasyonu
- ✅ Search sayfası UI
- ✅ Dinamik sitemap endpoint
- ✅ Remote image config (astro.config.mjs)
- ✅ Cache headers

### Dosyalar
- `src/pages/[lang]/search.astro` - Search sayfası
- `src/pages/sitemap.xml.ts` - Dinamik sitemap
- `astro.config.mjs` - Image remotePatterns

---

## Faz 5: Test + Deploy (2-3 gün)

### Görevler
- ✅ E2E testler (Playwright)
- ✅ Unit testler (Vitest)
- ⏳ Lighthouse CI check
- ⏳ Production deploy
- ⏳ Monitoring setup

### Dosyalar
- `tests/e2e/*.spec.ts` - E2E testler
- `tests/unit/*.test.ts` - Unit testler
- `playwright.config.ts` - Playwright config
- `vitest.config.ts` - Vitest config

---

## Sonraki Adımlar

1. **Supabase Setup**
   - Supabase projesi oluştur
   - Migration'ları çalıştır
   - Environment variables ayarla

2. **n8n Entegrasyonu**
   - n8n workflow oluştur
   - Supabase SERVICE_ROLE key ile insert
   - Test içerik ekle

3. **Netlify Deploy**
   - GitHub'a push
   - Netlify'da site oluştur
   - Environment variables ayarla
   - Build ve deploy test et

4. **Production Checklist**
   - [ ] Domain bağlantısı
   - [ ] SSL sertifikası
   - [ ] Analytics setup
   - [ ] Error monitoring
   - [ ] Performance monitoring

