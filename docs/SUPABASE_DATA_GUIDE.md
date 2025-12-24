# Supabase'e Veri Gönderme Rehberi

## Yöntem 1: Supabase Dashboard (Manuel - Test için)

### Adımlar:

1. **Supabase Dashboard'a Git**
   - https://supabase.com/dashboard
   - Projeni seç: `Plademy Website`

2. **Table Editor'a Git**
   - Sol menüden **Table Editor** → **resources** veya **programs**

3. **Yeni Kayıt Ekle**
   - **Insert** → **Insert row** tıkla
   - Gerekli alanları doldur:

#### Resources Tablosu için:
```sql
- title: "Örnek Resource Başlığı"
- slug: "ornek-resource-basligi" (küçük harf, tire ile)
- language: "en" (veya "fi", "sv")
- category_id: 1 (categories tablosundan bir ID)
- description: "Uzun açıklama metni"
- excerpt: "Kısa özet"
- content: "Markdown veya HTML içerik"
- cover_image_url: "https://example.com/image.jpg"
- keypoints: ["Nokta 1", "Nokta 2", "Nokta 3"] (JSON array)
- is_published: true
- published_at: "2024-01-01T00:00:00Z"
```

#### Programs Tablosu için:
```sql
- title: "Örnek Program Başlığı"
- slug: "ornek-program-basligi"
- language: "en"
- category_id: 1
- description: "Uzun açıklama"
- excerpt: "Kısa özet"
- content: "Markdown içerik"
- cover_image_url: "https://example.com/image.jpg"
- keypoints: ["Nokta 1", "Nokta 2"]
- is_published: true
- published_at: "2024-01-01T00:00:00Z"
```

4. **Kaydet**
   - **Save** butonuna tıkla
   - Sayfa otomatik yenilenecek ve içerik görünecek

---

## Yöntem 2: n8n Workflow (Otomatik - Production)

### n8n Workflow Kurulumu:

1. **n8n'de Yeni Workflow Oluştur**
   - n8n dashboard'a git
   - **New Workflow** oluştur

2. **HTTP Request Node Ekle**
   - **Add Node** → **HTTP Request**
   - Ayarlar:
     ```
     Method: POST
     URL: https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/resources
     (veya /programs için: /rest/v1/programs)
     ```

3. **Headers Ekle**
   - **Add Header**:
     ```
     apikey: [SERVICE_ROLE_KEY] (Supabase Settings → API → service_role key)
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
     Prefer: return=representation
     ```

4. **Body (JSON) Ekle**
   ```json
   {
     "title": "{{ $json.title }}",
     "slug": "{{ $json.slug }}",
     "language": "{{ $json.language }}",
     "category_id": {{ $json.category_id }},
     "description": "{{ $json.description }}",
     "excerpt": "{{ $json.excerpt }}",
     "content": "{{ $json.content }}",
     "cover_image_url": "{{ $json.cover_image_url }}",
     "keypoints": {{ $json.keypoints }},
     "is_published": true,
     "published_at": "{{ $now.toISO() }}"
   }
   ```

5. **Test Et**
   - **Execute Workflow** ile test et
   - Supabase'de kaydın oluştuğunu kontrol et

---

## Yöntem 3: cURL ile Test (Terminal)

### Resources için:
```bash
curl -X POST 'https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/resources' \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Resource",
    "slug": "test-resource",
    "language": "en",
    "category_id": 1,
    "description": "Test description",
    "excerpt": "Test excerpt",
    "content": "Test content",
    "cover_image_url": "https://example.com/image.jpg",
    "keypoints": ["Point 1", "Point 2"],
    "is_published": true,
    "published_at": "2024-01-01T00:00:00Z"
  }'
```

### Programs için:
```bash
curl -X POST 'https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/programs' \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Program",
    "slug": "test-program",
    "language": "en",
    "category_id": 1,
    "description": "Test description",
    "excerpt": "Test excerpt",
    "content": "Test content",
    "cover_image_url": "https://example.com/image.jpg",
    "keypoints": ["Point 1", "Point 2"],
    "is_published": true,
    "published_at": "2024-01-01T00:00:00Z"
  }'
```

---

## Önemli Notlar:

### 1. SERVICE_ROLE_KEY Kullanımı
- ⚠️ **SADECE n8n'de kullan!**
- ⚠️ **ASLA frontend'de (browser) kullanma!**
- ⚠️ **ASLA GitHub'a commit etme!**

### 2. RLS (Row Level Security)
- Public kullanıcılar sadece `is_published = true` olan kayıtları görebilir
- SERVICE_ROLE_KEY ile tüm kayıtlar yazılabilir/okunabilir

### 3. Slug Formatı
- Küçük harf
- Boşluklar tire (`-`) ile değiştirilmeli
- Özel karakterler kaldırılmalı
- Örnek: "Test Resource" → "test-resource"

### 4. Category ID'leri
Categories tablosundan ID'leri kontrol et:
```sql
SELECT id, name_en, slug FROM categories;
```

### 5. Language Kodları
- `en` - English
- `fi` - Suomi (Finnish)
- `sv` - Svenska (Swedish)

---

## Hızlı Test Senaryosu:

1. **Supabase Dashboard'da manuel ekle:**
   - Table Editor → resources → Insert row
   - Basit bir kayıt ekle
   - `is_published: true` yap
   - Kaydet

2. **Sitede kontrol et:**
   - http://localhost:4321/resources/ sayfasına git
   - Eklediğin kayıt görünmeli

3. **n8n workflow hazırla:**
   - Yeni içerikler için otomatik ekleme workflow'u oluştur
   - SERVICE_ROLE_KEY ile test et

---

## Sorun Giderme:

### Veri görünmüyor?
- ✅ `is_published = true` olduğundan emin ol
- ✅ `language` doğru mu kontrol et
- ✅ RLS policy'lerin aktif olduğunu kontrol et

### Hata alıyorum?
- ✅ SERVICE_ROLE_KEY doğru mu?
- ✅ URL doğru mu? (`/rest/v1/resources` veya `/rest/v1/programs`)
- ✅ JSON formatı doğru mu?
- ✅ Required alanlar doldurulmuş mu?

---

**Daha fazla bilgi için:** `project-plan/n8n-integration.md` dosyasına bak.

