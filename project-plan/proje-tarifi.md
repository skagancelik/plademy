Proje Tarifi :

Şu an https://github.com/skagancelik/plademy  reposunun localdeki klasörünü Cursor ile açtık.

Proje :
Plademy.com web sitesi.

İstekler : 
UI Netlify üzerinden deploy edilecek.
Backend : Supabase ve Netlify Edge Functions kullanılacak.
Bir blog yapısı olacak ama sayfa linkleri plademy.com/abc şeklinde olacak.
SEO ve LLM web-search uyumlu olacak.
Google PageSpeed Insights puanı 100 olacak şekilde geliştirilecek.
Kullanılacak UI componentlerleri Cursor, Browser MCP, Playwrigt gibi araçlarla çok kolay test edilebilmeli. Test araçları menülerde ve arayüzde kolay gezinebilmeli.

Önemli özellikler :
* Minimalist, Modern UI,
* Responsive Design
* Fast Loading
* Yüksek performanslı ve güvenli
* Tüm site için ortak footer ve header.
* İyi çalışan arama özelliği
* Tüm sayfalarda İngilizce, Fince, İsveççe desteği olacak. Menüler, kategoriler, formlar 3 dilde olacak. 
* Resources altındaki içerikler dile göre görüntülencek. Örnek: Eğer site arayüzü İngilizce ise Resources altındaki içeriklerin İngilizce olanları görüntülenecek. Bu içeriklerin hepsinin Fincesi ve İsveççesi olmayabilir.
* Yeni bir dil eklenebilecek şekilde tasarlanacak.
* Resources ve Programs altındaki içerikler dışındaki içerikler özel olarak üretilecek.
Resources ve Programs altındaki içerikler n8n otomasyonu ile üretilecek.

Sitenin öne çıkan sayfaları :
* Home
* Programs sayfası
* Program sayfaları yaklaşık 100 ad
* Resources
* Kategori sayfaları : Kategori adı, Kategori açıklaması, Kategori görseli, Kategori içerikleri kart görünümünde. scroll ile sonsuz yükleme. ilk yüklemede son 20 içerik görüntülenir.
* İçerik sayfaları : yaklaşık 1000 ad
* Integrations
* Start
* Privacy
* Contact
* Search


Resources altındaki içerikler siteye otomatik olarak şu şekilde eklenecek : 
n8n her içerik için title, description, excerpt, slug, keypoint1, keypoint2, keypoint3, content(md formatında), faq1, faq2, faq3, faq4, faq5, faq6, faq7, cover-image-url, content language verilerini üretecek ve üretilen içerikler sitede görünecek.


Resources bölümünde olacak kategoriler :
* Mentoring & Coaching
* Career & Talent Management
* Employee Experience & Culture
* HR Tech & Innovation
* Entrepreneurship & Startups
* Community Management

Program sayfaları siteye otomatik olarak şu şekilde eklenecek : 
n8n her program için title, description, excerpt, slug, keypoint1, keypoint2, keypoint3, content(md formatında), program goal, program audience, program category, faq1, faq2, faq3, faq4, faq5, faq6, faq7, cover-image-url, content language verilerini üretecek ve üretilen programlar sitede görünecek.

Program kategorileri :
* Talent & Career Starter
* Professional Development
* Entrepreneurship
* Leadership
* Mentoring
* Coaching
* ERG
* Diversity, Equity, & Inclusion



Resources bölümündeki içerik sayfalarının yapısı :
* Başlık
* Kısa açıklama (ilgi çekici ve SEO uyumlu)
* Görsel
* Keypoints : 3 Adet
* İçerik
* FAQ İçerik ile ilgili 7 soru.

Metataglar:
Tüm sayfalarda SEO, sosyal medya, whatsapp ve LLM uyumlu metataglar olacak.

Anasayfa ve footer'da Resources kategorileri ve her kategoriden son 5 içerik linkli şekilde görüntülenecek.

Geliştirme :
Tüm geliştirmeler Cursor tarafından yapılacak.
Tüm testleri Cursor tarafından yapılacak.
Github, Netlify, Supabase kullanılacak.

---

## Build ve Deployment Notları

### Önemli Build Kuralları

**IIFE Pattern Kullanımı:**
- ❌ **Template içinde IIFE kullanmayın:** `(() => { ... })()` pattern'leri esbuild tarafından parse edilemez
- ✅ **Frontmatter'da işleyin:** Karmaşık işlemleri frontmatter bloğunda yapın, template'de sadece değişken referansları kullanın
- **Örnek:**
  ```astro
  <!-- YANLIŞ -->
  {resource.content && (() => {
    const processed = processContent(resource.content);
    return <div set:html={processed} />;
  })()}
  
  <!-- DOĞRU -->
  ---
  let processedContent: string | null = null;
  if (resource && resource.content) {
    processedContent = processContent(resource.content);
  }
  ---
  {processedContent && <div set:html={processedContent} />}
  ```

**JSX Attribute Expression'ları:**
- ❌ **Karmaşık expression'lar JSX attribute'larında kullanmayın:** Nested ternary, template literals gibi karmaşık expression'lar
- ✅ **Frontmatter'da değişkene taşıyın:** Karmaşık expression'ları frontmatter'da işleyip basit değişken olarak kullanın

**Build Script:**
- `package.json`'da `build` script'i sadece `astro build` çalıştırıyor (astro check geçici olarak kaldırıldı)
- Local development için `npm run build:check` kullanılabilir (astro check + build)

**Netlify Deployment:**
- ❌ **Image transformation config eklemeyin:** `netlify.toml`'a `[images]` section'ı eklemeyin (deployment hatası verir)
- ❌ **Redirect rules:** Hybrid SSR için `from = "/*" to = "/index.html"` redirect kuralı kullanmayın
- ✅ **Edge Functions:** `netlify/edge-functions/` dizinindeki dosyalar otomatik keşfedilir

**Environment Variables:**
- Runtime SSR'da `process.env` kullanın (Astro API Routes için)
- Build-time'da `import.meta.env` kullanın (frontmatter için)
- `N8N_WEBHOOK_URL` gibi runtime değişkenler `process.env` ile okunmalı

 