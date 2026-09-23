import { describe, expect, it } from 'vitest';

import { LOCALES, SUPPORTED_LOCALES } from './config';
import en from './locales/en';

/**
 * What the type system cannot see. `Messages` already makes a missing or misspelt key a
 * compile error; these check the contents of the strings.
 */

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ''): Record<string, string> =>
  Object.fromEntries(
    Object.entries(tree).flatMap(([key, value]) =>
      typeof value === 'string'
        ? [[`${prefix}${key}`, value]]
        : Object.entries(flatten(value, `${prefix}${key}.`)),
    ),
  );

const placeholders = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
const tags = (text: string) => [...text.matchAll(/<(\w+)>/g)].map((m) => m[1]).sort();

/** `a.b_one` and `a.b_other` are one message for these checks. */
const pluralBase = (key: string) => key.replace(/_(zero|one|two|few|many|other)$/, '');

const english = flatten(en.messages);

describe.each(SUPPORTED_LOCALES.filter((l) => l !== 'en'))('%s', (locale) => {
  const load = async () => flatten((await LOCALES[locale].load()).default.messages);

  it('fills every string - an empty one would render as blank UI', async () => {
    const messages = await load();
    const empty = Object.entries(messages).filter(([, text]) => text.trim() === '');
    expect(empty).toEqual([]);
  });

  it('keeps every {{placeholder}} the English string has', async () => {
    // A translation that drops {{name}} typechecks fine and then shows no name.
    const messages = await load();
    const englishByBase = new Map(Object.entries(english).map(([k, v]) => [pluralBase(k), v]));

    const mismatched = Object.entries(messages)
      .filter(([key, text]) => {
        const source = englishByBase.get(pluralBase(key));
        // Plural forms may leave {{count}} implicit ("a day" for one), nothing else.
        const wanted = placeholders(source ?? '').filter((p) => p !== 'count');
        const got = placeholders(text).filter((p) => p !== 'count');
        return JSON.stringify(wanted) !== JSON.stringify(got);
      })
      .map(([key]) => key);

    expect(mismatched).toEqual([]);
  });

  it('keeps every <tag> the English string has, so Trans can place the element', async () => {
    const messages = await load();
    const mismatched = Object.entries(messages)
      .filter(([key, text]) => JSON.stringify(tags(english[key] ?? '')) !== JSON.stringify(tags(text)))
      .map(([key]) => key);

    expect(mismatched).toEqual([]);
  });

  it('carries a first-day-of-week for the calendar grid', async () => {
    const { dateLocale } = (await LOCALES[locale].load()).default;
    expect(dateLocale.options?.weekStartsOn).toBeTypeOf('number');
  });
});
