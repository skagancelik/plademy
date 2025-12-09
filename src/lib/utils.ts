import type { MarkdownHeading } from 'astro';

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

