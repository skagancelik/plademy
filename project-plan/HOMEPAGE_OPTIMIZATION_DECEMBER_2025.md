# Anasayfa Optimizasyon Raporu - Aralık 2025

## Analiz

### Mevcut Durum (Öncesi)

**Sorgular:**
1. Resource categories query: 1 query (selective fields ✅)
2. Program categories query: 1 query (selective fields ✅)
3. Her resource kategori için ayrı query: **6 kategori × 1 query = 6 query**
   - Limit: 6 kayıt (ama sadece 2 gösteriliyor)
4. Her program kategori için ayrı query: **8 kategori × 1 query = 8 query**
   - Limit: 6 kayıt (ama sadece 2 gösteriliyor)
5. Latest programs query: **1 query (gereksiz, kullanılmıyor)**

**Toplam Query Sayısı:** 17 query
**Gereksiz Veri Transferi:**
- Her kategori için 6 kayıt çekiliyor, sadece 2 gösteriliyor
- %66 gereksiz veri transferi (4 kayıt × kategori sayısı)

### Optimizasyonlar (Sonrası)

**Yapılan İyileştirmeler:**

1. **Limit Optimizasyonu:**
   - `limit(6)` → `limit(2)` (sadece gösterilecek kadar)
   - **Kazanım:** Her kategori için %66 veri transferi azalması
   - **Toplam:** ~24 kayıt yerine ~8 kayıt çekiliyor (resource kategorileri için)
   - **Toplam:** ~32 kayıt yerine ~16 kayıt çekiliyor (program kategorileri için)

2. **Gereksiz Query Kaldırıldı:**
   - `latestPrograms` query kaldırıldı (kullanılmıyordu)
   - **Kazanım:** 1 query azalması, ~5 kayıt veri transferi azalması

3. **Selective Fields Tutarlılığı:**
   - Category queries'de `CATEGORY_FULL_FIELDS` constant kullanılıyor
   - **Kazanım:** Kod tutarlılığı, bakım kolaylığı

**Yeni Toplam Query Sayısı:** 16 query (1 query azalması)

**Ekonomik Etki:**
- **Veri Transferi Azalması:**
  - Resource kategorileri: ~24 kayıt → ~12 kayıt (%50 azalma)
  - Program kategorileri: ~32 kayıt → ~16 kayıt (%50 azalma)
  - Latest programs: ~5 kayıt → 0 kayıt (%100 azalma)
  - **Toplam:** ~61 kayıt → ~28 kayıt (%54 veri transferi azalması)

## Detaylı Analiz

### Query Yapısı

**1. Category Queries (2 query):**
```typescript
// Resource categories
.select(CATEGORY_FULL_FIELDS) // ✅ Optimize edildi
.eq('type', 'resource')

// Program categories  
.select(CATEGORY_FULL_FIELDS) // ✅ Optimize edildi
.eq('type', 'program')
```

**2. Resource Queries (6 query - her kategori için):**
```typescript
// ÖNCE: limit(6) - sadece 2 gösteriliyor
// SONRA: limit(2) - sadece gösterilecek kadar ✅
.select('id, slug, title, excerpt, cover_image_url, category, published_at')
.eq('category', categoryName)
.limit(2) // ✅ Optimize edildi
```

**3. Program Queries (8 query - her kategori için):**
```typescript
// ÖNCE: limit(6) - sadece 2 gösteriliyor
// SONRA: limit(2) - sadece gösterilecek kadar ✅
.select('id, slug, title, excerpt, cover_image_url, category, published_at, goal, duration, audience')
.eq('category', categoryName)
.limit(2) // ✅ Optimize edildi
```

**4. Latest Programs Query:**
```typescript
// ❌ KALDIRILDI: Kullanılmıyordu
// Footer'da zaten latest programs var
```

### Neden Her Kategori İçin Ayrı Query?

**Mevcut Yaklaşım (Doğru):**
- Her kategori için ayrı query yapılıyor
- Bu yaklaşım doğru çünkü:
  - Her kategori farklı içerikler gösteriyor
  - Category name matching gerekli (category NAME ile filtreleme)
  - Supabase'de batch query yapmak karmaşık (category name array ile `.in()` kullanılamaz)

**Alternatif Yaklaşım (Düşünülebilir ama Karmaşık):**
- Tüm kategoriler için tek query yapıp client-side'da gruplamak
- ❌ Bu client-side filtering olur (istemediğimiz pattern)
- ❌ Tüm kayıtları çekmek gerekir (daha fazla veri transferi)

**Sonuç:** Mevcut yaklaşım doğru, sadece limit optimize edildi.

## Ekonomik Etki Hesaplaması

### Örnek Senaryo:
- 6 resource kategorisi
- 8 program kategorisi
- Her kategori için ortalama 2 kayıt gösteriliyor

**ÖNCE:**
- Resource queries: 6 kategori × 6 kayıt = 36 kayıt (sadece 12 gösteriliyor)
- Program queries: 8 kategori × 6 kayıt = 48 kayıt (sadece 16 gösteriliyor)
- Latest programs: 5 kayıt
- **Toplam:** 89 kayıt çekiliyor, 28 gösteriliyor

**SONRA:**
- Resource queries: 6 kategori × 2 kayıt = 12 kayıt (12 gösteriliyor)
- Program queries: 8 kategori × 2 kayıt = 16 kayıt (16 gösteriliyor)
- Latest programs: 0 kayıt (kaldırıldı)
- **Toplam:** 28 kayıt çekiliyor, 28 gösteriliyor

**Kazanım:**
- **%68 veri transferi azalması** (89 → 28 kayıt)
- **1 query azalması**
- **%100 veri kullanım verimliliği** (önceden %31, şimdi %100)

## Sonuç

**Durum:** ✅ **OPTİMİZE EDİLDİ**

**Yapılan İyileştirmeler:**
1. ✅ Limit optimizasyonu (6 → 2)
2. ✅ Gereksiz query kaldırıldı (latestPrograms)
3. ✅ Selective fields tutarlılığı (CATEGORY_FULL_FIELDS)

**Ekonomik Etki:**
- ✅ %68 veri transferi azalması
- ✅ 1 query azalması
- ✅ %100 veri kullanım verimliliği

**Not:** Her kategori için ayrı query yapılması doğru yaklaşım (farklı kategoriler, farklı içerikler). Limit optimizasyonu ile gereksiz veri transferi önlendi.

**Tarih:** Aralık 2025


