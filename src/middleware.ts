import { defineMiddleware } from 'astro:middleware';
import { getPathFromLocalizedPath, getLocalizedPath, type Language } from './lib/i18n';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL!,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY!
);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;
  
  // CRITICAL: Check if /programs/[slug] is a program slug and ensure it goes to [slug].astro
  // This prevents Astro client-side routing from converting it to /programs?category=[slug]
  // NOTE: Astro routing should handle this, but we check here to be safe
  // The actual redirect happens in /programs/index.astro if needed
  
  // Check if there's a lang parameter in the URL
  const langParam = url.searchParams.get('lang');
  
  if (langParam === 'fi' || langParam === 'sv' || langParam === 'en') {
    // Set cookie
    cookies.set('lang', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false,
    });
    
    // Get localized path for the new language
    const pathInfo = getPathFromLocalizedPath(pathname);
    const basePath = pathInfo?.path || pathname;
    const localizedPath = getLocalizedPath(basePath, langParam as Language);
    
    // Remove lang parameter and redirect to localized path.
    // IMPORTANT: build a RELATIVE Location (path + search only). Under the
    // Next.js reverse proxy this request is served from plademy.netlify.app,
    // so an absolute Location built from `url` would send the browser (which
    // only ever sees plademy.com) to the upstream Netlify host directly.
    const newUrl = new URL(url);
    newUrl.pathname = localizedPath;
    newUrl.searchParams.delete('lang');
    const relativeLocation = `${newUrl.pathname}${newUrl.search}`;

    return new Response(null, {
      status: 302,
      headers: { Location: relativeLocation },
    });
  }

  // Detect language from path and set cookie if needed
  const pathInfo = getPathFromLocalizedPath(pathname);
  if (pathInfo) {
    const currentLang = cookies.get('lang')?.value || 'en';
    if (currentLang !== pathInfo.lang) {
      cookies.set('lang', pathInfo.lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
    }
  }

  const response = await next();

  // Rewrite any absolute Location header that points at this upstream host
  // (plademy.netlify.app) or at the request's own host to a relative one.
  // Astro.redirect('/some/path') can end up with an absolute Location built
  // from the request origin, which — behind the Next.js proxy — is the
  // Netlify host, not the public plademy.com host the browser is on.
  const location = response.headers.get('Location');
  if (location) {
    let locUrl: URL | null = null;
    try {
      locUrl = new URL(location, url);
    } catch {
      locUrl = null;
    }

    if (locUrl) {
      const siteOrigin = (() => {
        try {
          return new URL(import.meta.env.PUBLIC_SITE_URL || 'https://plademy.com').origin;
        } catch {
          return 'https://plademy.com';
        }
      })();

      const isUpstreamOrSameHost = locUrl.host.endsWith('netlify.app') || locUrl.host === url.host;

      if (locUrl.origin !== siteOrigin && isUpstreamOrSameHost) {
        const relative = `${locUrl.pathname}${locUrl.search}${locUrl.hash}`;
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Location', relative);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    }
  }

  return response;
});

