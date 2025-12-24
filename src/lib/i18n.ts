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

// URL slug mapping for different languages
const pathMapping: Record<string, Record<Language, string>> = {
  '/': { en: '/', fi: '/', sv: '/' },
  '/programs': { en: '/programs', fi: '/ohjelmat', sv: '/program' },
  '/resources': { en: '/resources', fi: '/resurssit', sv: '/resurser' },
  '/integrations': { en: '/integrations', fi: '/integraatiot', sv: '/integrationer' },
  '/start': { en: '/start', fi: '/aloita', sv: '/starta' },
  '/contact': { en: '/contact', fi: '/yhteystiedot', sv: '/kontakt' },
  '/privacy': { en: '/privacy', fi: '/tietosuoja', sv: '/integritet' },
  '/search': { en: '/search', fi: '/haku', sv: '/sok' },
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
  
  // Check if path has a mapping
  if (pathMapping[normalizedPath]) {
    return pathMapping[normalizedPath][lang] || normalizedPath;
  }
  
  // Handle dynamic paths like /programs/[category] or /resources/[slug]
  // Try to match the base path
  for (const [basePath, langs] of Object.entries(pathMapping)) {
    if (normalizedPath.startsWith(basePath + '/')) {
      const suffix = normalizedPath.slice(basePath.length);
      const localizedBase = langs[lang] || basePath;
      return `${localizedBase}${suffix}`;
    }
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
  if (normalizedPath.startsWith('/program') && !normalizedPath.startsWith('/programs')) return { path: '/programs', lang: 'sv' };
  if (normalizedPath.startsWith('/resurser')) return { path: '/resources', lang: 'sv' };
  if (normalizedPath.startsWith('/integraatiot')) return { path: '/integrations', lang: 'fi' };
  if (normalizedPath.startsWith('/integrationer')) return { path: '/integrations', lang: 'sv' };
  if (normalizedPath.startsWith('/aloita')) return { path: '/start', lang: 'fi' };
  if (normalizedPath.startsWith('/starta')) return { path: '/start', lang: 'sv' };
  if (normalizedPath.startsWith('/yhteystiedot')) return { path: '/contact', lang: 'fi' };
  if (normalizedPath.startsWith('/kontakt')) return { path: '/contact', lang: 'sv' };
  if (normalizedPath.startsWith('/tietosuoja')) return { path: '/privacy', lang: 'fi' };
  if (normalizedPath.startsWith('/integritet')) return { path: '/privacy', lang: 'sv' };
  if (normalizedPath.startsWith('/haku')) return { path: '/search', lang: 'fi' };
  if (normalizedPath.startsWith('/sok')) return { path: '/search', lang: 'sv' };
  
  return null;
}

