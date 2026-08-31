import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  FAQ,
  buildDate,
  htmlToText,
  renderLlmsFull,
  PRIVATE_ROUTES,
  ROUTES,
  canonicalFor,
  faqJsonLd,
  outputFileFor,
  renderRouteHtml,
  renderSitemap,
  routeFor,
} from './siteMeta';

const indexHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');

describe('route metadata', () => {
  it('has a unique path and a unique title per page', () => {
    // Duplicate titles are the classic symptom of a broken prerender, and Search
    // Console reports them weeks after the fact.
    expect(new Set(ROUTES.map((r) => r.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.title)).size).toBe(ROUTES.length);
  });

  it.each(ROUTES)('$path has a head search engines will render whole', (route) => {
    expect(route.path.startsWith('/')).toBe(true);
    expect(route.title.length).toBeGreaterThan(10);
    expect(route.title.length).toBeLessThanOrEqual(65);
    expect(route.description.length).toBeGreaterThanOrEqual(70);
    expect(route.description.length).toBeLessThanOrEqual(170);
  });

  it('agrees with the title and description in index.html for the home page', () => {
    // index.html is the source the prerenderer rewrites. If the two disagree, the
    // repo says one thing and production says another.
    const home = routeFor('/')!;
    expect(indexHtml).toContain(`<title>${home.title}</title>`);
    expect(indexHtml).toContain(`<meta name="description" content="${home.description}" />`);
  });

  it('builds canonical URLs with no double slash and no stray trailing slash', () => {
    expect(canonicalFor('/')).toBe('https://wegowhen.com/');
    expect(canonicalFor('/faq')).toBe('https://wegowhen.com/faq');
  });

  it('keeps trip pages out of the sitemap and marks them noindex', () => {
    expect(ROUTES.map((r) => r.path)).not.toContain('/trip');
    expect(PRIVATE_ROUTES.every((r) => r.noindex)).toBe(true);
    expect(routeFor('/trip')?.noindex).toBe(true);
  });

  it('returns nothing for a path it does not know', () => {
    expect(routeFor('/nope')).toBeUndefined();
  });
});

describe('renderRouteHtml', () => {
  it.each(ROUTES)('rewrites the whole head for $path', (route) => {
    const html = renderRouteHtml(indexHtml, route);
    const canonical = canonicalFor(route.path);

    expect(html).toContain(`<title>${route.title}</title>`);
    expect(html).toContain(`<meta name="description" content="${route.description}" />`);
    expect(html).toContain(`<meta property="og:title" content="${route.title}" />`);
    expect(html).toContain(`<meta property="og:url" content="${canonical}" />`);
    expect(html).toContain(`<meta name="twitter:title" content="${route.title}" />`);
    expect(html).toContain(`<link rel="canonical" href="${canonical}" />`);

    // The share card is the same on every page, and must survive the rewrite.
    expect(html).toContain('<meta property="og:image" content="https://wegowhen.com/og-image.png" />');
  });

  it('adds FAQPage structured data only to the page that shows the answers', () => {
    const faqRoute = ROUTES.find((r) => r.faq)!;
    expect(renderRouteHtml(indexHtml, faqRoute)).toContain('"@type": "FAQPage"');
    expect(renderRouteHtml(indexHtml, routeFor('/about')!)).not.toContain('FAQPage');
  });

  it.each(ROUTES)('puts the rendered body inside #root for $path', (route) => {
    // The regression this catches shipped for months: the head was per-route but every
    // page served an empty `<div id="root">`, so Bing, DuckDuckGo and every crawler
    // behind an AI answer saw a blank document on all eight URLs.
    const html = renderRouteHtml(indexHtml, route, '<main>rendered</main>');

    expect(html).toContain('<div id="root"><main>rendered</main></div>');
    expect(html).not.toContain('<div id="root"></div>');
  });

  it('leaves #root empty when no body is given', () => {
    // How the two shells are emitted. A body here would be the wrong page's content on
    // screen until React replaced it - the landing form shown to someone opening a
    // trip invitation.
    expect(renderRouteHtml(indexHtml, routeFor('/trip')!)).toContain('<div id="root"></div>');
  });

  it('writes robots noindex into the bytes of a private route, and only those', () => {
    const trip = renderRouteHtml(indexHtml, routeFor('/trip')!);
    const faq = renderRouteHtml(indexHtml, routeFor('/faq')!);

    // `usePageMeta` sets this too, but the readers these shells exist for never run it.
    expect(trip).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(faq).not.toContain('name="robots"');
  });

  it('throws if the root element it must fill is gone', () => {
    const withoutRoot = indexHtml.replace('<div id="root"></div>', '<div id="app"></div>');
    expect(() => renderRouteHtml(withoutRoot, routeFor('/faq')!, '<main/>')).toThrow(/root/);
  });

  it('throws rather than silently emitting an unrewritten page', () => {
    // The failure this prevents: someone reformats the head, a regex stops matching,
    // and every page ships claiming to be the home page.
    const withoutCanonical = indexHtml.replace(/<link rel="canonical"[^>]*>/, '');
    expect(() => renderRouteHtml(withoutCanonical, routeFor('/faq')!)).toThrow(/canonical/);
  });
});

describe('FAQ structured data', () => {
  it('describes exactly the questions and answers the page renders', () => {
    const data = JSON.parse(faqJsonLd());
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(FAQ.length);
    expect(data.mainEntity.map((q: { name: string }) => q.name)).toEqual(
      FAQ.map((entry) => entry.question),
    );
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(FAQ[0].answer);
  });

  it('asks questions and gives answers long enough to be worth extracting', () => {
    for (const { question, answer } of FAQ) {
      expect(question.endsWith('?')).toBe(true);
      expect(answer.length).toBeGreaterThan(60);
    }
  });
});

describe('sitemap', () => {
  const xml = renderSitemap();

  it('lists every indexable route and nothing else', () => {
    const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(listed).toEqual(ROUTES.map((route) => canonicalFor(route.path)));
  });

  it('is a well-formed urlset', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});

describe('output file names', () => {
  it('writes extensionless paths as bare .html files', () => {
    // `faq/index.html` makes Pages answer /faq with a 308 to /faq/, putting a redirect
    // hop in front of every page and disagreeing with the canonical URL.
    expect(outputFileFor(routeFor('/faq')!)).toBe('faq.html');
    expect(outputFileFor(routeFor('/when2meet-alternative')!)).toBe('when2meet-alternative.html');
  });

  it('keeps the home page as the entry index.html', () => {
    expect(outputFileFor(routeFor('/')!)).toBe('index.html');
  });

  it('names the shells the fallback and Pages actually look for', () => {
    // Cloudflare Pages serves dist/404.html for an unmatched path. Renaming it
    // silently restores the soft 404 this replaced.
    expect(outputFileFor(routeFor('/404')!)).toBe('404.html');
  });

  it('gives the trip shell a name that is not a route of its own', () => {
    // trip.html would serve a blank shell at /trip, a path the router does not have.
    expect(outputFileFor(routeFor('/trip')!)).toBe('trip-shell.html');
    expect(outputFileFor(routeFor('/trip')!)).not.toBe('trip.html');
  });
});

describe('freshness stamp', () => {
  it('rewrites dateModified with the day the bundle was built', () => {
    // A literal in index.html is true the day someone types it and quietly false
    // afterwards. Answer engines weight recency, and a wrong date is worse than none.
    const html = renderRouteHtml(indexHtml, routeFor('/')!, undefined, '2026-09-15');
    expect(html).toContain('"dateModified": "2026-09-15"');
    expect(html).not.toContain('"dateModified": "2026-08-28"');
  });

  it('throws if the field it stamps is removed from the JSON-LD', () => {
    const without = indexHtml.replace(/"dateModified": "[^"]*",/, '');
    expect(() => renderRouteHtml(without, routeFor('/')!)).toThrow(/dateModified/);
  });

  it('reads the build date in UTC, not in the local calendar', () => {
    // The suite runs in America/New_York. A local read of this instant gives the 14th.
    expect(buildDate(new Date('2026-09-15T02:30:00Z'))).toBe('2026-09-15');
  });

  it('ties the site to its entity profiles, and claims no rating', () => {
    // Read out of the JSON-LD rather than off the file, so the comment that explains
    // the missing rating cannot satisfy the assertion about it.
    const jsonLd = indexHtml.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )![1];
    const data = JSON.parse(jsonLd);

    expect(data['@type']).toBe('WebApplication');
    expect(data.creator.sameAs).toContain('https://github.com/janwan2003/trip-planner');
    expect(data.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // There are no reviews. Inventing them is a fabrication and a policy violation.
    expect(data.aggregateRating).toBeUndefined();
  });
});

describe('llms-full.txt', () => {
  const pages = [
    { route: routeFor('/faq')!, body: '<main><h1>Questions</h1><p>Does everyone need an account?</p></main>' },
  ];

  it('strips markup down to the prose an answer engine would extract', () => {
    const text = htmlToText(
      '<main><!--$--><h2>Side by side</h2><script>ignored()</script>' +
        '<p>A trip is not an&nbsp;hour.</p><tr><td>Them</td><td>Us</td></tr><!--/$--></main>',
    );

    expect(text).toContain('Side by side');
    expect(text).toContain('A trip is not an hour.');
    // React's suspense markers land mid-sentence if they survive.
    expect(text).not.toContain('$');
    expect(text).not.toContain('ignored');
    expect(text).not.toMatch(/<[a-z]/i);
    // A table row has to stay legible as a row, not run into the next one.
    expect(text).toContain('Them — Us');
  });

  it('separates a run of nav links without spacing out the punctuation', () => {
    const text = htmlToText(
      '<nav><a href="/">Home</a><a href="/faq">FAQ</a></nav>' +
        '<p>More on the <a href="/faq">FAQ</a>, and elsewhere.</p>',
    );

    expect(text).toContain('Home FAQ');
    expect(text).toContain('More on the FAQ, and elsewhere.');
  });

  it('drops the empty corner cell a header row starts with', () => {
    expect(htmlToText('<tr><th></th><th>When2meet</th><th>WeGoWhen</th></tr>')).toBe(
      'When2meet — WeGoWhen',
    );
  });

  it('names each page with its title and canonical URL', () => {
    const full = renderLlmsFull(pages, '2026-09-15');
    expect(full).toContain('## WeGoWhen FAQ — group trip dates, answered');
    expect(full).toContain('URL: https://wegowhen.com/faq');
    expect(full).toContain('Does everyone need an account?');
    expect(full).toContain('2026-09-15');
  });

  it('points back at the short index rather than replacing it', () => {
    expect(renderLlmsFull(pages)).toContain('https://wegowhen.com/llms.txt');
  });
});

describe('sitemap lastmod', () => {
  it('names content sources that exist for every indexable route', () => {
    // A path that no longer exists makes `git log` return nothing, which silently drops
    // that route's lastmod - the failure looks like "Google just ignored it".
    for (const route of ROUTES) {
      expect(route.contentSources, `${route.path} has no contentSources`).toBeDefined();
      expect(route.contentSources!.length).toBeGreaterThan(0);
      for (const file of route.contentSources!) {
        expect(existsSync(resolve(__dirname, '../..', file)), `${file} is missing`).toBe(true);
      }
    }
  });

  it('lists the page that renders each route among its own sources', () => {
    expect(routeFor('/faq')!.contentSources).toContain('src/pages/Faq.tsx');
    expect(routeFor('/privacy')!.contentSources).toContain('src/pages/PrivacyPolicy.tsx');
    // The FAQ answers live in the FAQ array in this module, not in the page component,
    // so an edit to them has to move /faq's date.
    expect(routeFor('/faq')!.contentSources).toContain('src/lib/siteMeta.ts');
  });

  it('does not bump one page when another one changes', () => {
    // The whole reason the dates are per route rather than one build stamp.
    const about = routeFor('/about')!.contentSources!;
    expect(about).not.toContain('src/pages/Contact.tsx');
    expect(about).not.toContain('src/components/MarketingPage.tsx');
  });

  it('emits lastmod for the routes a date is known for, and omits it otherwise', () => {
    const xml = renderSitemap((route) => (route.path === '/faq' ? '2026-08-31' : undefined));
    const faqBlock = xml.slice(xml.indexOf('<loc>https://wegowhen.com/faq</loc>'));

    expect(faqBlock).toContain('<lastmod>2026-08-31</lastmod>');
    // One route has a date; no other <lastmod> may appear.
    expect([...xml.matchAll(/<lastmod>/g)]).toHaveLength(1);
  });

  it('omits lastmod entirely when the build cannot date anything', () => {
    // git missing from the build image, or a clone too shallow to hold the commit.
    // Guessing today here is what teaches Google to ignore the field.
    expect(renderSitemap()).not.toContain('<lastmod>');
  });

  it('keeps lastmod after loc, where the schema requires it', () => {
    const xml = renderSitemap(() => '2026-08-31');
    expect(xml).toMatch(/<loc>[^<]+<\/loc>\n\s+<lastmod>2026-08-31<\/lastmod>/);
  });
});
