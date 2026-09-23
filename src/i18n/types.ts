import type { Locale as DateFnsLocale } from 'date-fns';

import type en from './locales/en';

type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * The plural forms a language may add beyond English's `_one` / `_other`.
 *
 * English, German, Dutch and Spanish all get by with those two, but Russian, Polish
 * and Arabic need `_few`, `_many` and friends. Without this, adding Russian would mean
 * loosening the whole type rather than just letting it carry its extra forms.
 */
type ExtraPluralForms<T> = {
  [K in keyof T as K extends `${infer Base}_other`
    ? `${Base}_${Exclude<PluralCategory, 'one' | 'other'>}`
    : never]?: string;
};

/** Same shape as the English messages, every leaf a string. */
type Translation<T> = {
  [K in keyof T]: T[K] extends string ? string : Translation<T[K]>;
} & ExtraPluralForms<T>;

/**
 * What every locale file must provide. Derived from English, so a missing key, a
 * misspelt key or a key English no longer has is a type error in that locale's file.
 */
export type Messages = Translation<typeof en.messages>;

export interface LocaleBundle {
  messages: Messages;
  /** Month and weekday names for the date picker, and the first day of the week. */
  dateLocale: DateFnsLocale;
}
