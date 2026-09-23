import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formattingTag } from './detect';
import { currentLocale, localeBundle } from './index';

/**
 * Every way the app shows a date, by name. Components ask for `'dayMonth'`, never for a
 * pattern like `'MMM d'`: the order of day and month, the abbreviations and the
 * punctuation are the locale's business, and `Intl.DateTimeFormat` knows them for
 * every language without anyone writing a pattern per locale.
 */
const DATE_STYLES = {
  day: { day: 'numeric' },
  month: { month: 'short' },
  weekday: { weekday: 'short' },
  weekdayLong: { weekday: 'long' },
  dayMonth: { day: 'numeric', month: 'short' },
  dayMonthYear: { day: 'numeric', month: 'short', year: 'numeric' },
  weekdayDayMonth: { weekday: 'short', day: 'numeric', month: 'short' },
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  monthYear: { month: 'long', year: 'numeric' },
  numeric: { day: '2-digit', month: '2-digit', year: 'numeric' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof DATE_STYLES;

/**
 * A `YYYY-MM-DD` string as a UTC instant, formatted in UTC below.
 *
 * Calendar days are the product's currency and they have no timezone. Building them in
 * UTC and formatting in UTC means no offset can move a day - the bug that shipped once
 * already (see "Dates" in CLAUDE.md). Never `new Date(iso)`.
 */
const utcDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** 2026-01-04 was a Sunday; the week header is built by walking forward from it. */
const A_SUNDAY = Date.UTC(2026, 0, 4);
const DAY_MS = 86_400_000;

const createFormatter = (tag: string, weekStartsOn: number) => {
  const cache = new Map<DateStyle, Intl.DateTimeFormat>();
  const formatter = (style: DateStyle) => {
    let f = cache.get(style);
    if (!f) {
      f = new Intl.DateTimeFormat(tag, { ...DATE_STYLES[style], timeZone: 'UTC' });
      cache.set(style, f);
    }
    return f;
  };

  return {
    /** First day of the week, 0 = Sunday, as `Date.getDay()` counts. */
    weekStartsOn,

    date: (iso: string, style: DateStyle) => formatter(style).format(utcDay(iso)),

    /** "Sep 1 – 7, 2026" / "1.–7. Sept. 2026": the locale decides what to repeat. */
    dateRange: (startIso: string, endIso: string, style: DateStyle) =>
      formatter(style).formatRange(utcDay(startIso), utcDay(endIso)),

    /** Short weekday names in calendar-column order for this locale. */
    weekdays: (): string[] =>
      Array.from({ length: 7 }, (_, i) =>
        formatter('weekday').format(new Date(A_SUNDAY + ((weekStartsOn + i) % 7) * DAY_MS)),
      ),
  };
};

export type Formatter = ReturnType<typeof createFormatter>;

/**
 * Date formatting in the language on screen. Re-renders the caller when the language
 * changes, because it reads `i18n.language` through `useTranslation`.
 */
export const useFormat = (): Formatter => {
  // Subscribes this component to language changes; currentLocale() reads the result.
  useTranslation();
  const locale = currentLocale();

  return useMemo(
    () =>
      createFormatter(
        formattingTag(locale),
        localeBundle(locale).dateLocale.options?.weekStartsOn ?? 0,
      ),
    [locale],
  );
};
