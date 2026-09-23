import { Link } from 'react-router-dom';
import { CreateTripForm } from '@/components/CreateTripForm';
import { Tutorial } from '@/components/Tutorial';
import { usePageMeta } from '@/lib/usePageMeta';
import { LanguageLinks } from '@/components/LanguageLinks';
import { useLocation } from 'react-router-dom';
import { RecentTrips } from '@/components/RecentTrips';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { FeedbackLinks } from '@/components/FeedbackLinks';

interface IndexProps {
  /** The head for a localised home (`/ja`); `/` reads its own from siteMeta. */
  meta?: { title: string; description: string };
  /** That language's landing page, listed first under "Learn". */
  landing?: { to: string; label: string };
}

const Index = ({ meta, landing }: IndexProps = {}) => {
  usePageMeta(useLocation().pathname, meta);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FeedbackLinks />

      {/* Header */}
      <header className="py-3 px-4">
        <div className="container max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <img src="/favicon.png" alt={t('common.logoAlt')} className="w-full h-full object-contain" />
          </div>
          <div className="h-8 flex items-center">
            <span className="font-display font-semibold text-xl sm:text-2xl select-none">
              WeGoWhen
            </span>
          </div>
          <LanguageSwitcher className="ml-auto" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/*
              Order is explicit because the visual order differs by width. On a phone the
              single column read tutorial-first, which put the headline, the form and the
              only CTA below the fold - four steps of instruction shown to someone who has
              not yet decided they want the product. Selling comes first there; the
              three-column desktop layout keeps the tutorial on the left.

              The DOM order is the phone order, so the h1 is the first heading in the
              document on every width. With the tutorial first in source, its "How it
              works" heading came before the h1, which Lighthouse flags as heading-order
              and which is what a crawler or a screen reader reads first.
            */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left mb-8">
                  <h1 className="text-4xl font-display font-bold text-foreground mb-3">
                    {t('home.title')}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t('home.subtitle')}
                  </p>
                </div>

                <CreateTripForm />

                <p className="mt-4 text-sm text-muted-foreground text-center lg:text-left">
                  {t('home.freeNote')}
                </p>

                {/* Renders nothing for a browser that has not opened a trip yet. */}
                <div className="mt-6">
                  <RecentTrips />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 order-2 lg:order-1">
              <Tutorial />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3">WeGoWhen</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.footer.tagline')}
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-medium mb-3">{t('home.footer.project')}</h4>
              <ul className="text-sm">
                <li>
                  <Link to="/about" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.about')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-medium mb-3">{t('home.footer.learn')}</h4>
              <ul className="text-sm">
                {landing && (
                  <li>
                    <Link to={landing.to} className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                      {landing.label}
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/faq" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.faq')}
                  </Link>
                </li>
                <li>
                  <Link to="/when2meet-alternative" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.when2meet')}
                  </Link>
                </li>
                <li>
                  <Link to="/doodle-alternative" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.doodle')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium mb-3">{t('home.footer.legal')}</h4>
              <ul className="text-sm">
                <li>
                  <Link to="/terms" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.terms')}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors">
                    {t('home.footer.privacy')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/40 pt-6 text-center" data-app-version="1.7.4">
            <p className="text-sm text-muted-foreground">
              {t('home.footer.closing')}
            </p>
            <div className="mt-4 flex justify-center text-sm text-muted-foreground">
              <LanguageLinks />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
