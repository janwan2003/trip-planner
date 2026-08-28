import { Link } from 'react-router-dom';

import { ComparisonTable, MarketingPage, Section } from '@/components/MarketingPage';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Targets "doodle alternative". Doodle itself holds a page-one result for that query
 * with a dedicated page, so the only way through is to be about something Doodle is
 * not about: the dates of a multi-day trip.
 *
 * The pricing figures below come from doodle.com/en/premium, read 2026-08-28. Prices
 * move; re-check them before quoting them anywhere else, and fix them here when they
 * change.
 */
export default function DoodleAlternative() {
  usePageMeta('/doodle-alternative');

  return (
    <MarketingPage
      title="A Doodle alternative for group trip dates"
      standfirst="Doodle collects votes on options and shows you the tally. If the options are days and the question is which stretch of them the most people can make, you want something that does the arithmetic."
    >
      <Section heading="What Doodle is">
        <p>
          Doodle is a scheduling product: group polls, booking pages, one-to-ones, sign-up
          sheets. It is aimed at professional scheduling, and priced that way — the free
          plan covers one group poll, one booking page and one 1:1, and moving past that,
          or removing the ads, means Pro at USD 11 per seat per month billed annually, or
          Team at USD 16. Answering a poll is free for the people you invite, but creating
          one starts with a sign-up.
        </p>
        <p className="text-sm text-muted-foreground">
          From doodle.com/en/premium, read 28 August 2026.
        </p>
      </Section>

      <Section heading="Why a poll is the wrong shape for a trip">
        <p>
          A poll asks people to vote on options you defined in advance. For a trip, the
          options are not obvious — that is the whole problem. "First weekend or second
          weekend" already assumes the answer is a weekend, and if the group could actually
          manage five days in the middle of the month, a poll of weekends will never find
          it.
        </p>
        <p>
          The second problem is what a poll gives back: a tally per option. Nine people can
          do the 12th, seven can do the 13th. Fine, but which <em>run</em> of days can a
          group all make from start to finish? A tally does not contain that answer, and
          working it out by hand across a month of columns is exactly the thing people get
          wrong.
        </p>
      </Section>

      <Section heading="What WeGoWhen does instead">
        <p>
          You set an outer window rather than a list of options, and share one link.
          Everyone taps the days they are free. WeGoWhen then computes, for every possible
          run of consecutive days, who can make all of it — and ranks those runs by how many
          people they include, then by length, then by date. No option list to guess at, and
          no tally to interpret: the top row is the recommendation.
        </p>
      </Section>

      <Section heading="Side by side">
        <ComparisonTable
          competitor="Doodle"
          rows={[
            {
              aspect: 'Built for',
              them: 'Meetings and appointments',
              us: 'Multi-day trips',
            },
            {
              aspect: 'What you set up',
              them: 'A list of options to vote on',
              us: 'An outer date window',
            },
            {
              aspect: 'What you get back',
              them: 'A tally per option',
              us: 'Ranked consecutive date ranges, with who can make each',
            },
            {
              aspect: 'Free plan',
              them: 'One group poll, one booking page, one 1:1; ads',
              us: 'Everything, unlimited, no ads',
            },
            {
              aspect: 'Paid tiers',
              them: 'Pro USD 11 and Team USD 16 per seat per month, billed annually',
              us: 'None',
            },
            {
              aspect: 'Account to create',
              them: 'Yes',
              us: 'No',
            },
            {
              aspect: 'Account to answer',
              them: 'No',
              us: 'No',
            },
          ]}
        />
      </Section>

      <Section heading="When to stay with Doodle">
        <p>
          Doodle does a great deal that WeGoWhen deliberately does not: booking pages,
          calendar integrations, reminders, deadlines, hiding participants from each other,
          Zoom and Teams links, paid bookings. If you are scheduling client meetings, that
          is the product, and this is not competing for that job.
        </p>
        <p>
          WeGoWhen does one thing: the dates of a trip for a group of friends. It has no
          accounts, no notifications and no integrations, and that is the trade it makes.
        </p>
      </Section>

      <Section heading="Also worth reading">
        <p>
          If your group reaches for{' '}
          <Link to="/when2meet-alternative" className="text-primary hover:underline">
            When2meet
          </Link>{' '}
          rather than Doodle, that comparison is a closer match — and the{' '}
          <Link to="/faq" className="text-primary hover:underline">
            FAQ
          </Link>{' '}
          covers group size, planning months ahead, and what happens to the data.
        </p>
      </Section>
    </MarketingPage>
  );
}
