# n8n'den Supabase'e Veri Yükleme Örnekleri

## 🔑 Önemli Notlar

1. **SERVICE_ROLE_KEY kullanın** - n8n'den yazma işlemleri için `SERVICE_ROLE_KEY` gereklidir
2. **ANON_KEY kullanmayın** - ANON_KEY sadece okuma için, yazma yetkisi yok
3. **RLS Politikaları** - SERVICE_ROLE_KEY RLS'yi bypass eder, tam yetkiye sahiptir

---

## 📋 n8n Workflow Yapısı

### Senaryo 1: Resource Ekleme

```
[Webhook Trigger] → [HTTP Request: Insert Resource] → [Response]
```

### Senaryo 2: Program Ekleme

```
[Webhook Trigger] → [HTTP Request: Insert Program] → [Response]
```

### Senaryo 3: Toplu Ekleme (Multiple Resources)

```
[Webhook Trigger] → [Split In Batches] → [HTTP Request: Insert Resource] → [Response]
```

---

## 🔧 n8n HTTP Request Node Yapılandırması

### 1. Resource Ekleme (Single)

**Node Type:** HTTP Request

**Settings:**
- **Method:** POST
- **URL:** `https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/resources`
- **Authentication:** Generic Credential Type
- **Send Headers:**
  ```
  apikey: {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
  Authorization: Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
  Content-Type: application/json
  Prefer: return=representation
  ```

**Body (JSON):**
```json
{
  "slug": "effective-mentoring-strategies",
  "language": "en",
  "title": "Effective Mentoring Strategies for Modern Organizations",
  "description": "Discover proven mentoring strategies that drive employee engagement and career development in today's dynamic workplace.",
  "excerpt": "Learn how to implement effective mentoring programs that create lasting impact on employee growth and organizational success.",
  "content": "# Effective Mentoring Strategies\n\nMentoring is a powerful tool for employee development...\n\n## Key Benefits\n\n1. **Career Growth**\n2. **Knowledge Transfer**\n3. **Employee Retention**\n\n## Implementation Steps\n\n...",
  "keypoints": [
    "Structured mentoring programs increase employee retention by 25%",
    "Regular check-ins and goal setting are critical for success",
    "Technology platforms can streamline mentor-mentee matching"
  ],
  "category": "mentoring-coaching",
  "faqs": [
    {
      "question": "How often should mentors and mentees meet?",
      "answer": "We recommend monthly meetings with weekly check-ins via messaging platforms for optimal engagement."
    },
    {
      "question": "What makes a successful mentoring relationship?",
      "answer": "Clear goals, mutual respect, regular communication, and commitment from both parties are essential."
    },
    {
      "question": "How do you measure mentoring program success?",
      "answer": "Key metrics include employee retention rates, promotion rates, skill development assessments, and participant satisfaction surveys."
    },
    {
      "question": "Can mentoring be done remotely?",
      "answer": "Yes, virtual mentoring has become increasingly effective with video conferencing tools and digital collaboration platforms."
    },
    {
      "question": "What is the ideal mentor-to-mentee ratio?",
      "answer": "A 1:1 ratio is ideal, though group mentoring with 1 mentor to 3-4 mentees can also be effective."
    },
    {
      "question": "How long should a mentoring relationship last?",
      "answer": "Formal mentoring relationships typically last 6-12 months, but informal relationships can continue indefinitely."
    },
    {
      "question": "What training do mentors need?",
      "answer": "Mentors should receive training on active listening, goal setting, feedback delivery, and understanding different learning styles."
    }
  ],
  "cover_image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  "is_published": true
}
```

**n8n Expression (Dynamic):**
```javascript
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
  "is_published": {{ $json.is_published || true }}
}
```

---

### 2. Program Ekleme (Single)

**Node Type:** HTTP Request

**Settings:**
- **Method:** POST
- **URL:** `https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/programs`
- **Authentication:** Generic Credential Type
- **Send Headers:**
  ```
  apikey: {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
  Authorization: Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
  Content-Type: application/json
  Prefer: return=representation
  ```

**Body (JSON):**
```json
{
  "slug": "leadership-development-program",
  "language": "en",
  "title": "Leadership Development Program",
  "description": "A comprehensive 12-month program designed to develop next-generation leaders through mentorship, training, and hands-on experience.",
  "excerpt": "Transform emerging leaders into confident, effective managers with our structured leadership development program.",
  "content": "# Leadership Development Program\n\nOur program is designed to...\n\n## Program Structure\n\n...",
  "keypoints": [
    "12-month structured program with monthly workshops",
    "One-on-one executive coaching sessions",
    "Real-world project leadership opportunities"
  ],
  "goal": "To develop confident, effective leaders who can drive organizational success and inspire their teams.",
  "audience": "High-potential employees with 3+ years of experience who are ready to take on leadership roles.",
  "category": "leadership",
  "faqs": [
    {
      "question": "Who is eligible for this program?",
      "answer": "Employees with 3+ years of experience who demonstrate leadership potential and are recommended by their managers."
    },
    {
      "question": "How long does the program last?",
      "answer": "The program runs for 12 months with monthly workshops and ongoing mentorship."
    },
    {
      "question": "What is the time commitment?",
      "answer": "Participants should expect to dedicate 4-6 hours per month to program activities."
    },
    {
      "question": "Is there a cost to participate?",
      "answer": "The program is fully sponsored by the organization with no cost to participants."
    },
    {
      "question": "What happens after program completion?",
      "answer": "Graduates receive a certificate and are prioritized for leadership role opportunities within the organization."
    },
    {
      "question": "Can I apply if I'm in a different department?",
      "answer": "Yes, the program is open to all departments. Cross-functional leadership experience is encouraged."
    },
    {
      "question": "What support is available during the program?",
      "answer": "Each participant is paired with an executive mentor and has access to program coordinators for ongoing support."
    }
  ],
  "cover_image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  "is_published": true
}
```

---

### 3. Çoklu Dil Desteği (Multiple Languages)

**n8n Workflow:**
```
[Webhook] → [Code: Generate Multi-Language Data] → [Split] → [HTTP Request: Insert]
```

**Code Node (Generate Data):**
```javascript
const baseData = {
  slug: "effective-mentoring-strategies",
  title: {
    en: "Effective Mentoring Strategies",
    fi: "Tehokkaat mentorointistrategiat",
    sv: "Effektiva mentoringsstrategier"
  },
  description: {
    en: "Discover proven mentoring strategies...",
    fi: "Löydä todistetut mentorointistrategiat...",
    sv: "Upptäck beprövade mentoringsstrategier..."
  },
  // ... diğer field'lar
};

const languages = ['en', 'fi', 'sv'];
const items = [];

for (const lang of languages) {
  items.push({
    json: {
      slug: baseData.slug,
      language: lang,
      title: baseData.title[lang],
      description: baseData.description[lang],
      // ... diğer field'lar
    }
  });
}

return items;
```

---

## 📝 Kategori ID'leri (Category Reference)

### Resource Kategorileri:
- `mentoring-coaching` - Mentoring & Coaching
- `career-talent` - Career & Talent Management
- `employee-experience` - Employee Experience & Culture
- `hr-tech` - HR Tech & Innovation
- `entrepreneurship` - Entrepreneurship & Startups
- `community-management` - Community Management

### Program Kategorileri:
- `talent-career-starter` - Talent & Career Starter
- `professional-development` - Professional Development
- `entrepreneurship-program` - Entrepreneurship
- `leadership` - Leadership
- `mentoring-program` - Mentoring
- `coaching-program` - Coaching
- `erg` - ERG
- `dei` - Diversity, Equity, & Inclusion

---

## 🔄 Update (Güncelleme) Örneği

**Method:** PATCH

**URL:** `https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/resources?slug=eq.effective-mentoring-strategies&language=eq.en`

**Headers:** (Aynı - SERVICE_ROLE_KEY)

**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "is_published": false
}
```

---

## 🗑️ Delete (Silme) Örneği

**Method:** DELETE

**URL:** `https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/resources?id=eq.{uuid}`

**Headers:** (Aynı - SERVICE_ROLE_KEY)

**Body:** (Boş)

---

## ✅ Error Handling (n8n)

**HTTP Request Node Settings:**
- ✅ **Continue On Fail:** Enabled
- ✅ **Response Format:** JSON

**Error Handling Node (After HTTP Request):**
```javascript
// Check if request was successful
if ($input.item.json.error) {
  // Log error
  console.error('Supabase Error:', $input.item.json);
  return { json: { success: false, error: $input.item.json } };
}

return { json: { success: true, data: $input.item.json } };
```

---

## 🧪 Test Örneği (cURL)

### Resource Ekleme:
```bash
curl -X POST 'https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/resources' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "slug": "test-resource",
    "language": "en",
    "title": "Test Resource",
    "description": "Test description",
    "excerpt": "Test excerpt",
    "content": "# Test Content",
    "keypoints": ["Point 1", "Point 2", "Point 3"],
    "category": "mentoring-coaching",
    "faqs": [
      {"question": "Q1", "answer": "A1"},
      {"question": "Q2", "answer": "A2"},
      {"question": "Q3", "answer": "A3"},
      {"question": "Q4", "answer": "A4"},
      {"question": "Q5", "answer": "A5"},
      {"question": "Q6", "answer": "A6"},
      {"question": "Q7", "answer": "A7"}
    ],
    "cover_image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    "is_published": true
  }'
```

### Program Ekleme:
```bash
curl -X POST 'https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/programs' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "slug": "test-program",
    "language": "en",
    "title": "Test Program",
    "description": "Test description",
    "excerpt": "Test excerpt",
    "content": "# Test Content",
    "keypoints": ["Point 1", "Point 2", "Point 3"],
    "goal": "Test goal",
    "audience": "Test audience",
    "category": "leadership",
    "faqs": [
      {"question": "Q1", "answer": "A1"},
      {"question": "Q2", "answer": "A2"},
      {"question": "Q3", "answer": "A3"},
      {"question": "Q4", "answer": "A4"},
      {"question": "Q5", "answer": "A5"},
      {"question": "Q6", "answer": "A6"},
      {"question": "Q7", "answer": "A7"}
    ],
    "cover_image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    "is_published": true
  }'
```

---

## 📋 n8n Environment Variables

n8n'de şu environment variable'ı ayarlayın:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Not:** SERVICE_ROLE_KEY'i asla public repository'ye commit etmeyin!

---

## 🎯 Özet

1. ✅ **SERVICE_ROLE_KEY kullanın** (ANON_KEY değil)
2. ✅ **Headers:** `apikey` ve `Authorization` gerekli
3. ✅ **Content-Type:** `application/json`
4. ✅ **Prefer:** `return=representation` (eklenen kaydı döndürür)
5. ✅ **Category ID:** Seed dosyasındaki ID'leri kullanın
6. ✅ **Language:** `en`, `fi`, veya `sv`
7. ✅ **Keypoints:** Array formatında `["Point 1", "Point 2", "Point 3"]`
8. ✅ **FAQs:** JSON array formatında `[{"question": "...", "answer": "..."}]`

