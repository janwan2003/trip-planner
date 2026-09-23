import type { Locale } from '@/i18n/config';

/**
 * One language's search-facing content: the head of its home page, and one landing page
 * written for that market's own searches.
 *
 * Plain data, deliberately. `src/lib/siteMeta.ts` builds routes, the sitemap and the
 * hreflang clusters from these objects at build time, and `LocalizedLanding.tsx` renders
 * them, so the words a crawler reads in the head and in the body cannot drift apart.
 *
 * Written natively for the market, not translated from the English pages: the searches
 * differ (Japanese users search 日程調整ツール, French users search for a Framadate
 * alternative), and so do the incumbents. Every claim about a competitor must be one its
 * own site supports on the `checked` date.
 */
export interface LocaleSeo {
  locale: Exclude<Locale, 'en'>;
  /** `YYYY-MM-DD`, bumped by hand whenever this file's words change. */
  contentUpdated: string;
  home: {
    /** `<title>` for `/xx`, at most 65 characters. */
    title: string;
    /** Meta description for `/xx`, 70-160 characters. */
    description: string;
  };
  landing: {
    /** URL segment after `/xx/`, lowercase ASCII with hyphens. */
    slug: string;
    /** `<title>`, at most 65 characters. */
    title: string;
    /** Meta description, 70-160 characters. */
    description: string;
    /** Short label for links to this page from the footer. */
    linkLabel: string;
    /** The page's single `<h1>`. */
    heading: string;
    /** One or two sentences under the heading. */
    standfirst: string;
    sections: { heading: string; paragraphs: string[] }[];
    comparison?: {
      /** The competitor's name as its column header. */
      competitor: string;
      rows: { aspect: string; them: string; us: string }[];
      /** A line under the table saying where and when the competitor column was checked. */
      checked: string;
    };
    /** Question headings phrased the way people search, each with a short answer. */
    questions: { question: string; answer: string }[];
  };
}
