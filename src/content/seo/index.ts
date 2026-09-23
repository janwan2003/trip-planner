import type { Locale } from '../../i18n/config';

import de from './de';
import es from './es';
import fr from './fr';
import ja from './ja';
import ko from './ko';
import nl from './nl';
import pl from './pl';
import type { LocaleSeo } from './types';

/**
 * Every non-English language's search-facing content, in URL order.
 *
 * Imported by the build (routes, heads, sitemap, hreflang) and by the lazy chunk that
 * renders the localised pages - never by the entry bundle, so seven landing pages of copy
 * are not downloaded by someone who only ever opens a trip link.
 *
 * Relative imports on purpose: `vite.config.ts` loads this through `siteRoutes.ts` in
 * Node, where the `@/` alias does not exist.
 */
export const LOCALE_SEO: LocaleSeo[] = [de, es, fr, ja, ko, nl, pl];

export const seoFor = (locale: string): LocaleSeo | undefined =>
  LOCALE_SEO.find((entry) => entry.locale === locale);

/** `/` for English, `/xx` for every other language. */
export const homePath = (locale: Locale): string => (locale === 'en' ? '/' : `/${locale}`);

export const landingPath = (seo: LocaleSeo): string => `/${seo.locale}/${seo.landing.slug}`;
