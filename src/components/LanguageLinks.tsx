import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LOCALES, SUPPORTED_LOCALES } from '@/i18n';

/**
 * Plain links to the home page in every language, each named in its own language.
 *
 * The switcher is a `<select>`, which no crawler follows. These are what let a search
 * engine or an answer engine walk from `/` to `/ja` without reading hreflang, and what
 * let a person who cannot read the current language find theirs.
 */
export function LanguageLinks() {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('home.footer.languages')} className="flex flex-wrap gap-x-4 gap-y-1">
      {SUPPORTED_LOCALES.map((code) => (
        <Link
          key={code}
          to={code === 'en' ? '/' : `/${code}`}
          lang={code}
          hrefLang={code}
          className="inline-flex min-h-11 items-center hover:text-foreground transition-colors"
        >
          {LOCALES[code].label}
        </Link>
      ))}
    </nav>
  );
}
