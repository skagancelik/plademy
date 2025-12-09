# Technology Stack

## Frontend

### Astro 4.5
- **Neden?** Hybrid rendering (SSG + SSR), Islands Architecture, minimal JS
- **Build Time:** ~30 saniye (sadece statik sayfalar)
- **Output:** Hybrid (statik + Edge SSR)

### Tailwind CSS v4
- **Neden?** Utility-first, minimal bundle size, responsive
- **Kullanım:** Global styles + component classes

### TypeScript
- **Neden?** Type safety, better DX
- **Config:** `tsconfig.json` with path aliases

---

## Backend

### Supabase (Free Tier)
- **Database:** PostgreSQL (500MB)
- **Storage:** 1GB
- **API:** REST API (500K requests/ay)
- **RLS:** Row Level Security enabled

### Netlify Edge Functions
- **Neden?** Edge SSR için, 3M requests/ay ücretsiz
- **Kullanım:** Dinamik sayfalar (Resources, Programs)

---

## Build & Deploy

### Netlify
- **Build:** 300 dk/ay ücretsiz (hybrid ile ~5 dk/ay)
- **Bandwidth:** 100GB/ay
- **Edge Functions:** 3M requests/ay
- **SSL:** Otomatik (ücretsiz)

---

## Testing

### Vitest
- **Kullanım:** Unit testler
- **Config:** `vitest.config.ts`

### Playwright
- **Kullanım:** E2E testler
- **Config:** `playwright.config.ts`
- **Browsers:** Chromium, Firefox, WebKit

---

## Search

### Fuse.js
- **Size:** ~6KB gzipped
- **Kullanım:** Client-side fuzzy search
- **Veri:** Supabase'den JSON index

---

## Forms

### Netlify Functions
- **Endpoint:** `/api/form`
- **Flow:** Form → Netlify Function → n8n Webhook → Email

---

## i18n

### JSON Files
- **Diller:** en, fi, sv
- **Yapı:** `src/i18n/[lang].json`
- **Helper:** `src/lib/i18n.ts`

---

## SEO

### Meta Tags
- Open Graph
- Twitter Card
- JSON-LD (Article, Organization)
- hreflang alternates

### Sitemap
- **Statik:** `@astrojs/sitemap` (statik sayfalar)
- **Dinamik:** `/sitemap.xml.ts` (Edge SSR sayfalar)

---

## Image Optimization

### Astro Image
- **Remote Patterns:** Supabase, DALL-E, Unsplash
- **CDN:** Netlify Image CDN
- **Format:** WebP, lazy loading

---

## Dependencies

### Production
```json
{
  "astro": "^4.5.0",
  "@astrojs/netlify": "^5.3.0",
  "@astrojs/tailwind": "^5.1.2",
  "@supabase/supabase-js": "^2.39.3",
  "fuse.js": "^7.0.0",
  "tailwindcss": "^4.0.0"
}
```

### Development
```json
{
  "@playwright/test": "^1.41.0",
  "vitest": "^1.2.1",
  "typescript": "^5.3.3"
}
```

---

## Environment Variables

```env
PUBLIC_SUPABASE_URL=your-project-url.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/form
PUBLIC_SITE_URL=https://plademy.com
```

---

## Performance Targets

- **PageSpeed:** 95+ (Edge SSR overhead ile)
- **Lighthouse:** 95+ (tüm kategoriler)
- **Core Web Vitals:** Pass
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s

