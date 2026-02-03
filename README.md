# Plademy Website

Human-Centered, AI-Powered Learning & Development Platform

## Tech Stack

- **Framework:** Astro 4.5 (Hybrid SSR)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Netlify
- **Search:** Fuse.js
- **Testing:** Playwright + Vitest

## Features

- 🌍 Multi-language support (English, Finnish, Swedish)
- 🚀 Hybrid rendering (Static + Edge SSR)
- 🔍 Client-side search
- 📱 Responsive design
- ⚡ High performance (PageSpeed 95+)
- 🔒 Secure (RLS policies)
- 🤖 n8n integration for content automation

## Setup

### Prerequisites

- **Node.js 18.17.1+** (20+ recommended)
- npm 9.6.5+ or pnpm 7.1.0+
- Supabase account
- Netlify account

**Note:** Node.js v16 is not supported. Please upgrade to Node 18+.

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# PUBLIC_SUPABASE_URL=...
# PUBLIC_SUPABASE_ANON_KEY=...
# N8N_WEBHOOK_URL=...
# Optional (recommended for production): form spam protection
# PUBLIC_TURNSTILE_SITE_KEY=...   (from Cloudflare Turnstile)
# TURNSTILE_SECRET_KEY=...
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# E2E tests (UI mode)
npm run test:ui
```

## Database Setup

1. Create Supabase project
2. Run migrations:

```bash
# In Supabase SQL Editor, run:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_rls_policies.sql
# supabase/migrations/003_seed_categories.sql
```

## Deployment

### Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `N8N_WEBHOOK_URL`
   - `PUBLIC_SITE_URL`

### Environment Variables

- `PUBLIC_SUPABASE_URL` - Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `N8N_WEBHOOK_URL` - n8n webhook URL for forms
- `PUBLIC_SITE_URL` - Site URL (https://plademy.com)

**Note:** `SERVICE_ROLE_KEY` should only be used in n8n, never in the website.

## Project Structure

```
plademy/
├── src/
│   ├── components/     # UI components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Routes (SSG + SSR)
│   ├── lib/            # Utilities, Supabase client
│   ├── i18n/           # Translation files
│   └── styles/          # Global styles
├── supabase/
│   └── migrations/      # Database migrations
├── tests/               # Test files
└── netlify/             # Netlify functions
```

## Documentation

See `project-plan/` directory for detailed documentation:

- `development-phases.md` - Development phases
- `tech-stack.md` - Technology decisions
- `database-schema.md` - Database structure
- `test-plan.md` - Testing strategy
- `n8n-integration.md` - n8n workflow guide
- `security.md` - Security best practices

## License

© All rights reserved - Plademy Oy
