import en from './locales/en';
import type { LocaleBundle } from './types';

/**
 * The languages the app ships, and the only place a new one is registered.
 *
 * Chosen from who actually uses the product, not from a market list: the trips
 * strangers created after 2026-09-02 are named in Dutch, German and Spanish (among
 * others), and NL, DE and PY are all in the top ten countries by traffic. See the
 * "Languages" section of CLAUDE.md for how to add one.
 *
 * `label` is the language's own name for itself, shown in the switcher, so someone who
 * cannot read the current language can still find theirs.
 *
 * English is loaded eagerly - it is the fallback for any missing string and what the
 * build prerenders - and every other language is a separate chunk fetched on demand.
 */
export const LOCALES = {
  en: { label: 'English', load: async () => ({ default: en }) },
  de: { label: 'Deutsch', load: () => import('./locales/de') },
  es: { label: 'Español', load: () => import('./locales/es') },
  nl: { label: 'Nederlands', load: () => import('./locales/nl') },
} as const satisfies Record<string, { label: string; load: () => Promise<{ default: LocaleBundle }> }>;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(LOCALES, value);
