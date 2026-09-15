import en from '../i18n/en.json';
import fi from '../i18n/fi.json';
import sv from '../i18n/sv.json';

export type Language = 'en' | 'fi' | 'sv';

const translations = {
  en,
  fi,
  sv,
} as const;

export function getTranslations(lang: Language) {
  return translations[lang] || translations.en;
}

export function t(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: any = translations[lang] || translations.en;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/fi/')) return 'fi';
  if (pathname.startsWith('/sv/')) return 'sv';
  return 'en';
}

export function getLanguageFromHeader(acceptLanguage: string): Language {
  // Simple detection from Accept-Language header
  if (acceptLanguage.includes('fi')) return 'fi';
  if (acceptLanguage.includes('sv')) return 'sv';
  return 'en';
}

export function getLanguageFromCookie(cookies: any, url?: URL): Language {
  // First check URL path for language
  if (url) {
    const pathInfo = getPathFromLocalizedPath(url.pathname);
    if (pathInfo) {
      return pathInfo.lang;
    }
  }
  
  // Then check cookie
  const langCookie = cookies.get('lang')?.value;
  if (langCookie === 'fi' || langCookie === 'sv' || langCookie === 'en') {
    return langCookie as Language;
  }
  return 'en';
}

// URL slug mapping for different languages.
// Only map to localized paths that actually exist as routes (avoid 404s).
// Other static pages share the English URL; language is applied via cookie.
const pathMapping: Record<string, Record<Language, string>> = {
  '/': { en: '/', fi: '/', sv: '/' },
  '/programs': { en: '/programs', fi: '/ohjelmat', sv: '/programs' },
  '/resources': { en: '/resources', fi: '/resurssit', sv: '/resources' },
  '/integrations': { en: '/integrations', fi: '/integrations', sv: '/integrations' },
  '/solutions': { en: '/solutions', fi: '/solutions', sv: '/solutions' },
  '/start': { en: '/start', fi: '/start', sv: '/start' },
  '/contact': { en: '/contact', fi: '/contact', sv: '/contact' },
  '/privacy': { en: '/privacy', fi: '/privacy', sv: '/privacy' },
  '/cookies': { en: '/cookies', fi: '/cookies', sv: '/cookies' },
  '/about': { en: '/about', fi: '/about', sv: '/about' },
  '/search': { en: '/search', fi: '/search', sv: '/search' },
  '/erg-center': { en: '/erg-center', fi: '/erg-center', sv: '/erg-center' },
};

// Reverse mapping: from localized path to English path
const reversePathMapping: Record<string, string> = {};
Object.entries(pathMapping).forEach(([enPath, langs]) => {
  Object.entries(langs).forEach(([lang, localizedPath]) => {
    reversePathMapping[localizedPath] = enPath;
  });
});

export function getLocalizedPath(path: string, lang: Language): string {
  // Normalize path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Exact mapped routes only (e.g. /programs → /ohjelmat for FI).
  // Nested URLs (/programs/[slug], /resources/...) stay on English paths;
  // language content is selected via cookie — localized FI trees do not exist yet.
  if (pathMapping[normalizedPath]) {
    return pathMapping[normalizedPath][lang] || normalizedPath;
  }
  
  return normalizedPath;
}

export function getPathFromLocalizedPath(localizedPath: string): { path: string; lang: Language } | null {
  // Normalize path
  const normalizedPath = localizedPath.startsWith('/') ? localizedPath : `/${localizedPath}`;
  
  // Check reverse mapping
  for (const [localized, base] of Object.entries(reversePathMapping)) {
    if (normalizedPath === localized || normalizedPath.startsWith(localized + '/')) {
      // Determine language by checking which language has this path
      for (const [basePath, langs] of Object.entries(pathMapping)) {
        if (basePath === base) {
          for (const [lang, path] of Object.entries(langs)) {
            if (path === localized || normalizedPath.startsWith(path + '/')) {
              return { path: basePath, lang: lang as Language };
            }
          }
        }
      }
    }
  }
  
  // If no mapping found, try to detect from path
  if (normalizedPath.startsWith('/ohjelmat')) return { path: '/programs', lang: 'fi' };
  if (normalizedPath.startsWith('/resurssit')) return { path: '/resources', lang: 'fi' };

  return null;
}

/**
 * Hreflang targets must not advertise 404 URLs.
 * Finnish aliases exist for programs/resources indexes; otherwise use English path.
 */
export function getHreflangPath(path: string, lang: Language): string {
  const localized = getLocalizedPath(path, lang);
  if (lang === 'en') return getLocalizedPath(path, 'en');

  // Only advertise Finnish index aliases that exist as real routes
  if (lang === 'fi' && (localized === '/ohjelmat' || localized === '/resurssit' || localized === '/')) {
    return localized;
  }

  return getLocalizedPath(path, 'en');
}

