import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { LOCALE_SEO, homePath, landingPath } from '@/content/seo';
import { SUPPORTED_LOCALES } from '@/i18n/config';

import { canonicalFor, outputFileFor, renderRouteHtml, renderSitemap } from './siteMeta';
import { ALL_ROUTES, HOME_ALTERNATES, LOCALIZED_ROUTES, alternatesFor } from './siteRoutes';

const indexHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');

/**
 * The localised half of the site: every non-English language has a home page and one
 * landing page, each with its own head, in the sitemap and the hreflang cluster.
 */
describe('localised routes', () => {
  it.each(LOCALIZED_ROUTES)('$path declares its own language in the JSON-LD', (route) => {
    // The structured data said "inLanguage": "en" with an English description on every
    // localised page, contradicting <html lang> in the same head.
    const html = renderRouteHtml(indexHtml, route, '<p>body</p>', '2026-09-23');
    const app = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .find((d) => d['@type'] === 'WebApplication');

    expect(app.inLanguage).toBe(route.locale);
    expect(app.description).toBe(route.appDescription);
    expect(app.description).toBe(LOCALE_SEO.find((s) => s.locale === route.locale)!.home.description);
  });

  it('gives every shipped language except English its content file', () => {
    expect(LOCALE_SEO.map((seo) => seo.locale).sort()).toEqual(
      SUPPORTED_LOCALES.filter((l) => l !== 'en').sort(),
    );
  });

  it('adds a home and a landing page per language, with no path or title clash', () => {
    expect(LOCALIZED_ROUTES).toHaveLength(LOCALE_SEO.length * 2);
    expect(new Set(ALL_ROUTES.map((r) => r.path)).size).toBe(ALL_ROUTES.length);
    expect(new Set(ALL_ROUTES.map((r) => r.title)).size).toBe(ALL_ROUTES.length);
  });

  it.each(LOCALIZED_ROUTES)('$path has a head within the length limits', (route) => {
    expect(route.title.length).toBeGreaterThan(10);
    expect(route.title.length).toBeLessThanOrEqual(65);
    expect(route.description.length).toBeGreaterThanOrEqual(70);
    expect(route.description.length).toBeLessThanOrEqual(160);
  });

  it.each(LOCALE_SEO)('$locale landing slug is a clean URL segment', (seo) => {
    expect(seo.landing.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(outputFileFor({ ...LOCALIZED_ROUTES[0], path: landingPath(seo) })).toBe(
      `${seo.locale}/${seo.landing.slug}.html`,
    );
  });

  it.each(LOCALE_SEO)('$locale landing page carries real content', (seo) => {
    expect(seo.landing.sections.length).toBeGreaterThanOrEqual(3);
    expect(seo.landing.questions.length).toBeGreaterThanOrEqual(3);
    for (const section of seo.landing.sections) {
      expect(section.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it.each(LOCALIZED_ROUTES)('$path is not claiming a date older than its last content commit', (route) => {
    let lastCommit = '';
    try {
      lastCommit = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...route.contentSources!], {
        encoding: 'utf8',
      }).trim();
    } catch {
      return;
    }
    if (!lastCommit) return;
    expect(route.contentUpdated! >= lastCommit).toBe(true);
  });
});

describe('the served head of a localised page', () => {
  const ja = LOCALIZED_ROUTES.find((r) => r.path === '/ja')!;
  const html = renderRouteHtml(indexHtml, ja, '<main>本文</main>', '2026-09-23', alternatesFor(ja));

  it('declares its language in <html lang> and og:locale', () => {
    expect(html).toContain('<html lang="ja">');
    expect(html).toContain('<meta property="og:locale" content="ja_JP" />');
    expect(html).not.toContain('<html lang="en">');
  });

  it('names every language version of the home page, and / as x-default', () => {
    for (const alt of HOME_ALTERNATES) {
      expect(html).toContain(`<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`);
    }
    expect(html).toContain(`hreflang="x-default" href="${canonicalFor('/')}"`);
    expect(html).toContain(`<link rel="canonical" href="${canonicalFor('/ja')}" />`);
  });

  it('keeps landing pages out of the cluster: they are written per market, not translated', () => {
    const landing = LOCALIZED_ROUTES.find((r) => r.path === landingPath(LOCALE_SEO[0]))!;
    expect(alternatesFor(landing)).toEqual([]);
  });

  it('leaves English pages English', () => {
    const faq = ALL_ROUTES.find((r) => r.path === '/faq')!;
    const out = renderRouteHtml(indexHtml, faq, '<main/>');
    expect(out).toContain('<html lang="en">');
    expect(out).toContain('content="en_US"');
  });
});

describe('the sitemap with localised pages', () => {
  const xml = renderSitemap(undefined, ALL_ROUTES, alternatesFor);

  it('lists every route, localised ones included', () => {
    const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(listed).toEqual(ALL_ROUTES.map((r) => canonicalFor(r.path)));
    for (const seo of LOCALE_SEO) {
      expect(listed).toContain(canonicalFor(homePath(seo.locale)));
      expect(listed).toContain(canonicalFor(landingPath(seo)));
    }
  });

  it('repeats the hreflang cluster on each home page entry', () => {
    const homeEntry = xml.split('<url>').find((chunk) => chunk.includes(`<loc>${canonicalFor('/fr')}</loc>`))!;
    expect(homeEntry.match(/xhtml:link/g)).toHaveLength(HOME_ALTERNATES.length);
  });
});

describe('llms.txt', () => {
  it('names every localised page, so an answer engine reading the index finds them', () => {
    const llms = readFileSync(resolve(__dirname, '../../public/llms.txt'), 'utf8');
    for (const route of LOCALIZED_ROUTES) {
      expect(llms, `${route.path} missing from public/llms.txt`).toContain(`(${canonicalFor(route.path)})`);
    }
  });
});
