import { useEffect } from 'react';

import { canonicalFor, routeFor } from './siteMeta';

/**
 * Keeps the document head correct during client-side navigation.
 *
 * The static head that a crawler or an unfurler reads is written at build time by the
 * `prerenderRoutes` plugin — neither of them waits for React, so this hook is not what
 * makes the site indexable. What it fixes is the browser: without it, someone who
 * lands on the home page and clicks through to the FAQ keeps the home page's title in
 * their tab, in their history, and in anything they share from the browser UI.
 */
export const usePageMeta = (path: string, overrides: { title?: string } = {}): void => {
  const route = routeFor(path);
  const title = overrides.title ?? route?.title;
  const description = route?.description;
  const noindex = route?.noindex ?? false;

  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      const tag = document.querySelector('meta[name="description"]');
      if (tag) tag.setAttribute('content', description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && route) canonical.setAttribute('href', canonicalFor(route.path));

    // Trip pages are reachable by anyone holding the link, which makes them private by
    // convention rather than by access control. Keeping them out of an index is the
    // difference between "hard to find" and "listed in search results".
    const existing = document.querySelector('meta[name="robots"]');
    if (noindex) {
      const tag = existing ?? document.head.appendChild(document.createElement('meta'));
      tag.setAttribute('name', 'robots');
      tag.setAttribute('content', 'noindex, nofollow');
    } else {
      existing?.remove();
    }
  }, [title, description, noindex, route]);
};
