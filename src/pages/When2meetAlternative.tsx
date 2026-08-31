import { Link } from 'react-router-dom';

import { ComparisonTable, MarketingPage, Section } from '@/components/MarketingPage';
import { QuestionAnswer } from '@/components/QuestionAnswer';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Targets "when2meet alternative" and the phrasings around it — including the one
 * Google reports as a related query, "when 2 meet but for days", which is answered
 * here in those words on purpose.
 *
 * Two of the section headings are the exact wording of a People Also Ask entry on that
 * SERP, measured 2026-08-31: "Is there anything better than When2meet?" (answered on
 * /faq) and "What are the limitations of When2meet?" (here). Matching the question that
 * is actually being asked is the whole trick; there is no crawler-only text on this page
 * and there must never be, because every claim on it is one an AI engine cross-checks
 * against when2meet.com.
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
        <QuestionAnswer question="Can I use When2meet for multiple days?">
          <p>
            You can, by setting the time window to midnight-to-midnight, and people do —
            "when2meet but for days" is a phrase Google reports as a real search. What you
            get is a grid of time slots across every day of the trip, which you then read
            yourself. WeGoWhen skips the grid and returns the ranked date ranges.
          </p>
        </QuestionAnswer>

        <QuestionAnswer question="What are the limitations of When2meet?">
          <p>
            For picking an hour, the one that matters here is that the time-of-day window
            is mandatory — there is no way to ask it about whole days — and that what it
            returns is a shaded grid rather than an answer, so working out which stretch of
            days the most people can make is left to whoever is reading it. Both are
            checkable on when2meet.com and both are deliberate: it was built to find an
            hour, and it does. Neither is a problem until the thing you are picking runs
            across several days.
          </p>
        </QuestionAnswer>

        <QuestionAnswer question="Can I use When2meet for next month, or a window spanning months?">
          <p>
            You can list any dates you like, so next month is no harder than next week —
            but the time-of-day grid comes with them, and it grows a column per day. In
            WeGoWhen the outer window is whatever you set, so next spring works like next
            weekend, and one participant can mark up to 1000 days.
          </p>
        </QuestionAnswer>

        <QuestionAnswer question="Does everyone need an app or an account?">
          <p>
            Neither. It is a web page, and nobody signs up — not the people answering, and
            not the person who creates the trip.
          </p>
        </QuestionAnswer>

        <QuestionAnswer question="What about a group of thirty?">
          <p>
            Fine; the limit is 200 people per trip, and the ranking stays fast at that size
            because it walks date ranges carrying a bitmask of who is free rather than
            enumerating subsets of participants.
          </p>
        </QuestionAnswer>

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
