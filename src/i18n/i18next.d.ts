import 'i18next';

import type en from './locales/en';

/**
 * Types every `t('...')` call against the English messages: a key that does not exist
 * is a compile error at the call site, and the editor autocompletes the rest.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: (typeof en)['messages'] };
  }
}
