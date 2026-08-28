# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A group of friends planning one trip together, where **one person organises**. That
organiser creates the trip, sets the outer date range, and sends the link around
themselves. Everyone else arrives as an invited participant who only marks the days
they are free.

The two roles are asymmetric and both matter:

- **Organiser** — creates the trip, watches availability accumulate, decides the dates.
- **Participant** — arrives cold from a link, usually on a phone, with no prior context
  about the tool. Identifies themselves by typing a name. Wants to be finished in under
  a minute and never come back.

Group size is small: a handful to a dozen or so people, one non-recurring trip.

## Product Purpose

Find the days a group can actually travel together, by collecting each person's
availability and surfacing the date ranges that work for the most people.

Success is the organiser reaching a decision: a concrete start and end date that the
group accepts. Everything else in the product is in service of that one moment.

## Positioning

Two things together, per the product owner — neither alone is the claim:

1. **Whole trips, not meeting slots.** Doodle and When2Meet answer "which hour suits
   everybody". A trip is not an hour, it is a stretch of days. `src/components/BestDates.tsx`
   enumerates participant subsets and, for each, finds the **maximal consecutive day
   ranges** where every member of that subset is free, then ranks by group size, then
   range length, then chronology, and drops ranges dominated by a longer one. The output
   is "these six people can all go for these five days", not a grid of ticks the organiser
   has to read themselves.

2. **Effectively nothing occupies this space, and the need is real.** The product owner's
   position is that multi-day group trip coordination is not served by an obvious existing
   tool, while being acutely useful. Preserve that framing: the product competes on being
   the thing that does this at all, plus being simpler than the alternatives people
   currently improvise with (group chats, spreadsheets, meeting pollers bent to the task).

## Operating Context

- Availability is marked on a calendar spanning the organiser's chosen range. Days are
  selected by tapping, or by holding and dragging across several consecutive days.
- A heat map shows, per day, how many participants are free, so the organiser reads
  consensus at a glance.
- Participants can be filtered, so the organiser can ask "what if these five go".
- Participants can edit their name and withdraw from a trip.
- Sharing happens outside the product: the organiser copies a URL and sends it through
  whatever channel the group already uses.

## Capabilities and Constraints

**Confirmed constraints, not negotiable:**

- **No accounts, no logins.** A participant never registers and never supplies an email
  address. Identity is a typed name plus possession of the trip link.
- **Must work on a phone.** Marking availability is a touch interaction first. See the
  open defect below — this constraint is currently violated by the drag interaction.

**Technical constraints set by the product owner:**

- The entire stack stays on **Cloudflare** — Pages for the site, Pages Functions for the
  API, D1 for storage. No third-party backend service. (This replaced an earlier Supabase
  dependency, decided 2026-08-28.)
- Static single-page app, hash-based routing, deployed at `wegowhen.com`.

**Terminology:** *trip* (a named date range someone created), *participant* (a person
identified by name within one trip), *availability* (the set of days one participant
marked), *best dates* (a ranked list of maximal consecutive ranges).

**Explicitly undecided:**

- Whether the product ever sends anything itself — email invitations, reminders,
  notifications. The product owner did not commit either way, so no future work should
  assume it does or that it must not.
- Whether trips expire or are ever deleted.
- Behaviour with large groups. The current best-dates algorithm enumerates the full power
  set of participants, which is unusable past roughly twenty people and silently returns
  nothing at thirty-one; no supported maximum has been decided.

## Brand Commitments

- Name: **WeGoWhen**. Domain `wegowhen.com`.
- Existing assets in `public/`: `favicon.ico`, `favicon.png`, `logo.png`, `text-logo.png`.
- Voice in the shipped copy is plain and direct — "Find the perfect date", "Plan trips
  with friends by finding when everyone's available". No feature jargon, no exclamation.

## Evidence on Hand

- Working product at `https://wegowhen.com`, and the source in this repository.
- Legal and informational pages already written by the product owner: `src/pages/About.tsx`,
  `Contact.tsx`, `TermsOfService.tsx`, `PrivacyPolicy.tsx`.
- Prior schema for the data model in `supabase-schema.sql`, to be reworked for D1.

**Absences future work must not fabricate:** there are no users, no usage numbers, no
testimonials, no press, no case studies, no partners, and no pricing. The product has
been publicly reachable since 2026-08-28. Any social proof, counter, logo wall, or
adoption claim would be invented.

## Product Principles

1. **The participant's minute is the scarcest resource.** Someone who arrived from a link
   should be able to finish without reading anything or making an account.
2. **Answer the question, do not display the data.** The product's job is to name the
   ranges that work, not to render a grid and leave the reading to the organiser.
3. **A trip is a range of days.** Any feature that reduces the unit back to a single date
   or an hour-of-day is working against the product.
4. **The link is the whole invitation mechanic.** Possession of the URL is the credential;
   nothing should require more than that from a participant.
5. **Touch is the primary input.** The organiser may be at a desk; the group is on phones.

## Accessibility & Inclusion

No product-specific standard has been established by the product owner. One
product-derived requirement follows from the principles above: availability marking must
be operable without a mouse drag, which covers touch users and keyboard users alike.
