// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { LOCALE_SEO, homePath, landingPath } from '@/content/seo';
import { LOCALES } from '@/i18n/config';

import { renderRouteBody } from './entry-prerender';

/**
 * What a crawler that does not run JavaScript reads on a localised URL. The head can be
 * right while the body is still the English page - that is the failure this guards.
 */
describe('prerendered localised pages', () => {
  it.each(LOCALE_SEO)('/$locale renders the home page in its own language', async (seo) => {
    const { default: bundle } = await LOCALES[seo.locale].load();
    const body = await renderRouteBody(homePath(seo.locale), seo.locale);
    expect(body).toContain(bundle.messages.home.title.replace(/'/g, '&#x27;'));
    expect(body).not.toContain('Find the days your group can actually go');
  });

  it.each(LOCALE_SEO)('/$locale landing page renders its content', async (seo) => {
    const body = await renderRouteBody(landingPath(seo), seo.locale);
    expect(body).toContain(seo.landing.questions[0].answer.slice(0, 20).replace(/'/g, '&#x27;'));
    expect(body).toContain('<h1');
  });

  it('switches back to English for an English page rendered afterwards', async () => {
    await renderRouteBody('/ja', 'ja');
    const body = await renderRouteBody('/', undefined);
    expect(body).toContain('Find the days your group can actually go');
  });

  it('renders an unknown localised slug as not found, not as a blank page', async () => {
    const body = await renderRouteBody('/fr/nope', 'fr');
    expect(body).toContain('404');
  });
});
