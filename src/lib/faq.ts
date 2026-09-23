/**
 * Questions real people type, answered in the words they type them in. The FAQ page
 * renders these and the prerenderer turns the same array into `FAQPage` JSON-LD, so
 * the structured data cannot describe answers the page does not show — which is both
 * a Google requirement and the honest thing to do.
 *
 * It lives in its own module rather than in `siteMeta.ts` so that the `/faq` route can
 * name *this* file as its content source. While the array sat next to the route table,
 * editing any other route's `contentUpdated` counted as a change to the FAQ page and
 * the lastmod audit demanded a date the words had not earned.
 */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Can I use When2meet for a trip that lasts several days?',
    answer:
      'You can, but it fights you. When2meet always asks for a time-of-day window as well as dates, so to use it for whole days you set it to run from midnight to midnight and end up reading a grid of time slots across every day of the trip. WeGoWhen only asks about days: each person taps the days they are free, and the result is a list of date ranges rather than a grid.',
  },
  {
    question: 'When to meet, but for days — is there a tool for that?',
    answer:
      'Yes, and that phrasing is what WeGoWhen is. When2meet always asks for a time-of-day window; WeGoWhen has none at all. You set one outer window, everyone taps the whole days they are free, and what comes back is the consecutive date ranges that fit the most people, ranked — not a grid to read yourself.',
  },
  {
    question: 'Is there anything better than When2meet?',
    answer:
      'It depends what you are picking. For an hour on a single day, When2meet does that directly and WeGoWhen cannot do it at all. For a trip that runs over several days, a time-of-day grid is the wrong shape for the question, and that is the case WeGoWhen was built for.',
  },
  {
    question: 'How do I find the dates a whole group is free?',
    answer:
      'Create a trip with an outer window — say, any time in September — and share the link. Everyone taps the days they are free. WeGoWhen then works out every run of consecutive days that a group could all make, and ranks those runs by how many people they include, then by how long they are. The top row is the answer: the dates, the days of the week, who is in it, and how many of the group that is - 6/6 for a range everyone can make.',
  },
  {
    question: 'Does everyone need an account?',
    answer:
      'No. Nobody needs an account, an email address or an app, including the person who creates the trip. Identity is a name someone types plus possession of the link, which is the whole invitation mechanic. That is also why the link should only go to people you want in the trip.',
  },
  {
    question: 'Is WeGoWhen free?',
    answer:
      'Yes, and there is no paid tier, no trial and no per-seat pricing. Nothing is gated and nothing expires.',
  },
  {
    question: 'Does it work on a phone?',
    answer:
      'Yes — that is the main case, since most people arrive from a link in a group chat. Tap a day to mark it, or hold and drag across several days to mark a stretch at once.',
  },
  {
    question: 'Can I plan a trip that is months away?',
    answer:
      'Yes. The outer window is whatever you set when you create the trip, so a trip next spring works exactly like a trip next weekend. There is no limit on how far ahead the window can start, and the window itself can be up to 366 days long - a full year.',
  },
  {
    question: 'How many people can join one trip?',
    answer:
      'Up to 200 per trip. The ranking walks date ranges carrying a bitmask of who is free, so it stays fast at that size rather than slowing down as the group grows.',
  },
  {
    question: 'How is this different from a poll like Doodle?',
    answer:
      'A poll collects votes on options and shows you the tally. WeGoWhen collects days and computes the answer: the consecutive ranges that work, ranked by how many people can make the whole stretch. It also has no plan limits — Doodle’s free tier allows one group poll and removing its ads means paying per seat.',
  },
  {
    question: 'Which is better, Doodle or When2meet?',
    answer:
      'For a meeting, it is a trade: Doodle adds calendar sync, reminders and booking pages behind a sign-up and a paid tier, while When2meet is free and asks for no account. Neither answers which stretch of days a group can travel for, because both are built around picking one slot rather than a run of days.',
  },
  {
    question: 'What happens to the trip data?',
    answer:
      'Trips are stored in Cloudflare D1 and reachable by anyone holding the link. No email addresses are collected because none are asked for. Participants can rename themselves or withdraw from a trip.',
  },
];
