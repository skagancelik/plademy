import { defineMiddleware } from 'astro:middleware';
import { getPathFromLocalizedPath, getLocalizedPath, type Language } from './lib/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;
  
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
    
    // Remove lang parameter and redirect to localized path
    const newUrl = new URL(url);
    newUrl.pathname = localizedPath;
    newUrl.searchParams.delete('lang');
    
    return Response.redirect(newUrl.toString(), 302);
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
  
  return next();
});

