import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ComparisonTable, Section } from '@/components/MarketingPage';
import { QuestionAnswer } from '@/components/QuestionAnswer';
import { LanguageLinks } from '@/components/LanguageLinks';
import { LocaleRoute } from '@/components/LocaleRoute';
import { homePath, landingPath, seoFor } from '@/content/seo';
import { usePageMeta } from '@/lib/usePageMeta';
import NotFound from './NotFound';

/**
 * One market's landing page - `/fr/alternative-framadate`, `/ja/nittei-chousei` - rendered
 * from its content file in `src/content/seo`.
 *
 * The words are data and the chrome comes from the UI strings, so this file holds no copy
 * of its own: a new market is a new content file, not a new component. Everything is in
 * the served bytes and nothing is for crawlers only.
 */
export default function LocalizedLanding() {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const seo = lang ? seoFor(lang) : undefined;
  const page = seo?.landing.slug === slug ? seo?.landing : undefined;

  if (!seo || !page) return <NotFound />;

  return (
    <LocaleRoute locale={seo.locale}>
      <LandingBody seo={seo} />
    </LocaleRoute>
  );
}

function LandingBody({ seo }: { seo: NonNullable<ReturnType<typeof seoFor>> }) {
  const { t } = useTranslation();
  const page = seo.landing;
  const home = homePath(seo.locale);
  usePageMeta(landingPath(seo), { title: page.title, description: page.description });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-3 px-4 border-b border-border/40">
        <div className="container max-w-4xl mx-auto">
          <Link to={home} className="inline-flex items-center gap-3">
            <img src="/favicon.png" alt={t('common.logoAlt')} className="w-10 h-10 object-contain" />
            <span className="font-display font-semibold text-xl">WeGoWhen</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <article className="container max-w-3xl mx-auto">
          <h1 className="text-4xl font-display font-bold mb-4">{page.heading}</h1>
          <p className="text-lg text-muted-foreground mb-10">{page.standfirst}</p>

          <div className="space-y-10">
            {page.sections.map((section) => (
              <Section key={section.heading} heading={section.heading}>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Section>
            ))}

            {page.comparison && (
              <section>
                <ComparisonTable competitor={page.comparison.competitor} rows={page.comparison.rows} />
                <p className="mt-3 text-sm text-muted-foreground">{page.comparison.checked}</p>
              </section>
            )}

            <section className="space-y-6">
              {page.questions.map((qa) => (
                <QuestionAnswer key={qa.question} question={qa.question}>
                  <p>{qa.answer}</p>
                </QuestionAnswer>
              ))}
            </section>
          </div>

          <div className="mt-14 rounded-xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-lg font-display font-semibold mb-1">{t('landing.ctaTitle')}</p>
            <p className="text-sm text-muted-foreground mb-5">{t('landing.ctaBody')}</p>
            <Button asChild size="lg">
              <Link to={home}>
                {t('landing.ctaButton')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </article>
      </main>

      <footer className="border-t border-border/40 bg-muted/30 py-8 px-4">
        <div className="container max-w-3xl mx-auto space-y-3 text-sm text-muted-foreground">
          <Link to={home} className="inline-flex min-h-11 items-center hover:text-foreground">
            {t('landing.home')}
          </Link>
          <LanguageLinks />
        </div>
      </footer>
    </div>
  );
}
