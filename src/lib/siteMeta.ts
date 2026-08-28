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
}

/**
 * Questions real people type, answered in the words they type them in. The FAQ page
 * renders these and the prerenderer turns the same array into `FAQPage` JSON-LD, so
 * the structured data cannot describe answers the page does not show — which is both
 * a Google requirement and the honest thing to do.
 */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Can I use When2meet for a trip that lasts several days?',
    answer:
      'You can, but it fights you. When2meet always asks for a time-of-day window as well as dates, so to use it for whole days you set it to run from midnight to midnight and end up reading a grid of time slots across every day of the trip. WeGoWhen only asks about days: each person taps the days they are free, and the result is a list of date ranges rather than a grid.',
  },
  {
    question: 'How do I find the dates a whole group is free?',
    answer:
      'Create a trip with an outer window — say, any time in September — and share the link. Everyone taps the days they are free. WeGoWhen then works out every run of consecutive days that a group could all make, and ranks those runs by how many people they include, then by how long they are. The top row is the answer: "6 of 6 free, Fri 12 to Mon 15".',
  },
  {
    question: 'Does everyone need an account?',
    answer:
      'No. Nobody needs an account, an email address or an app, including the person who creates the trip. Identity is a name someone types plus possession of the link, which is the whole invitation mechanic. That is also why the link should only go to people you want in the trip.',
  },
  {
    question: 'Is WeGoWhen free?',
    answer:
      'Yes, and there is no paid tier, no trial and no per-seat pricing. Nothing is gated and nothing expires.',
  },
  {
    question: 'Does it work on a phone?',
    answer:
      'Yes — that is the main case, since most people arrive from a link in a group chat. Tap a day to mark it, or hold and drag across several days to mark a stretch at once.',
  },
  {
    question: 'Can I plan a trip that is months away?',
    answer:
      'Yes. The outer window is whatever you set when you create the trip, so a trip next spring works exactly like a trip next weekend. There is no limit on how far ahead the window can start, and a participant may mark up to 1000 days.',
  },
  {
    question: 'How many people can join one trip?',
    answer:
      'Up to 200 per trip. The ranking walks date ranges carrying a bitmask of who is free, so it stays fast at that size rather than slowing down as the group grows.',
  },
  {
    question: 'How is this different from a poll like Doodle?',
    answer:
      'A poll collects votes on options and shows you the tally. WeGoWhen collects days and computes the answer: the consecutive ranges that work, ranked by how many people can make the whole stretch. It also has no plan limits — Doodle’s free tier allows one group poll and removing its ads means paying per seat.',
  },
  {
    question: 'What happens to the trip data?',
    answer:
      'Trips are stored in Cloudflare D1 and reachable by anyone holding the link. No email addresses are collected because none are asked for. Participants can rename themselves or withdraw from a trip.',
  },
];

export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'WeGoWhen — Find the dates everyone is free for a group trip',
    description:
      'Share one link, everyone taps the days they are free, and WeGoWhen ranks the date ranges that fit the most people. No account, no sign-up.',
    priority: '1.0',
  },
  {
    path: '/when2meet-alternative',
    title: 'A When2meet alternative for whole days, not hours',
    description:
      'When2meet is built around a time-of-day grid. WeGoWhen is built around days: everyone marks the days they are free and it returns the ranked date ranges that work.',
    priority: '0.9',
  },
  {
    path: '/doodle-alternative',
    title: 'A Doodle alternative for group trip dates',
    description:
      'Doodle polls options and shows a tally. WeGoWhen computes the answer — the consecutive date ranges the most people can make — free, with no plan limits and no accounts.',
    priority: '0.9',
  },
  {
    path: '/faq',
    title: 'WeGoWhen FAQ — group trip dates, answered',
    description:
      'How to find dates a whole group is free, whether anyone needs an account, how many people a trip can hold, and how WeGoWhen differs from a meeting poll.',
    priority: '0.7',
    faq: true,
  },
  {
    path: '/about',
    title: 'About WeGoWhen',
    description:
      'What WeGoWhen is for, how a trip works from creating it to picking the dates, and what it is built on.',
    priority: '0.5',
  },
  {
    path: '/contact',
    title: 'Contact WeGoWhen',
    description:
      'How to reach the person who builds WeGoWhen, with feedback, a bug report, or a question about a trip.',
    priority: '0.3',
  },
  {
    path: '/terms',
    title: 'Terms of Service | WeGoWhen',
    description:
      'The terms that apply to using WeGoWhen: what the service does, what it does not promise, and how trip data is handled.',
    priority: '0.2',
  },
  {
    path: '/privacy',
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
 * Rewrites the built `index.html` head for one route.
 *
 * Every substitution is asserted to have matched. A silent no-op here would ship a
 * set of pages that all claim to be the home page, which is exactly the failure that
 * is invisible until a search engine reports duplicate titles weeks later.
 */
export const renderRouteHtml = (baseHtml: string, route: RouteMeta): string => {
  const canonical = canonicalFor(route.path);
  const substitutions: [RegExp, string][] = [
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

  return html;
};

/** A sitemap covering exactly the routes above, so the two cannot disagree. */
export const renderSitemap = (): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated at build time from src/lib/siteMeta.ts. Do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ROUTES.map((route) =>
      [
        '  <url>',
        `    <loc>${canonicalFor(route.path)}</loc>`,
        '    <changefreq>monthly</changefreq>',
        `    <priority>${route.priority}</priority>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n');
