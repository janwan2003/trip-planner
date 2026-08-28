import { Env } from '../_lib/trips';
import { ensureSchema } from '../_lib/schema';

const jsonError = (message: string, status: number): Response =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/**
 * Runs before every /api route.
 *
 * Two jobs. First, apply the schema, so a new database — a preview deployment, a fresh
 * local `wrangler pages dev` — works on its first request with no setup step.
 *
 * Second, stop unmatched /api requests falling through to the SPA. `public/_redirects`
 * serves index.html for anything unmatched, which is right for app routes and wrong
 * for the API: `GET /api/trips`, which has no handler, answered 200 with HTML. A client
 * asking for JSON deserves a status that says what happened.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    await ensureSchema(context.env.DB);
  } catch (error) {
    console.error('Could not apply schema:', error);
    return jsonError('The trip service is not available right now.', 503);
  }

  const response = await context.next();

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    // Nothing under /api claimed this request, so the static handler answered.
    // 404 rather than 405: from here we cannot tell an unknown path from a known
    // path with an unsupported method, and 404 does not assert the path exists.
    return jsonError(
      `No API endpoint handles ${context.request.method} on this path.`,
      response.status === 200 ? 404 : response.status,
    );
  }

  return response;
};
