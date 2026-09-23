import { isTripId } from '../_lib/trips';
import { TripPreview, tripPreview } from '../../src/lib/tripPreview';

interface Env {
  DB: D1Database;
  /** Pages' own static asset server, so the Function can start from the built shell. */
  ASSETS: Fetcher;
}

/**
 * GET /trip/:id - the trip shell, with a head that describes this trip.
 *
 * Until 2026-09-23 this path was a plain `_redirects` rewrite to `/trip-shell`, so every
 * invitation link unfurled in a group chat as the same "Your trip | WeGoWhen". The shell
 * is the same file now; only its title, description, og:url and canonical are rewritten,
 * with the trip's date window from `tripPreview` (dates only - see there for why).
 *
 * The body is untouched: `#root` stays empty and the head keeps its `noindex`, for the
 * reasons in `public/_redirects`. And every failure - no such trip, an id the API would
 * refuse, a database without its schema yet, D1 unreachable - serves the shell exactly
 * as built. A generic preview is still a working invitation; an error page is not.
 */

/** Spelled without `.html`: Pages 308s `/trip-shell.html` to this. See `_redirects`. */
const SHELL_PATH = '/trip-shell';

/**
 * `public/_headers` is not applied to a response a Function returns, so the headers it
 * sets on every page are repeated here. An integration test compares them with a static
 * page's, so the two files cannot drift apart unnoticed.
 */
const PAGE_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const readDates = async (db: D1Database, id: string) => {
  const row = await db
    .prepare('SELECT start_date, end_date FROM trips WHERE id = ?')
    .bind(id)
    .first<{ start_date: string; end_date: string }>();
  return row ? { startDate: row.start_date, endDate: row.end_date } : null;
};

const setAttribute = (name: string, value: string) => ({
  element: (element: Element) => {
    element.setAttribute(name, value);
  },
});

/** HTMLRewriter escapes both attribute values and text, so nothing here is raw HTML. */
const withPreview = (shell: Response, preview: TripPreview): Response =>
  new HTMLRewriter()
    .on('title', {
      element: (element) => {
        element.setInnerContent(preview.title);
      },
    })
    .on('meta[property="og:title"]', setAttribute('content', preview.title))
    .on('meta[name="twitter:title"]', setAttribute('content', preview.title))
    .on('meta[name="description"]', setAttribute('content', preview.description))
    .on('meta[property="og:description"]', setAttribute('content', preview.description))
    .on('meta[name="twitter:description"]', setAttribute('content', preview.description))
    .on('meta[property="og:url"]', setAttribute('content', preview.url))
    .on('link[rel="canonical"]', setAttribute('href', preview.url))
    .transform(shell);

const previewFor = async (db: D1Database, id: string | string[]): Promise<TripPreview | null> => {
  if (typeof id !== 'string' || !isTripId(id)) return null;
  try {
    const dates = await readDates(db, id);
    return dates ? tripPreview({ id, ...dates }) : null;
  } catch (error) {
    console.error('Could not read a trip for its link preview:', error);
    return null;
  }
};

export const onRequest: PagesFunction<Env, 'id'> = async ({ request, env, params, next }) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();

  const shell = await env.ASSETS.fetch(new URL(SHELL_PATH, request.url));

  const headers = new Headers(shell.headers);
  for (const [name, value] of Object.entries(PAGE_HEADERS)) headers.set(name, value);
  // Both describe the file on disk, which the rewritten body no longer is.
  headers.delete('etag');
  headers.delete('content-length');

  if (request.method === 'HEAD') {
    return new Response(null, { status: shell.status, headers });
  }

  const preview = shell.ok ? await previewFor(env.DB, params.id) : null;
  const body = preview ? withPreview(shell, preview).body : shell.body;

  return new Response(body, { status: shell.status, headers });
};
