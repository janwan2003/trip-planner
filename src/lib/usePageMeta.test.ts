import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeFor } from './siteMeta';
import { usePageMeta } from './usePageMeta';

const head = () => ({
  description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
});

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<meta name="description" content="stale" />' +
      '<link rel="canonical" href="https://wegowhen.com/" />';
    document.title = 'stale';
  });

  it('applies the title, description and canonical of a known route', () => {
    renderHook(() => usePageMeta('/faq'));
    const faq = routeFor('/faq')!;

    expect(document.title).toBe(faq.title);
    expect(head().description).toBe(faq.description);
    expect(head().canonical).toBe('https://wegowhen.com/faq');
  });

  it('lets a page override the title, for one named after its content', () => {
    renderHook(() => usePageMeta('/trip', { title: 'Ski week | WeGoWhen' }));
    expect(document.title).toBe('Ski week | WeGoWhen');
  });

  it('marks a trip page noindex, since the link is the only credential', () => {
    renderHook(() => usePageMeta('/trip'));
    expect(head().robots).toBe('noindex, nofollow');
  });

  it('removes a stale robots tag when moving to an indexable page', () => {
    renderHook(() => usePageMeta('/trip'));
    expect(head().robots).toBe('noindex, nofollow');

    renderHook(() => usePageMeta('/faq'));
    expect(head().robots).toBeUndefined();
  });

  it('leaves the head alone for a path it does not know', () => {
    renderHook(() => usePageMeta('/nope'));

    expect(document.title).toBe('stale');
    expect(head().description).toBe('stale');
  });
});
