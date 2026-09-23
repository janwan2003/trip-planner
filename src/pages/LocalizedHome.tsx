import { useParams } from 'react-router-dom';

import { LocaleRoute } from '@/components/LocaleRoute';
import { isLocale } from '@/i18n';
import { landingPath, seoFor } from '@/content/seo';
import Index from './Index';
import NotFound from './NotFound';

/**
 * `/de`, `/ja` and the rest: the same home page as `/`, in that language, with the head
 * written for that market (see `src/content/seo`). Any other single-segment path that
 * reached this route is not a page, and says so.
 */
export default function LocalizedHome() {
  const { lang } = useParams<{ lang: string }>();
  const seo = lang ? seoFor(lang) : undefined;
  if (!seo || !isLocale(lang)) return <NotFound />;

  return (
    <LocaleRoute locale={seo.locale}>
      <Index
        meta={{ title: seo.home.title, description: seo.home.description }}
        landing={{ to: landingPath(seo), label: seo.landing.linkLabel }}
      />
    </LocaleRoute>
  );
}
