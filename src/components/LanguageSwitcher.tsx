import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import { LOCALES, SUPPORTED_LOCALES, currentLocale, isLocale, setLocale } from '@/i18n';

/** `/` and `/xx`: the home page in each language, which has a URL per language. */
const HOME_PATHS = new Set(SUPPORTED_LOCALES.map((code) => (code === 'en' ? '/' : `/${code}`)));

/**
 * A native `<select>` laid invisibly over a globe and the two-letter code.
 *
 * Native, because it is the one picker that is right on every phone - the OS sheet,
 * large targets, screen-reader support for free. Invisible over a compact face, because
 * the trip page header already had to drop a word to fit 320px (see the Share button in
 * TripPage), and "Nederlands" would not fit beside it.
 *
 * Most people never touch this: the language is picked from the browser on first
 * visit. It exists for the Dutch speaker on an English laptop, and a choice made here
 * is remembered in this browser.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div
      // Google leaves data-nosnippet content out of result snippets; a list of
      // language names is never what a searcher wants to read there.
      data-nosnippet
      className={cn(
        'relative inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground',
        'hover:text-foreground focus-within:ring-2 focus-within:ring-ring',
        className,
      )}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span aria-hidden="true" className="font-medium uppercase">
        {locale}
      </span>
      <select
        aria-label={t('common.language')}
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          if (!isLocale(next)) return;
          // On a home page the language has its own URL, so switching goes there: the
          // address bar, a shared link and a reload then all agree with the screen.
          if (HOME_PATHS.has(pathname)) navigate(next === 'en' ? '/' : `/${next}`);
          void setLocale(next, { persist: true });
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {Object.entries(LOCALES).map(([code, { label }]) => (
          <option key={code} value={code} lang={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
