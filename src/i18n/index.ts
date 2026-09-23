import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, LOCALES, SUPPORTED_LOCALES, isLocale, type Locale } from './config';
import { persistLocale } from './detect';
import en from './locales/en';
import type { LocaleBundle } from './types';

/**
 * The app's single i18next instance. Importing this module initialises it, which is why
 * `main.tsx`, `entry-prerender.tsx` and the test setup all import it first.
 *
 * Initialised synchronously with English in memory, so the very first render - the
 * build's prerender included - never waits on a network fetch or renders raw keys.
 */
const bundles = new Map<Locale, LocaleBundle>([[DEFAULT_LOCALE, en]]);

void i18n.use(initReactI18next).init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  resources: { [DEFAULT_LOCALE]: { translation: en.messages } },
  initAsync: false,
  // React already escapes everything it renders; escaping here too would show
  // "O&#39;Brien" as a participant's name.
  interpolation: { escapeValue: false },
});

/** Fetches a language's chunk once and registers it with i18next. */
const loadLocale = async (locale: Locale): Promise<LocaleBundle> => {
  const cached = bundles.get(locale);
  if (cached) return cached;

  const { default: bundle } = await LOCALES[locale].load();
  i18n.addResourceBundle(locale, 'translation', bundle.messages);
  bundles.set(locale, bundle);
  return bundle;
};

/**
 * Switches the whole UI to `locale`, loading it first so no screen renders half in
 * the old language. Keeps `<html lang>` in step, which screen readers use to pick a
 * voice and browsers use to decide whether to offer translation.
 */
export const setLocale = async (locale: Locale, { persist = false } = {}) => {
  await loadLocale(locale);
  await i18n.changeLanguage(locale);
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  if (persist) persistLocale(locale);
};

/** The language currently on screen. */
export const currentLocale = (): Locale =>
  isLocale(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LOCALE;

/** The loaded bundle for a locale; English if it has not been loaded yet. */
export const localeBundle = (locale: Locale): LocaleBundle => bundles.get(locale) ?? en;

export { i18n };
export { LOCALES, SUPPORTED_LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from './config';
export { detectLocale } from './detect';
