# n8n Node Yapılandırmaları - Plademy Content Generation

## Workflow Yapısı

```
Research Node
    ↓
[Node 1: MD Content Generator]
    ↓
[Node 2: MD Cleaner] (Code)
    ↓
[Node 3: Metadata Generator]
    ↓
[Node 4: Validator] (Code)
    ↓
[Node 5: Content Merger] (Code) ← Node 2'den cleanContent, Node 4'ten metadata
    ↓
[Node 6: Insert to Supabase] (HTTP Request)
```

---

## Node 1: MD Content Generator

**Type:** `@n8n/n8n-nodes-langchain.agent`

### System Message

```
You are a senior content writer for Plademy (https://plademy.com). Write practical, actionable content in pure Markdown for {{ $('Content Type').item.json.type }}.

Audience: {{ $('Audience').item.json.audience }} in {{ $('Category').item.json.category }}.

Provide step-by-step guidance, examples, and checklists. Avoid generic statements. Use only research results.

Never use: conclusion, delve, elevate, leverage, journey, seamless, comprehensive, ultimately, profound, in conclusion, to sum up, final thoughts.

First H2 (##) must rephrase the title using synonyms—NEVER repeat exact title.

Output ONLY raw Markdown—no code wrappers (```markdown, ```), no comments, no explanations.

Use: ## for H2, ### for H3, **bold**, *italic*, - for lists, > for quotes, [text](url) for links.

Minimum 800 words, ideally 1000-1200 words.
```

### Prompt

```
TASK
Generate comprehensive Markdown content for Plademy using ONLY the RESEARCH RESULTS. Output pure Markdown, no code wrappers.

TONE
Authoritative, practical, supportive. Avoid AI jargon and robotic phrasing.

REQUIREMENTS
- Practical focus: Implementation strategies, best practices, actionable steps
- Include checklists, examples, scenarios from research
- 800-1200 words minimum
- First H2 (##): Rephrase title using synonyms—NEVER repeat exact title
- Integrate focus keyword naturally
- Use heading hierarchy: ##, ###, ####
- Short paragraphs, lists, blockquotes for readability

MARKDOWN FORMAT
- **bold**, *italic*, `code`
- - for bullets, 1. 2. 3. for numbered lists
- > for blockquotes
- [text](url) for links
- NO HTML tags

FORBIDDEN WORDS
conclusion, delve, elevate, leverage, journey, seamless, comprehensive, ultimately, profound, in conclusion, to sum up, final thoughts, deep dive, game-changer, revolutionize, transform

RESEARCH RESULTS:
{{ $('Research').item.json.content }}

TITLE (do not repeat exactly):
{{ $('Title').item.json.title }}

CATEGORY:
{{ $('Category').item.json.category }}

AUDIENCE:
{{ $('Audience').item.json.audience }}

OUTPUT
Output ONLY raw Markdown starting with ## heading. NO code blocks (```markdown, ```), NO explanations, NO extra text.
```

---

## Node 2: MD Cleaner (Code Node)

**Type:** `Code`

```javascript
// n8n Code Node - Markdown Temizleme
let mdString = $input.item.json.output || $input.item.json.text || $input.item.json.content;

// Kod bloğu işaretçilerini temizle
mdString = mdString
  .replace(/^```(?:markdown|md)?\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();

// Gereksiz escape karakterlerini temizle (ama \n korunur)
mdString = mdString.replace(/\\(?!n)/g, '');

// Çoklu boş satırları tek boş satıra indir
mdString = mdString.replace(/\n{3,}/g, '\n\n');

return [{
  json: {
    cleanContent: mdString
  }
}];
```

---

## Node 3: Metadata Generator

**Type:** `@n8n/n8n-nodes-langchain.agent`

### System Message

```
You are an expert content and SEO specialist for Plademy. Create compelling, SEO-optimized metadata for the provided content.

Title and content are already provided - DO NOT generate them. Only create slug, description, excerpt, keypoints, and FAQs.

All elements must be tailored for professional readers seeking practical guidance.

- Slug: Clean, keyword-rich, lowercase, hyphens, max 6 words
- Description: Meta description, under 160 characters, includes keyword
- Excerpt: Short summary, under 200 characters
- Key Points: 3 concrete, actionable points (plain text)
- FAQ: 7 specific Q&A pairs (plain text)

DO NOT include title or content in the output. Output ONLY the JSON object with slug, description, excerpt, keypoint1-3, and faq1-7, nothing else.
```

### Prompt

```
TASK
For the following content, create SEO-optimized slug, description, excerpt, 3 key points, and 7 FAQ sections. 

INPUTS

CONTENT TITLE (already exists, use for context):
{{ $('Title').item.json.title }}

CONTENT (already exists, analyze this):
{{ $('MD Cleaner').item.json.cleanContent }}


REQUIREMENTS

SLUG
- Clean, keyword-rich, lowercase
- Use hyphens, 3-6 words max
- SEO-friendly, no special characters

DESCRIPTION
- Meta description for SEO
- Under 160 characters
- Includes focus keyword
- Clear value proposition

EXCERPT
- Short summary (2-3 sentences)
- Under 200 characters
- Engaging and informative

KEYPOINTS (3 required)
- Three concise, actionable points
- 1-2 sentences each
- Plain text, no HTML

FAQS (7 required)
- 7 question-answer pairs
- Plain text, no HTML
- Each answer 2-4 sentences
- Cover different aspects

OUTPUT FORMAT
Return ONLY this JSON object

{
  "slug": "seo-friendly-slug-here",
  "description": "Meta description under 160 characters",
  "excerpt": "Short engaging excerpt under 200 characters",
  "keypoint1": "First actionable key point",
  "keypoint2": "Second actionable key point",
  "keypoint3": "Third actionable key point",
  "faq1": {
    "question": "First practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  },
  "faq2": {
    "question": "Second practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  },
  "faq3": {
    "question": "Third practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  },
  "faq4": {
    "question": "Fourth practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  },
  "faq5": {
    "question": "Fifth practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  },
  "faq6": {
    "question": "Sixth practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  },
  "faq7": {
    "question": "Seventh practical question?",
    "answer": "Clear, helpful answer (2-4 sentences)"
  }
}

VERY IMPORTANT
- Output MUST be only the JSON object
- Do NOT include code blocks (```json) or markdown
- Return ONLY the JSON object
- Content must be in {{ $('Language').item.json.language }} language
!!!! Output ONLY a valid JSON object, with no explanations, no markdown, and no extra markers.
```

### Structured Output Parser

**Type:** `@n8n/n8n-nodes-langchain.outputParserStructured`

**JSON Schema Example:**

```json
{
  "slug": "example-slug",
  "description": "Example description",
  "excerpt": "Example excerpt",
  "keypoint1": "Example keypoint 1",
  "keypoint2": "Example keypoint 2",
  "keypoint3": "Example keypoint 3",
  "faq1": {
    "question": "Example question 1",
    "answer": "Example answer 1"
  },
  "faq2": {
    "question": "Example question 2",
    "answer": "Example answer 2"
  },
  "faq3": {
    "question": "Example question 3",
    "answer": "Example answer 3"
  },
  "faq4": {
    "question": "Example question 4",
    "answer": "Example answer 4"
  },
  "faq5": {
    "question": "Example question 5",
    "answer": "Example answer 5"
  },
  "faq6": {
    "question": "Example question 6",
    "answer": "Example answer 6"
  },
  "faq7": {
    "question": "Example question 7",
    "answer": "Example answer 7"
  }
}
```

---

## Node 4: Validator (Code Node)

**Type:** `Code`

```javascript
// n8n Code Node - Content Validator
const obj = $json.output ? $json.output : $json;

// Required fields (title and content come from other nodes, not validated here)
const required = [
  "slug",
  "description",
  "excerpt",
  "keypoint1",
  "keypoint2",
  "keypoint3",
  "faq1",
  "faq2",
  "faq3",
  "faq4",
  "faq5",
  "faq6",
  "faq7"
];

let valid = true;
const errors = [];

// Check if all required fields exist
for (const key of required) {
  if (!(key in obj)) {
    valid = false;
    errors.push(`${key} is missing`);
  }
}

// Check for extra fields (optional - remove if you want to allow extra fields)
// for (const key of Object.keys(obj)) {
//   if (!required.includes(key) && key !== 'retryCount') {
//     valid = false;
//     errors.push(`Unexpected field: ${key}`);
//   }
// }

// Validate FAQ structure (each FAQ must have question and answer)
for (let i = 1; i <= 7; i++) {
  const faq = obj[`faq${i}`];
  if (faq) {
    if (!faq.question || !faq.answer) {
      valid = false;
      errors.push(`FAQ ${i} is missing question or answer`);
    }
  }
}

// Validate slug format
if (obj.slug && !/^[a-z0-9-]+$/.test(obj.slug)) {
  valid = false;
  errors.push("Slug contains invalid characters (only lowercase, numbers, hyphens allowed)");
}

// Validate description length
if (obj.description && obj.description.length > 160) {
  errors.push("Description exceeds 160 characters");
}

// Validate excerpt length
if (obj.excerpt && obj.excerpt.length > 200) {
  errors.push("Excerpt exceeds 200 characters");
}

return [{
  json: {
    valid: valid,
    retryCount: $json.retryCount ?? 0,
    original: obj,
    errors: errors
  }
}];
```

---

## Node 5: Content Merger (Set Node)

**Type:** `n8n-nodes-base.set`

### Parameters

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "title-assignment",
          "name": "title",
          "value": "={{ $('Resources').item.json.Title }}",
          "type": "string"
        },
        {
          "id": "slug-assignment",
          "name": "slug",
          "value": "={{ $('Validator').item.json.original.slug }}",
          "type": "string"
        },
        {
          "id": "language-assignment",
          "name": "language",
          "value": "={{ $('Language').item.json.language }}",
          "type": "string"
        },
        {
          "id": "description-assignment",
          "name": "description",
          "value": "={{ $('Validator').item.json.original.description }}",
          "type": "string"
        },
        {
          "id": "excerpt-assignment",
          "name": "excerpt",
          "value": "={{ $('Validator').item.json.original.excerpt }}",
          "type": "string"
        },
        {
          "id": "content-assignment",
          "name": "content",
          "value": "={{ $('MD Cleaner').item.json.cleanContent }}",
          "type": "string"
        },
        {
          "id": "keypoints-assignment",
          "name": "keypoints",
          "value": "={{ [$('Validator').item.json.original.keypoint1, $('Validator').item.json.original.keypoint2, $('Validator').item.json.original.keypoint3].filter(kp => kp && kp.trim().length > 0) }}",
          "type": "array"
        },
        {
          "id": "category-assignment",
          "name": "category",
          "value": "={{ $('Category').item.json.category }}",
          "type": "string"
        },
        {
          "id": "faqs-assignment",
          "name": "faqs",
          "value": "={{ (() => { const faqs = []; for (let i = 1; i <= 7; i++) { const faq = $('Validator').item.json.original['faq' + i]; if (faq && faq.question && faq.answer) { faqs.push({ question: faq.question.trim(), answer: faq.answer.trim() }); } } return faqs.length > 0 ? faqs : null; })() }}",
          "type": "array"
        },
        {
          "id": "cover-image-assignment",
          "name": "cover_image_url",
          "value": "={{ $('Cover Image').item.json.url || null }}",
          "type": "string"
        },
        {
          "id": "is-published-assignment",
          "name": "is_published",
          "value": "true",
          "type": "boolean"
        }
      ]
    },
    "options": {}
  }
}
```

### Alternatif: Code Node Versiyonu (Önerilen - Daha Esnek)

Set Node'da array'ler karmaşık olabilir. Code Node kullanmanız önerilir:

```javascript
// n8n Code Node - Content Merger
const title = $('Resources').item.json.Title;
const cleanContent = $('MD Cleaner').item.json.cleanContent;
const metadata = $('Validator').item.json.original;
const language = $('Language').item.json.language;
const category = $('Category').item.json.category;
const coverImageUrl = $('Cover Image').item.json.url || null;

// Build keypoints array
const keypoints = [
  metadata.keypoint1,
  metadata.keypoint2,
  metadata.keypoint3
].filter(kp => kp && kp.trim().length > 0);

// Build FAQs array
const faqs = [];
for (let i = 1; i <= 7; i++) {
  const faq = metadata[`faq${i}`];
  if (faq && faq.question && faq.answer) {
    faqs.push({
      question: faq.question.trim(),
      answer: faq.answer.trim()
    });
  }
}

// Build final JSON for Supabase (Resource)
const resourceData = {
  slug: metadata.slug,
  language: language,
  title: title,
  description: metadata.description,
  excerpt: metadata.excerpt,
  content: cleanContent,
  keypoints: keypoints,
  category: category,
  faqs: faqs.length > 0 ? faqs : null,
  cover_image_url: coverImageUrl,
  is_published: true
};

return [{
  json: resourceData
}];
```

---

## Node 6: Insert to Supabase (HTTP Request)

**Type:** `n8n-nodes-base.httpRequest`

### Parameters

- **Method:** `POST`
- **URL:** `https://xejvgnygzkpxdzaemgfh.supabase.co/rest/v1/{{ $('Content Type').item.json.type === 'program' ? 'programs' : 'resources' }}`
- **Authentication:** Generic Credential Type
- **Send Headers:**
  - `apikey`: `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Authorization`: `Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- **Send Body:** `true`
- **Body Content Type:** `JSON`
- **JSON Body:** `{{ JSON.stringify($('Content Merger').item.json) }}`

---

## Environment Variables

n8n'de şu environment variable'ı ayarlayın:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Not:** SERVICE_ROLE_KEY'i asla public repository'ye commit etmeyin!

---

## Kategori ID'leri

### Resource Kategorileri:
- `mentoring-coaching`
- `career-talent`
- `employee-experience`
- `hr-tech`
- `entrepreneurship`
- `community-management`

### Program Kategorileri:
- `talent-career-starter`
- `professional-development`
- `entrepreneurship-program`
- `leadership`
- `mentoring-program`
- `coaching-program`
- `erg`
- `dei`

