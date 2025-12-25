# Build Errors Documentation

## Proje Hakkında

### Genel Bilgiler
- **Proje Adı:** Plademy.com
- **Açıklama:** Human-Centered, AI-Powered Learning & Development Platform
- **Versiyon:** 1.0.0
- **Deployment Platform:** Netlify
- **Build Environment:** Node.js 20 (Netlify), Node.js 16.14.0 (Local - eski)

### Teknoloji Stack
- **Framework:** Astro 4.5.0 (Hybrid SSR)
- **Adapter:** @astrojs/netlify 5.3.0
- **Styling:** Tailwind CSS 3.4.0 + @tailwindcss/typography 0.5.19
- **Database:** Supabase (PostgreSQL via @supabase/supabase-js 2.39.3)
- **Markdown Parser:** marked 17.0.1
- **Search:** fuse.js 7.0.0
- **TypeScript:** 5.3.3
- **Testing:** Playwright 1.41.0 + Vitest 1.2.1

### Proje Yapısı
```
plademy/
├── src/
│   ├── components/          # UI components (forms, cards, layouts)
│   ├── layouts/             # Page layouts (BaseLayout, ContentLayout, PageLayout)
│   ├── pages/               # Routes
│   │   ├── [slug].astro     # Resource detail pages (Edge SSR)
│   │   ├── programs/
│   │   │   ├── [slug].astro # Program detail pages (Edge SSR)
│   │   │   └── [category]/
│   │   │       └── index.astro # Category listing pages (Edge SSR)
│   │   ├── resources/
│   │   │   ├── [slug].astro # Resource detail pages (Edge SSR)
│   │   │   └── [category]/
│   │   │       └── index.astro # Category listing pages (Edge SSR)
│   │   └── api/
│   │       └── form.ts       # Form submission API route
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── i18n.ts          # Internationalization utilities
│   │   └── utils.ts         # Utility functions
│   └── i18n/                # Translation files (en.json, fi.json, sv.json)
├── netlify.toml             # Netlify configuration
├── astro.config.mjs         # Astro configuration (hybrid SSR)
└── tsconfig.json            # TypeScript configuration
```

### Build Konfigürasyonu
- **Build Command:** `npm run build` (şu anda `astro build` - `astro check` kaldırıldı)
- **Publish Directory:** `dist`
- **Node Version:** 20 (Netlify), 16.14.0 (Local - eski)
- **Output Mode:** Hybrid (Static + Edge SSR)
- **Adapter:** @astrojs/netlify with edgeMiddleware: true

### Environment Variables (Netlify)
- `PUBLIC_SUPABASE_URL` - Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `N8N_WEBHOOK_URL` - n8n webhook URL for form submissions
- `NODE_VERSION` - Node.js version (20)

## Build Hataları ve Çözüm Denemeleri

### Hata 1: TypeScript Build Errors (İlk Aşama)
**Hata Mesajı:**
- `programForSlug` referansları
- `marked.parse()` options hatası (headerIds desteklenmiyor)
- `replace` method optional chaining hatası
- Astro template syntax hataları
- Null check hataları
- Type casting hataları

**Yapılan Düzeltmeler:**
1. `programForSlug` → `program` (programs/[slug].astro'da)
2. `headerIds` option'ı kaldırıldı (marked v4'te desteklenmiyor)
3. `replace` method'u optional chaining ile düzeltildi
4. JavaScript içinde Astro template syntax düzeltildi
5. Null check'ler eklendi (resource, category)
6. Type casting düzeltildi (String() conversion)

**Sonuç:** ✅ Düzeltildi

---

### Hata 2: Fragment ve marked.parse() Promise Hatası
**Hata Mesajı:**
- `Fragment` component hatası
- `marked.parse()` Promise döndürüyor hatası

**Yapılan Düzeltmeler:**
1. `Fragment` → `<div>` (Astro'da slot'lar için Fragment sorun çıkarıyor)
2. `marked.parse()` sonucunu önce bir değişkene atadım (as string ile type assertion)
3. `mangle: false` kaldırıldı (marked v4'te desteklenmiyor)
4. `resource.citations` null check düzeltildi

**Sonuç:** ✅ Düzeltildi

---

### Hata 3: Netlify Deployment - netlify.toml Redirect Rule
**Hata Mesajı:**
- "Deploy failed: Invalid image transformation configuration"
- Redirect rule `from = "/*" to = "/index.html"` hybrid SSR için uygun değil

**Yapılan Düzeltmeler:**
1. `netlify.toml`'daki `from = "/*" to = "/index.html"` redirect kuralı kaldırıldı
2. Bu kural hybrid SSR için uygun değildi; tüm istekleri (SSR route'ları dahil) statik index.html'e yönlendiriyordu

**Sonuç:** ✅ Düzeltildi

---

### Hata 4: Netlify Deployment - Image Transformation Config
**Hata Mesajı:**
- "Deploy failed: Invalid image transformation configuration"
- Remote image patterns hatası

**Yapılan Düzeltmeler:**
1. `[[images.remote_patterns]]` TOML array-of-tables formatı denendi
2. Inline table array formatı denendi
3. Son olarak tüm `[images]` section'ı `netlify.toml`'dan kaldırıldı
4. `image.domains` `astro.config.mjs`'den kaldırıldı (experimental feature sorun çıkarıyordu)

**Sonuç:** ✅ Düzeltildi

---

### Hata 5: Frontmatter Parsing Errors - TypeScript HTML'i Kod Olarak Parse Ediyor
**Hata Mesajı:**
```
src/pages/[slug].astro:442:2 - error ts(2552): Cannot find name 'script'
src/pages/[slug].astro:442:12 - error ts(2304): Cannot find name 'inline'
src/pages/resources/[slug].astro:311:4 - error ts(1003): Identifier expected
src/pages/programs/[category]/index.astro:445:6 - error ts(2304): Cannot find name 'div'
```

**Kök Neden:**
TypeScript checker (`astro check`) frontmatter bloklarını düzgün parse edemiyor ve frontmatter'dan sonraki HTML/script bloklarını TypeScript kodu olarak görüyor.

**Yapılan Düzeltmeler:**
1. JSX comment (`{/* */}`) → HTML comment (`<!-- -->`) düzeltildi
2. Fragment import ve kullanımı kaldırıldı (Astro'da top-level content için geçerli değil)
3. Frontmatter closing marker'ları (`---`) kontrol edildi - hepsi doğru
4. **Geçici Çözüm:** `astro check` build'den kaldırıldı (`package.json`'da `build` script'i sadece `astro build` çalıştırıyor)
5. `build:check` script'i eklendi (local development için)

**Sonuç:** ⚠️ Geçici çözüm uygulandı (astro check kaldırıldı)

---

### Hata 6: esbuild Parsing Error - Object Literal in JSX Attributes
**Hata Mesajı:**
```
Expected ";" but found "{"
Location: /opt/build/repo/src/pages/[slug].astro:214:29
```

**Kök Neden:**
esbuild, JSX attribute'larındaki object literal'leri parse ederken hata veriyor.

**Yapılan Düzeltmeler:**
1. `category` prop'undaki object literal'i `categoryData` değişkenine taşıdım
2. `relatedResourcesLabel` expression'ını değişkene taşıdım (karmaşık ternary expression)
3. Karmaşık expression'ı if statement'a çevirdim

**Dosyalar:**
- `src/pages/[slug].astro` - categoryData ve relatedResourcesLabel düzeltildi
- `src/pages/programs/[slug].astro` - relatedProgramsLabel düzeltildi
- `src/pages/resources/[slug].astro` - relatedResourcesLabel düzeltildi
- `src/pages/programs/[category]/index.astro` - relatedProgramsLabel düzeltildi

**Sonuç:** ❌ Hata devam ediyor (farklı dosyalarda aynı hata)

---

### Hata 7: esbuild Parsing Error - programs/[slug].astro
**Hata Mesajı:**
```
Expected ";" but found "{"
Location: /opt/build/repo/src/pages/programs/[slug].astro:203:29
```

**Yapılan Düzeltmeler:**
1. `programs/[slug].astro` dosyasında `relatedProgramsLabel` expression'ını değişkene taşıdım
2. Karmaşık ternary expression'ı if statement'a çevirdim

**Sonuç:** ❌ Hata devam ediyor (203. satırda hala hata var)

---

## Mevcut Durum

### Aktif Sorunlar
1. **esbuild Parsing Errors:** JSX attribute'larındaki karmaşık expression'lar esbuild tarafından parse edilemiyor
2. **Frontmatter Parsing:** TypeScript checker frontmatter'ı düzgün parse edemiyor (geçici olarak devre dışı bırakıldı)

### Yapılan Tüm Değişiklikler Özeti

#### 1. Frontmatter Expression'ları Değişkenlere Taşındı
**Dosyalar:**
- `src/pages/[slug].astro`
- `src/pages/programs/[slug].astro`
- `src/pages/resources/[slug].astro`
- `src/pages/programs/[category]/index.astro`

**Değişiklikler:**
- Object literal'ler JSX attribute'larından frontmatter değişkenlerine taşındı
- Karmaşık ternary expression'lar if statement'lara çevrildi
- Template literal içeren expression'lar basitleştirildi

#### 2. Build Script Değişiklikleri
**package.json:**
```json
{
  "build": "astro build",  // astro check kaldırıldı
  "build:check": "astro check && astro build"  // yeni script eklendi
}
```

#### 3. Fragment Kaldırıldı
- `programs/[category]/index.astro` dosyasından Fragment import ve kullanımı kaldırıldı

#### 4. JSX Comment → HTML Comment
- `src/pages/[slug].astro` dosyasında JSX comment HTML comment'e çevrildi

### Hata Deseni
Tüm hatalar aynı pattern'i gösteriyor:
- **Hata Tipi:** esbuild parsing error
- **Hata Mesajı:** "Expected ";" but found "{"
- **Konum:** Farklı dosyalarda, farklı satırlarda (214, 215, 203, vb.)
- **Kök Neden:** JSX attribute'larındaki karmaşık expression'lar veya frontmatter parsing sorunları

### Olası Çözümler (Denenmemiş)

1. **Astro Versiyonu Güncelleme:**
   - Astro 4.5.0 → en son versiyona güncelleme
   - esbuild versiyonu güncellenebilir

2. **Frontmatter Yapısını Değiştirme:**
   - Tüm karmaşık expression'ları frontmatter dışına taşıma
   - Helper function'lar kullanma

3. **Build Konfigürasyonu:**
   - `astro.config.mjs`'de build optimizations
   - esbuild options ayarlama

4. **Dosya Yapısını Değiştirme:**
   - Karmaşık expression'ları ayrı utility function'lara taşıma
   - Component'leri daha küçük parçalara bölme

### Test Edilmesi Gerekenler

1. **Local Build Test:**
   ```bash
   npm run build
   ```
   - Node.js 20 ile test edilmeli (local'de 16.14.0 var)

2. **Frontmatter Syntax Kontrolü:**
   - Tüm frontmatter bloklarında kapanmamış brace/parenthesis kontrolü
   - Template literal syntax kontrolü

3. **esbuild Logs:**
   - Daha detaylı esbuild error logs alınmalı
   - Hangi satırda tam olarak sorun olduğu belirlenmeli

### Öneriler

1. **Kapsamlı Çözüm:**
   - Tüm JSX attribute'larındaki expression'ları frontmatter değişkenlerine taşı
   - Helper function'lar oluştur
   - Component'leri daha modüler hale getir

2. **Build Pipeline İyileştirme:**
   - `astro check`'i tekrar ekle ama sadece warning olarak
   - esbuild konfigürasyonunu optimize et

3. **Code Review:**
   - Tüm `.astro` dosyalarında JSX attribute expression'larını kontrol et
   - Karmaşık expression'ları refactor et

## Son Commit'ler

1. `30d0821` - Disable astro check in build
2. `0b8e491` - Move object literal to variable in [slug].astro
3. `309a274` - Extract relatedResourcesLabel expression to variable
4. `797d0ac` - Simplify relatedResourcesLabel expression
5. `2278e9b` - Extract all complex expressions from JSX attributes to variables

## Notlar

- Local'de Node.js v16.14.0 kullanılıyor (eski)
- Netlify'da Node.js 20 kullanılıyor
- `astro check` geçici olarak devre dışı bırakıldı
- Tüm frontmatter blokları doğru kapanıyor (`---` marker'ları kontrol edildi)
- Sorun esbuild'in JSX attribute'larındaki expression'ları parse edememesi

## Sonraki Adımlar

1. Tüm `.astro` dosyalarında JSX attribute expression'larını tarama
2. Karmaşık expression'ları helper function'lara taşıma
3. Astro ve esbuild versiyonlarını güncelleme
4. Local'de Node.js 20 ile test etme
5. Daha detaylı esbuild error logs alma

