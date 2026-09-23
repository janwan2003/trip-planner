import { ReactNode, useEffect } from 'react';

import { currentLocale, setLocale, type Locale } from '@/i18n';

/**
 * Pins a route to the language in its URL.
 *
 * On first load nothing happens here: `main.tsx` and the prerenderer both set the
 * language before rendering, so the markup and the hydration agree. This only matters
 * for navigation inside the app - following the footer from `/fr` to `/ja` - where the
 * new page renders once in the old language and switches as its chunk arrives. The
 * choice is not persisted: visiting a page is not the same as asking for a language.
 */
export function LocaleRoute({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    if (currentLocale() !== locale) void setLocale(locale);
  }, [locale]);

  return <>{children}</>;
}
