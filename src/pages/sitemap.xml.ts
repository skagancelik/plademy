import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://plademy.com';
  const languages = ['en', 'fi', 'sv'] as const;

  // Static pages
  const staticPages = [
    '',
    '/integrations',
    '/start',
    '/privacy',
    '/contact',
    '/search',
  ];

  try {
    // Fetch all published resources
    const { data: resources } = await supabase
      .from('resources')
      .select('slug, language, published_at')
      .eq('is_published', true);

    // Fetch all published programs
    const { data: programs } = await supabase
      .from('programs')
      .select('slug, language, published_at')
      .eq('is_published', true);

    const urls: string[] = [];

    // Add static pages for each language
    for (const lang of languages) {
      for (const page of staticPages) {
        urls.push(`${baseUrl}/${lang}${page}`);
      }
    }

    // Add resource pages
    if (resources) {
      for (const resource of resources) {
        urls.push(`${baseUrl}/${resource.language}/resources/${resource.slug}`);
      }
    }

    // Add program pages
    if (programs) {
      for (const program of programs) {
        urls.push(`${baseUrl}/${program.language}/programs/${program.slug}`);
      }
    }

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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

