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

export function getLocalizedPath(path: string, lang: Language): string {
  if (path.startsWith('/')) {
    return `/${lang}${path}`;
  }
  return `/${lang}/${path}`;
}

export function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/fi/')) return 'fi';
  if (pathname.startsWith('/sv/')) return 'sv';
  return 'en';
}

