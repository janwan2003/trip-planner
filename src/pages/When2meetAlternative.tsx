import { Link } from 'react-router-dom';

import { ComparisonTable, MarketingPage, Section } from '@/components/MarketingPage';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Targets "when2meet alternative" and the phrasings around it — including the one
 * Google reports as a related query, "when 2 meet but for days", which is answered
 * here in those words on purpose.
 *
 * Every statement about When2meet below is checkable on when2meet.com, and was
 * checked on 2026-08-28. If that changes, this page changes.
 */
export default function When2meetAlternative() {
  usePageMeta('/when2meet-alternative');

  return (
    <MarketingPage
      title="A When2meet alternative for whole days, not hours"
      standfirst="If you have ever set a When2meet to run from midnight to midnight because what you were actually picking was the dates of a trip, this is the tool for that."
    >
      <Section heading="When2meet is good at the job it was built for">
        <p>
          When2meet finds an hour. You give it some candidate dates and a time-of-day
          window, everyone drags over the slots they are free, and it shades a grid so the
          overlap is visible. For "which evening this week can the six of us get on a
          call", that is close to perfect, and it is free and needs nobody to sign up.
        </p>
      </Section>

      <Section heading="What breaks when the thing you are picking is a trip">
        <p>
          Create a When2meet today and it asks two questions: <em>What dates might work?</em>{' '}
          and <em>What times might work?</em> — the second with a "no earlier than" and a
          "no later than" hour. The time window is not optional, so a trip has to be
          smuggled in: you set it midnight to midnight and every day of the trip becomes a
          full column of time slots nobody cares about.
        </p>
        <p>
          Then the harder part. Even with a filled-in grid, the question you actually have
          is "which stretch of days can the most of us make", and a grid does not answer
          that. You read down the columns, find the run of days that looks darkest, count
          the people, and try to remember whether a longer run with one fewer person would
          have been better. With eleven people and a month of candidate days, nobody does
          that reliably.
        </p>
      </Section>

      <Section heading="When 2 meet, but for days">
        <p>
          That is the search people actually type, and it is a fair description of
          WeGoWhen. The unit is a day, not an hour. The organiser sets an outer window —
          any time in September, say — and shares one link. Everyone else taps the days they
          are free, on a phone, in under a minute, without an account or an email address.
        </p>
        <p>
          What comes back is not a grid. WeGoWhen works out every run of consecutive days
          that some group of people can <em>all</em> make, discards any run that a longer one
          already covers, and ranks what is left by how many people it includes, then by how
          long it is, then by date. The top row reads like an answer: <strong>6 of 6 free,
          Fri 12 – Mon 15</strong>. You can also filter the participants, to ask what
          happens if two people drop out.
        </p>
      </Section>

      <Section heading="Side by side">
        <ComparisonTable
          competitor="When2meet"
          rows={[
            {
              aspect: 'What you are choosing',
              them: 'A time slot inside a day',
              us: 'A stretch of consecutive days',
            },
            {
              aspect: 'What it asks for',
              them: 'Candidate dates and a time-of-day window',
              us: 'Days only',
            },
            {
              aspect: 'What you get back',
              them: 'A grid of time slots, shaded by how many people are free',
              us: 'Ranked date ranges, each with the people who can make all of it',
            },
            {
              aspect: 'Who does the reading',
              them: 'You',
              us: 'The tool',
            },
            {
              aspect: 'Account needed to answer',
              them: 'No',
              us: 'No',
            },
            {
              aspect: 'Price',
              them: 'Free',
              us: 'Free, with no paid tier',
            },
            {
              aspect: 'Group size',
              them: 'Not published',
              us: 'Up to 200 people per trip',
            },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Checked against when2meet.com on 28 August 2026.
        </p>
      </Section>

      <Section heading="When to stay with When2meet">
        <p>
          If what you need is an hour — a meeting, a call, a rehearsal, anything that starts
          and ends on the same day — When2meet does that directly and WeGoWhen cannot do it
          at all. There is no time-of-day dimension here by design. Use the tool shaped like
          the question.
        </p>
      </Section>

      <Section heading="Questions people ask next">
        <p>
          Can I plan something months ahead? Yes — the window is whatever you set, so next
          spring works like next weekend. Does everyone need an app? No, it is a web page.
          What about a group of thirty? Fine; the limit is 200 per trip.
        </p>
        <p>
          More of these on the <Link to="/faq" className="text-primary hover:underline">FAQ</Link>,
          and there is a{' '}
          <Link to="/doodle-alternative" className="text-primary hover:underline">
            comparison with Doodle
          </Link>{' '}
          if that is the tool your group already uses.
        </p>
      </Section>
    </MarketingPage>
  );
}
