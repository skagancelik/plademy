import type { MarkdownHeading } from 'astro';

/**
 * Build a proxy-safe absolute URL for the public site.
 *
 * Under the Next.js reverse proxy, `Astro.url`/`request.url` reports the
 * upstream host (plademy.netlify.app) and always carries a trailing slash
 * on the path (e.g. the public `/solutions` is proxied to `/solutions/`).
 * Never build an absolute URL directly from `Astro.url.href` — always go
 * through this helper so canonical/og/hreflang URLs show the public host
 * and path, without the proxy's trailing slash.
 */
export function publicUrl(url: URL): string {
  const SITE = import.meta.env.PUBLIC_SITE_URL || 'https://plademy.com';
  const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  return `${SITE}${pathname}`;
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateTableOfContents(headings: MarkdownHeading[]) {
  return headings.map((heading) => ({
    id: heading.slug,
    text: heading.text,
    depth: heading.depth,
  }));
}

export function truncate(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

