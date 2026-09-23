import { Env, badRequest, json, newId } from '../_lib/trips';

/** Caps chosen, like the trip limits, to bound what one unauthenticated request can write. */
export const FEEDBACK_LIMITS = {
  message: 2000,
  contact: 200,
  page: 300,
  userAgent: 400,
} as const;

interface FeedbackBody {
  kind?: unknown;
  message?: unknown;
  contact?: unknown;
  page?: unknown;
}

const optionalText = (value: unknown, max: number): string | null | undefined => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.length > max) return undefined;
  return value.trim() || null;
};

/**
 * POST /api/feedback — store a bug report or a feature request.
 *
 * Write-only by design: there is no GET. Feedback is read out of band from D1 by the
 * owner, so nothing a visitor submits is ever shown to another visitor.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: FeedbackBody;
  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return badRequest('Body must be JSON.');
  }

  const { kind, message } = body;

  if (kind !== 'bug' && kind !== 'feature') {
    return badRequest('kind must be "bug" or "feature".');
  }
  if (typeof message !== 'string' || !message.trim() || message.length > FEEDBACK_LIMITS.message) {
    return badRequest(`message must be 1-${FEEDBACK_LIMITS.message} characters.`);
  }

  const contact = optionalText(body.contact, FEEDBACK_LIMITS.contact);
  if (contact === undefined) {
    return badRequest(`contact must be at most ${FEEDBACK_LIMITS.contact} characters.`);
  }
  const page = optionalText(body.page, FEEDBACK_LIMITS.page);
  if (page === undefined) {
    return badRequest(`page must be at most ${FEEDBACK_LIMITS.page} characters.`);
  }
  // Truncated rather than refused: a long user agent is the browser's doing, not the sender's.
  const userAgent = request.headers.get('user-agent')?.slice(0, FEEDBACK_LIMITS.userAgent) ?? null;

  const id = newId();
  await env.DB.prepare(
    'INSERT INTO feedback (id, kind, message, contact, page, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(id, kind, message.trim(), contact, page, userAgent)
    .run();

  return json({ id }, 201);
};
