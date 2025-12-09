# Security Guide

## Supabase Row Level Security (RLS)

### Neden Önemli?

**ANON_KEY** tarayıcı konsolunda görünür. RLS olmadan:
- ❌ Herkes veritabanını okuyabilir (published olmayan içerikler dahil)
- ❌ Herkes veritabanını silebilir/değiştirebilir
- ❌ Service role key'e erişim olabilir

**RLS ile:**
- ✅ Sadece published içerikler okunabilir
- ✅ Sadece service_role yazabilir
- ✅ Güvenli ve kontrollü erişim

---

## Key Management

### ANON_KEY (Public)
- **Kullanım:** Site okuma işlemleri (Edge SSR)
- **Yer:** Environment variable (`PUBLIC_SUPABASE_ANON_KEY`)
- **Güvenlik:** RLS politikaları ile korumalı
- **Expose:** ✅ Public (tarayıcıda görünür, sorun değil)

### SERVICE_ROLE_KEY (Secret)
- **Kullanım:** n8n yazma işlemleri
- **Yer:** n8n environment variable (`SUPABASE_SERVICE_ROLE_KEY`)
- **Güvenlik:** Asla public'e expose etme!
- **Expose:** ❌ Private (sadece n8n'de)

---

## RLS Policies

### Resources Table

```sql
-- Public can read published resources
CREATE POLICY "Public can read published resources"
ON resources FOR SELECT
USING (is_published = true);

-- Service role has full access
CREATE POLICY "Service role full access resources"
ON resources FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Sonuç:**
- ✅ Public: Sadece `is_published = true` olanları okuyabilir
- ✅ Service Role: Tüm işlemler (INSERT, UPDATE, DELETE)

### Programs Table

Aynı mantık resources gibi.

### Categories Table

```sql
-- Public can read all categories
CREATE POLICY "Public can read categories"
ON categories FOR SELECT
USING (true);
```

**Sonuç:**
- ✅ Public: Tüm kategorileri okuyabilir
- ✅ Service Role: Tüm işlemler

---

## Environment Variables Security

### Netlify
```env
# Public (browser'da görünür)
PUBLIC_SUPABASE_URL=https://...
PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Private (sadece server-side)
N8N_WEBHOOK_URL=https://...
```

**ÖNEMLİ:** `PUBLIC_` prefix'i olanlar browser'da expose edilir. `SERVICE_ROLE_KEY` asla `PUBLIC_` prefix'i kullanma!

### n8n
```env
# Private (asla expose etme)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_URL=https://...
```

---

## Security Checklist

### ✅ Yapılması Gerekenler
- [x] RLS enabled tüm tablolarda
- [x] Public SELECT politikaları (sadece published)
- [x] Service role full access (n8n için)
- [x] ANON_KEY public (sorun değil, RLS koruyor)
- [x] SERVICE_ROLE_KEY private (n8n'de gizli)
- [x] Environment variables doğru ayarlanmış

### ❌ Yapılmaması Gerekenler
- [ ] SERVICE_ROLE_KEY'i public'e expose etme
- [ ] RLS'i disable etme
- [ ] Public'e yazma izni verme
- [ ] Published olmayan içerikleri public'e gösterme

---

## Testing Security

### RLS Test
```sql
-- ANON key ile test (browser console'dan)
-- Sadece published içerikler görünmeli
SELECT * FROM resources WHERE is_published = false;
-- Sonuç: 0 rows (RLS engelliyor)

-- Published içerikler görünmeli
SELECT * FROM resources WHERE is_published = true;
-- Sonuç: Published içerikler
```

### Service Role Test
```bash
# SERVICE_ROLE_KEY ile test (n8n'den)
# Tüm içerikler görünmeli
curl -X GET https://[project].supabase.co/rest/v1/resources \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
# Sonuç: Tüm içerikler (published + unpublished)
```

---

## Common Security Issues

### Issue 1: RLS Disabled
**Problem:** Herkes veritabanını okuyabilir/silebilir  
**Çözüm:** RLS'i enable et, politikaları oluştur

### Issue 2: SERVICE_ROLE_KEY Exposed
**Problem:** Key public'de görünür, herkes yazabilir  
**Çözüm:** Key'i sadece n8n'de tut, asla commit etme

### Issue 3: Public Write Access
**Problem:** ANON_KEY ile yazma izni var  
**Çözüm:** Service role dışında yazma izni verme

---

## Best Practices

1. **Always Use RLS:** Tüm tablolarda RLS enabled
2. **Principle of Least Privilege:** Minimum gerekli izinler
3. **Key Rotation:** Düzenli olarak key'leri rotate et
4. **Monitoring:** Supabase dashboard'da access log'ları kontrol et
5. **Testing:** Security testlerini düzenli çalıştır

---

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Environment Variables Guide](https://supabase.com/docs/guides/api/api-keys)

