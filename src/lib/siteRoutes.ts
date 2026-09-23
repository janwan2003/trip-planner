import { LOCALE_SEO, homePath, landingPath } from '../content/seo/index';
import { Alternate, ROUTES, RouteMeta, canonicalFor } from './siteMeta';

/**
 * Every indexable URL including the localised ones - the build's view of the site.
 *
 * Split from `siteMeta.ts` because that module reaches the browser (through
 * `usePageMeta`), and pulling seven languages' landing copy into the entry bundle would
 * make everyone pay for pages almost nobody opens. The build, the tests and the lazy
 * localised-page chunk import this; the app shell does not.
 *
 * Per language: its home page at `/xx` - the same app, rendered in that language with a
 * head written for that market - and one landing page aimed at that market's own
 * searches. See `src/content/seo/types.ts`.
 */

/** Files every localised home page renders, besides its own language's strings. */
const HOME_SOURCES = ROUTES.find((route) => route.path === '/')!.contentSources ?? [];

export const LOCALIZED_ROUTES: RouteMeta[] = LOCALE_SEO.flatMap((seo) => [
  {
    path: homePath(seo.locale),
    locale: seo.locale,
    title: seo.home.title,
    description: seo.home.description,
    priority: '0.9',
    contentUpdated: seo.contentUpdated,
    contentSources: [
      `src/content/seo/${seo.locale}.ts`,
      `src/i18n/locales/${seo.locale}.ts`,
      ...HOME_SOURCES,
    ],
  },
  {
    path: landingPath(seo),
    locale: seo.locale,
    title: seo.landing.title,
    description: seo.landing.description,
    priority: '0.8',
    contentUpdated: seo.contentUpdated,
    contentSources: [`src/content/seo/${seo.locale}.ts`, 'src/pages/LocalizedLanding.tsx'],
  },
]);

export const ALL_ROUTES: RouteMeta[] = [...ROUTES, ...LOCALIZED_ROUTES];

/**
 * The home pages are one page in eight languages, so each names all the others, and
 * `/` doubles as `x-default` - the version for a language the site does not speak.
 *
 * Only the home pages form a cluster. Each landing page is written for one market's
 * searches rather than translated from another, so declaring them equivalent would be
 * a claim Google is told to distrust.
 */
export const HOME_ALTERNATES: Alternate[] = [
  { hreflang: 'en', href: canonicalFor('/') },
  ...LOCALE_SEO.map((seo) => ({ hreflang: seo.locale, href: canonicalFor(homePath(seo.locale)) })),
  { hreflang: 'x-default', href: canonicalFor('/') },
];

const HOME_PATHS = new Set(['/', ...LOCALE_SEO.map((seo) => homePath(seo.locale))]);

export const alternatesFor = (route: RouteMeta): Alternate[] =>
  HOME_PATHS.has(route.path) ? HOME_ALTERNATES : [];
