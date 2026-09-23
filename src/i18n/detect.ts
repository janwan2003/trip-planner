import { DEFAULT_LOCALE, isLocale, type Locale } from './config';

/** Versioned like `wegowhen.recentTrips.v1`, so a future shape change can ignore it. */
export const LOCALE_STORAGE_KEY = 'wegowhen.locale.v1';

/**
 * The browser's preferred language tags, most preferred first. `navigator.languages` is
 * the user's ordered list; `navigator.language` alone is only the first entry.
 */
const preferredTags = (): readonly string[] => {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
};

/**
 * The language a path names, if it starts with one: `/ja/nittei-chousei` -> `ja`.
 * English has no prefix, so `/`, `/faq` and `/trip/abc` name none.
 */
export const localeFromPath = (pathname: string): Locale | undefined => {
  const first = pathname.split('/')[1];
  return first !== DEFAULT_LOCALE && isLocale(first) ? first : undefined;
};

/** `de-AT` -> `de`. Region variants share their language's strings. */
const baseLanguage = (tag: string) => tag.toLowerCase().split('-')[0];

/**
 * Which language to show: an explicit choice made in the switcher, else the first
 * browser language we support, else English.
 *
 * The stored choice wins over the browser because it is the only signal a person gave
 * on purpose - a Dutch speaker on a borrowed English laptop picks Nederlands once.
 *
 * Every storage call is guarded, as in `recentTrips.ts`: Safari private mode throws on
 * `setItem`, and a browser blocking site data throws on the `localStorage` getter
 * itself. Losing the preference is fine; breaking the page over it is not.
 */
export const detectLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage unavailable: fall through to the browser's languages.
  }

  for (const tag of preferredTags()) {
    const base = baseLanguage(tag);
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
};

export const persistLocale = (locale: Locale) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // See detectLocale.
  }
};

/**
 * The tag to format dates with. The UI language says which strings to show; the
 * browser's own tag, when it is the same language, says how that person writes a date -
 * `en-GB` gets "1 Sept", `en-US` "Sep 1", `es-PY` and `es-ES` their own conventions -
 * without us having to ship a separate English or Spanish for each region.
 */
export const formattingTag = (locale: Locale): string =>
  preferredTags().find((tag) => baseLanguage(tag) === locale) ?? locale;
