/**
 * The link preview for one invitation link: the title and description WhatsApp, iMessage,
 * Slack and the rest show when someone pastes `/trip/:id` into a group chat.
 *
 * Invitation links are how nearly everyone arrives (see the usage ledger in CLAUDE.md),
 * and every one of them used to unfurl as the same "Your trip | WeGoWhen". The Function
 * in `functions/trip/[id].ts` now writes this into the trip shell's head instead.
 *
 * Two choices here are deliberate:
 *
 * - **Dates only, never the trip's name.** The preview is fetched by the messaging app's
 *   own servers, not only by the people in the chat, and a trip name is other people's
 *   words. The date window says what the link is for without handing those over.
 * - **English only**, like every other page title on the site: the unfurler's request
 *   says nothing reliable about the language of whoever will read the card.
 *
 * Lives in `src/lib` rather than beside the Function so the unit suite and its coverage
 * measure it; it is pure, and imports nothing that needs a DOM or a Worker.
 */

import { SITE_ORIGIN } from './siteMeta';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Ymd {
  year: number;
  month: string;
  day: number;
}

/** Splits a `YYYY-MM-DD` string into its parts; null for anything that is not a real date. */
const parse = (value: string): Ymd | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  // Built only to reject 2026-02-31, which Date.UTC would roll into March.
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month: MONTHS[month - 1], day };
};

/**
 * A trip's date window the way the trip page shows it to an English reader: "Feb 1 – 28,
 * 2027", "Feb 28 – Mar 3, 2027", "Dec 28, 2026 – Jan 3, 2027", or "Feb 12, 2027" for a
 * one-day trip. Formatted by hand rather than through Intl so the Function's output does
 * not depend on the ICU data of whichever runtime serves it. Null for an invalid range.
 */
export const formatDateWindow = (startDate: string, endDate: string): string | null => {
  const start = parse(startDate);
  const end = parse(endDate);
  if (!start || !end || startDate > endDate) return null;

  if (startDate === endDate) return `${start.month} ${start.day}, ${start.year}`;
  if (start.year !== end.year) {
    return `${start.month} ${start.day}, ${start.year} – ${end.month} ${end.day}, ${end.year}`;
  }
  if (start.month !== end.month) {
    return `${start.month} ${start.day} – ${end.month} ${end.day}, ${end.year}`;
  }
  return `${start.month} ${start.day} – ${end.day}, ${end.year}`;
};

export interface TripPreview {
  title: string;
  description: string;
  /** The invitation link itself, absolute. Also what the preview's og:url must say. */
  url: string;
}

/**
 * The preview for one trip, or null when its dates cannot be read - in which case the
 * shell's generic head is served unchanged.
 *
 * `url` matters as much as the text: Facebook and WhatsApp key their preview cache on
 * og:url, and while every trip shell said `https://wegowhen.com/trip`, a card fetched for
 * one trip could have been served for all of them.
 */
export const tripPreview = (trip: {
  id: string;
  startDate: string;
  endDate: string;
}): TripPreview | null => {
  const range = formatDateWindow(trip.startDate, trip.endDate);
  if (!range) return null;

  return {
    title: `Mark the days you're free: ${range} | WeGoWhen`,
    description:
      'Your group is picking dates for a trip. Tap the days you can make it, and WeGoWhen shows which dates work for everyone. No account needed.',
    url: `${SITE_ORIGIN}/trip/${encodeURIComponent(trip.id)}`,
  };
};
