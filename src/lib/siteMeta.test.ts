import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  FAQ,
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
