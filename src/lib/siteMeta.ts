/**
 * Every indexable URL on the site, and the head each one needs.
 *
 * This module is the single source for three consumers that would otherwise drift:
 *
 *   1. `usePageMeta` updates the title and description during client-side
 *      navigation, so the browser tab and any share taken from it stay right.
 *   2. The `prerenderRoutes` plugin in `vite.config.ts` writes a real static
 *      `index.html` per route at build time, with the title, description, canonical
 *      and Open Graph tags already in it. That is the part search engines and link
 *      unfurlers actually read: neither waits for React.
 *   3. The same plugin generates `sitemap.xml` from this list, so a new page cannot
 *      be added to the router and forgotten in the sitemap.
 *
 * Deliberately free of React and of anything DOM-shaped, because the Vite config
 * imports it while building.
 */

export const SITE_ORIGIN = 'https://wegowhen.com';

export interface RouteMeta {
  /** Path with a leading slash. `/` is the home page. */
  path: string;
  /** `<title>`. Kept under 65 characters, past which Google truncates. */
  title: string;
  /** Meta description, 70-160 characters. */
  description: string;
  /** Sitemap priority, relative to the other pages here. */
  priority: string;
  /** Whether the page should carry the FAQPage structured data. */
  faq?: boolean;
  /** Set on pages that must stay out of search results. */
  noindex?: boolean;
  /**
   * The day this page's content last changed, `YYYY-MM-DD`. Feeds `<lastmod>` in the
   * sitemap and `dateModified` in the JSON-LD.
   *
   * A literal, checked in, and bumped by hand in the same commit that changes the page.
   * It was computed at build time from `git log` for exactly one deploy, which is how
   * the reason it cannot be became measurable: Cloudflare Pages builds from a shallow
   * clone, so `git log -1 -- <file>` answers with the only commit it has - the tip - for
   * every path. The sitemap went out with all eight URLs stamped the build day, which is
   * the unreliable `lastmod` the field is supposed to avoid, and the "git is missing"
   * fallback never fired because git was present and answering.
   *
   * `src/lib/siteMeta.test.ts` fails if this date is older than the last commit touching
   * `contentSources`, so a page whose words changed cannot keep an old date for long.
   */
  contentUpdated?: string;
  /**
   * The files whose content this page renders. Not read at build time - only by the test
   * that audits `contentUpdated` against git. Listed per route so one page's edit cannot
   * be read as a change to the other seven.
   */
  contentSources?: string[];
  /**
   * Overrides the file name derived from `path`. Needed exactly once, and for a
   * reason that costs an afternoon to rediscover: see `outputFileFor`.
   */
  file?: string;
}

// Imported for the FAQPage JSON-LD below, and re-exported so the FAQ page and its
// structured data still resolve to one array.
import { FAQ } from './faq';
export { FAQ };


export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    contentUpdated: '2026-08-31',
    contentSources: [
      'src/pages/Index.tsx',
      'src/components/CreateTripForm.tsx',
      'src/components/Tutorial.tsx',
      'src/components/RecentTrips.tsx',
    ],
    title: 'WeGoWhen — Find the dates everyone is free for a group trip',
    description:
      'Share one link, everyone taps the days they are free, and WeGoWhen ranks the date ranges that fit the most people. No account, no sign-up.',
    priority: '1.0',
  },
  {
    path: '/when2meet-alternative',
    contentUpdated: '2026-08-31',
    contentSources: [
      'src/pages/When2meetAlternative.tsx',
      'src/components/MarketingPage.tsx',
      'src/components/QuestionAnswer.tsx',
    ],
    title: 'A When2meet alternative for whole days, not hours',
    description:
      'When2meet is built around a time-of-day grid. WeGoWhen is built around days: mark the days you are free, get the ranked date ranges that work. Free, and no account.',
    priority: '0.9',
  },
  {
    path: '/doodle-alternative',
    contentUpdated: '2026-08-31',
    contentSources: [
      'src/pages/DoodleAlternative.tsx',
      'src/components/MarketingPage.tsx',
      'src/components/QuestionAnswer.tsx',
    ],
    title: 'A Doodle alternative for group trip dates',
    description:
      'Doodle polls options and shows a tally. WeGoWhen computes the answer — the consecutive date ranges the most people can make — free, with no plan limits and no accounts.',
    priority: '0.9',
  },
  {
    path: '/faq',
    contentUpdated: '2026-09-13',
    contentSources: [
      'src/pages/Faq.tsx',
      'src/components/MarketingPage.tsx',
      'src/lib/faq.ts',
    ],
    title: 'WeGoWhen FAQ — group trip dates, answered',
    description:
      'How to find dates a whole group is free, whether anyone needs an account, how many people a trip can hold, and how WeGoWhen differs from a meeting poll.',
    priority: '0.7',
    faq: true,
  },
  {
    path: '/about',
    contentUpdated: '2026-08-31',
    contentSources: ['src/pages/About.tsx'],
    title: 'About WeGoWhen',
    description:
      'What WeGoWhen is for, how a trip works from creating it to picking the dates, and what it is built on.',
    priority: '0.5',
  },
  {
    path: '/contact',
    contentUpdated: '2026-08-31',
    contentSources: ['src/pages/Contact.tsx'],
    title: 'Contact WeGoWhen',
    description:
      'How to reach the person who builds WeGoWhen, with feedback, a bug report, or a question about a trip.',
    priority: '0.3',
  },
  {
    path: '/terms',
    contentUpdated: '2026-08-28',
    contentSources: ['src/pages/TermsOfService.tsx'],
    title: 'Terms of Service | WeGoWhen',
    description:
      'The terms that apply to using WeGoWhen: what the service does, what it does not promise, and how trip data is handled.',
    priority: '0.2',
  },
  {
    path: '/privacy',
    contentUpdated: '2026-09-13',
    contentSources: ['src/pages/PrivacyPolicy.tsx'],
    title: 'Privacy Policy | WeGoWhen',
    description:
      'What WeGoWhen stores, what it does not ask for, and who can see a trip. No accounts, no email addresses, no advertising.',
    priority: '0.2',
  },
];

/**
 * Pages that exist but must never be indexed. A trip is reachable by anyone holding
 * its link, which makes it private by convention rather than by access control; a
 * search result for one would break that convention. Kept out of `ROUTES` so it
 * reaches neither the sitemap nor the prerenderer, and `robots.txt` disallows the path
 * as well — belt and braces, because the two mechanisms fail differently.
 */
export const PRIVATE_ROUTES: RouteMeta[] = [
  {
    path: '/404',
    title: 'Page not found | WeGoWhen',
    description: 'That page does not exist. The trip you were looking for may have a different link.',
    priority: '0.0',
    noindex: true,
  },
  {
    path: '/trip',
    title: 'Your trip | WeGoWhen',
    description: 'Mark the days you are free, and see which date ranges work for the group.',
    priority: '0.0',
    noindex: true,
    // Not `trip.html`: that would serve a blank shell at `/trip`, which is not a route
    // this app has, where a 404 is the honest answer. The `_redirects` rule that points
    // at this file spells the target `/trip-shell`, without the extension - see the
    // comment there for what the `.html` spelling does to an invitation link.
    file: 'trip-shell.html',
  },
];

export const routeFor = (path: string): RouteMeta | undefined =>
  [...ROUTES, ...PRIVATE_ROUTES].find((route) => route.path === path);

/** The absolute canonical URL for a path. `/` keeps its trailing slash; nothing else has one. */
export const canonicalFor = (path: string): string =>
  path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;

export const faqJsonLd = (): string =>
  JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
    null,
    2,
  );

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Today, in UTC, as `YYYY-MM-DD`.
 *
 * `toISOString` is the right tool here and the wrong one two lines away: it is correct
 * for an actual instant, which this is, and wrong for a local calendar day, which is
 * the mistake CLAUDE.md documents. Nothing here reads a local date.
 */
export const buildDate = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

/**
 * Rewrites the built `index.html` head for one route, and optionally drops that
 * route's rendered body into `<div id="root">`.
 *
 * Every substitution is asserted to have matched. A silent no-op here would ship a
 * set of pages that all claim to be the home page, which is exactly the failure that
 * is invisible until a search engine reports duplicate titles weeks later.
 *
 * `body` comes from `src/entry-prerender.tsx` via the build plugin. Passing none is
 * how the two private shells are emitted: `/trip/:id` and the 404 page must answer
 * with an empty root, because whatever body were baked in would be the wrong page's
 * content on screen until React replaced it.
 *
 * `date` stamps `dateModified` in the JSON-LD with the day the bundle was built, rather
 * than a literal in `index.html` that would be true on the day someone typed it and
 * quietly false afterwards. Answer engines weight recency, and a wrong date is worse
 * than none.
 */
export const renderRouteHtml = (
  baseHtml: string,
  route: RouteMeta,
  body?: string,
  date: string = buildDate(),
): string => {
  const canonical = canonicalFor(route.path);
  const substitutions: [RegExp, string][] = [
    [/"dateModified": "[^"]*"/, `"dateModified": "${date}"`],
    [/<title>[^<]*<\/title>/, `<title>${escapeAttribute(route.title)}</title>`],
    [
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${escapeAttribute(route.description)}" />`,
    ],
    [
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${escapeAttribute(route.title)}" />`,
    ],
    [
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${escapeAttribute(route.description)}" />`,
    ],
    [
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${canonical}" />`,
    ],
    [
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${escapeAttribute(route.title)}" />`,
    ],
    [
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${escapeAttribute(route.description)}" />`,
    ],
    [
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonical}" />`,
    ],
  ];

  let html = baseHtml;
  for (const [pattern, replacement] of substitutions) {
    if (!pattern.test(html)) {
      throw new Error(
        `prerender: nothing in index.html matched ${pattern} while building ${route.path}. ` +
          'The head was edited without updating renderRouteHtml.',
      );
    }
    html = html.replace(pattern, replacement);
  }

  if (route.faq) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">\n${faqJsonLd()}\n    </script>\n  </head>`,
    );
  }

  // `usePageMeta` also sets this once React runs, but the shells exist precisely for
  // the readers that never run React, so the tag has to be in the served bytes.
  if (route.noindex) {
    html = html.replace(
      '</head>',
      '  <meta name="robots" content="noindex, nofollow" />\n  </head>',
    );
  }

  if (body !== undefined) {
    const root = '<div id="root"></div>';
    if (!html.includes(root)) {
      throw new Error(
        `prerender: no empty ${root} in index.html while building ${route.path}. ` +
          'The body was edited without updating renderRouteHtml.',
      );
    }
    html = html.replace(root, `<div id="root">${body}</div>`);
  }

  return html;
};

/**
 * The file name a route is written to inside `dist`. `/` is the SPA entry point that
 * Vite already emitted; everything else is a bare `.html` at the extensionless path,
 * because Cloudflare Pages answers `/faq` with a 308 to `/faq/` when the file is
 * `faq/index.html` and with a 200 when it is `faq.html`.
 *
 * The same extension stripping is why anything pointing at one of these files - a
 * `_redirects` target above all - has to name it without the `.html`, or Pages answers
 * with a 308 to the extensionless form rather than with the file.
 */
export const outputFileFor = (route: RouteMeta): string =>
  route.file ?? (route.path === '/' ? 'index.html' : `${route.path.replace(/^\//, '')}.html`);

/**
 * A sitemap covering exactly the routes above, so the two cannot disagree.
 *
 * `lastmodFor` defaults to each route's declared `contentUpdated` and returning
 * `undefined` omits the element rather than guessing. `lastmod` is the only one of
 * these three fields Google reads at all - `changefreq` and `priority` it ignores
 * outright - and it reads it only while it holds up against what the page does.
 */
export const renderSitemap = (
  lastmodFor: (route: RouteMeta) => string | undefined = (route) => route.contentUpdated,
): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated at build time from src/lib/siteMeta.ts. Do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ROUTES.map((route) => {
      const lastmod = lastmodFor(route);
      return [
        '  <url>',
        `    <loc>${canonicalFor(route.path)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        '    <changefreq>monthly</changefreq>',
        `    <priority>${route.priority}</priority>`,
        '  </url>',
      ].join('\n');
    }),
    '</urlset>',
    '',
  ].join('\n');

/**
 * The rendered body of one route, as the prerenderer produced it.
 */
export interface RenderedPage {
  route: RouteMeta;
  /** The HTML that went inside `<div id="root">`. */
  body: string;
}

const ENTITIES: [RegExp, string][] = [
  [/&nbsp;/g, ' '],
  [/&amp;/g, '&'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#39;|&apos;/g, "'"],
  [/&mdash;/g, '—'],
  [/&ndash;/g, '–'],
];

/**
 * Turns one rendered page into the plain text an answer engine would have to reconstruct
 * for itself otherwise.
 *
 * React's static render leaves `<!--$-->` suspense markers and `<!--/$-->` around every
 * lazy boundary; left in, they land in the middle of sentences. Block-level tags become
 * newlines so that a table row does not run into the next one, which is exactly the
 * legibility the comparison tables exist for.
 */
export const htmlToText = (html: string): string => {
  let text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/(p|div|section|article|li|tr|h[1-6]|blockquote|figcaption)>/gi, '\n')
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ' \u2014 ')
    // A nav is a run of inline links with no whitespace between them, which reads as
    // one invented word: "HomeFAQWhen2meet alternative". The punctuation tidy below
    // takes back the space this costs mid-sentence.
    .replace(/<\/a>/gi, ' ')
    .replace(/<[^>]+>/g, '');

  for (const [pattern, replacement] of ENTITIES) {
    text = text.replace(pattern, replacement);
  }

  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t\u00a0]+/g, ' ')
        .replace(/ ([,.;:!?])/g, '$1')
        // A table row whose first cell is the empty corner of a header, and the
        // trailing separator the last cell leaves behind.
        .replace(/^ *\u2014 /, '')
        .replace(/ +\u2014 *$/, '')
        .trim(),
    )
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
    .trim();
};

/**
 * `llms-full.txt`: every indexable page's prose in one file, generated from the same
 * bodies that were written into the static HTML.
 *
 * Generated rather than written. A hand-maintained copy of the site's own copy is a
 * second source of truth that goes stale the first time a page is edited, and a stale
 * one is worse than none because it is the version an answer engine quotes.
 *
 * `llms.txt` stays what it is - a short index with the facts and the links. This is the
 * full text for a reader that would otherwise fetch all eight pages.
 */
export const renderLlmsFull = (pages: RenderedPage[], date: string = buildDate()): string =>
  [
    '# WeGoWhen — full text of every public page',
    '',
    `> Generated at build time on ${date} from the same rendered pages the site serves.`,
    '> The short index, with the product facts, is at https://wegowhen.com/llms.txt',
    '',
    ...pages.map((page) =>
      [
        `## ${page.route.title}`,
        '',
        `URL: ${canonicalFor(page.route.path)}`,
        '',
        htmlToText(page.body),
        '',
      ].join('\n'),
    ),
  ].join('\n');
