# Test Plan

## Test Stratejisi

### Unit Tests (Vitest)
**Kapsam:** Utility functions, helpers, i18n

**Dosyalar:**
- `tests/unit/utils.test.ts` - Utility function testleri

**Örnek Testler:**
- `slugify()` - Text to slug conversion
- `truncate()` - Text truncation
- `formatDate()` - Date formatting
- `getTranslations()` - i18n helper

---

### Component Tests (Vitest + Testing Library)
**Kapsam:** UI componentleri

**Test Edilecekler:**
- Component rendering
- Props handling
- Event handlers
- Accessibility

---

### E2E Tests (Playwright)
**Kapsam:** Kritik user flow'lar

**Test Dosyaları:**
- `tests/e2e/home.spec.ts` - Home page navigation
- `tests/e2e/forms.spec.ts` - Form submissions
- `tests/e2e/search.spec.ts` - Search functionality

**Test Senaryoları:**

#### Home Page
- ✅ Home page yüklenir
- ✅ Dil değiştirme çalışır
- ✅ Navigation linkleri çalışır

#### Forms
- ✅ Contact form submit
- ✅ Start form submit
- ✅ Form validation
- ✅ Success/error messages

#### Search
- ✅ Search sayfası yüklenir
- ✅ Arama input görünür
- ✅ Sonuçlar gösterilir

---

### Visual Regression (Playwright)
**Kapsam:** UI consistency

**Test Senaryoları:**
- Home page screenshot
- Resource detail page screenshot
- Program detail page screenshot
- Mobile responsive screenshots

---

### Performance Tests (Lighthouse CI)
**Kapsam:** PageSpeed, Core Web Vitals

**Hedefler:**
- PageSpeed: 95+
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Test Edilecek Sayfalar:**
- Home (`/en/`)
- Resource list (`/en/resources/`)
- Resource detail (`/en/resources/[slug]`)
- Program list (`/en/programs/`)
- Program detail (`/en/programs/[slug]`)

---

### Accessibility Tests (axe-core)
**Kapsam:** WCAG 2.1 AA compliance

**Test Edilecekler:**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader compatibility
- Color contrast

---

### Security Tests (Manual)
**Kapsam:** RLS, key exposure

**Test Senaryoları:**
- ✅ RLS politikaları çalışıyor
- ✅ ANON key ile yazma engellenmiş
- ✅ SERVICE_ROLE key gizli
- ✅ Form submissions güvenli

---

## Test Edilebilirlik

### data-testid Attributes
Tüm interaktif elementlerde `data-testid` kullanıldı:
- `data-testid="contact-form"`
- `data-testid="start-form"`
- `data-testid="search-input"`
- `data-testid="search-results"`
- `data-testid="resource-card"`
- `data-testid="program-card"`

---

## Test Komutları

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# E2E tests (UI mode)
npm run test:ui

# All tests
npm test && npm run test:e2e
```

---

## CI/CD Integration

### GitHub Actions (Önerilen)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

### Netlify Build
- Tests otomatik çalışır
- Build başarısız olursa deploy edilmez

---

## Test Coverage Hedefleri

- **Unit Tests:** 80%+
- **E2E Tests:** Kritik flow'lar %100
- **Accessibility:** WCAG 2.1 AA
- **Performance:** PageSpeed 95+

