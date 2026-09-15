import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const baseUrl = 'https://plademy.com';

  // Only URLs that return HTTP 200 on production (no /en|/fi|/sv prefixes).
  // Language is cookie-based; Finnish index aliases that exist are listed separately.
  const staticPages = [
    '',
    '/about',
    '/solutions',
    '/integrations',
    '/start',
    '/privacy',
    '/cookies',
    '/contact',
    '/search',
    '/erg-center',
    '/programs',
    '/programs/all-categories/all-audiences',
    '/resources',
    '/ohjelmat',
    '/resurssit',
  ];

  try {
    const { data: resources } = await supabase
      .from('resources')
      .select('slug, language, published_at')
      .eq('is_published', true);

    const { data: programs } = await supabase
      .from('programs')
      .select('slug, language, published_at')
      .eq('is_published', true);

    const urls = new Set<string>();

    for (const page of staticPages) {
      urls.add(`${baseUrl}${page || '/'}`);
    }

    if (resources) {
      for (const resource of resources) {
        if (resource.slug) {
          urls.add(`${baseUrl}/${resource.slug}`);
        }
      }
    }

    if (programs) {
      for (const program of programs) {
        if (program.slug) {
          urls.add(`${baseUrl}/programs/${program.slug}`);
        }
      }
    }

    const sortedUrls = Array.from(urls).sort();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sortedUrls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === `${baseUrl}/` ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};
