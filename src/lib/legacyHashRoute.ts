/**
 * The app used to route with `HashRouter`, so every URL anyone has ever shared looks
 * like `https://wegowhen.com/#/trip/abc123`. Those links have to keep working: the
 * whole invitation mechanic is that possession of the URL is the credential, and a
 * dead link means a trip nobody can reach.
 *
 * Called once before React mounts, this rewrites a legacy hash URL to its path form
 * with `history.replaceState`, so the router sees `/trip/abc123` and the address bar
 * never shows the intermediate state.
 */

/**
 * The path-form URL a legacy hash URL should become, or `null` if there is nothing to
 * rewrite. Pure, so the mapping is testable without a browser.
 *
 * @param hash   `window.location.hash`, including the leading `#`.
 * @param search `window.location.search`, including the leading `?`.
 */
export const pathFromLegacyHash = (hash: string, search = ''): string | null => {
  if (!hash.startsWith('#/')) return null;

  const withoutHash = hash.slice(1);
  // A hash can carry its own query string - `#/trip/abc?x=1` - and that one is the
  // more specific of the two, so it wins over anything before the `#`.
  const [path, hashQuery] = withoutHash.split('?');
  const query = hashQuery ? `?${hashQuery}` : search;

  return `${path}${query}`;
};

export const applyLegacyHashRedirect = (location: Location = window.location): void => {
  const target = pathFromLegacyHash(location.hash, location.search);
  if (target) window.history.replaceState(null, '', target);
};
