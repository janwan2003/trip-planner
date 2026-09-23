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
 * Second, make sure an unmatched /api request answers JSON. When `public/_redirects`
 * carried a `/* /index.html 200` catch-all, `GET /api/trips` - which has no handler -
 * answered 200 with HTML. The catch-all is gone and Pages now answers such paths with
 * `404.html`, which is still HTML; a client asking for JSON deserves a JSON status that
 * says what happened.
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
