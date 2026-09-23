/** Client for `POST /api/feedback` (see `functions/api/feedback.ts`). */

export type FeedbackKind = 'bug' | 'feature';

/** Mirrors `FEEDBACK_LIMITS` in the Function, so the form refuses what the API would. */
export const MAX_FEEDBACK_MESSAGE = 2000;
export const MAX_FEEDBACK_CONTACT = 200;

export interface Feedback {
  kind: FeedbackKind;
  message: string;
  contact?: string;
  page?: string;
}

export const sendFeedback = async (feedback: Feedback): Promise<void> => {
  let response: Response;
  try {
    response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(feedback),
    });
  } catch (cause) {
    throw new Error(`Could not reach the server: ${String(cause)}`);
  }
  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(error ?? `Sending feedback failed with ${response.status}.`);
  }
};
