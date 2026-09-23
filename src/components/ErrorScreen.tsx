import { useTranslation } from 'react-i18next';

/**
 * What ErrorBoundary renders once something failed. A separate function component,
 * because a class cannot call useTranslation.
 */
export const ErrorScreen = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-display font-semibold mb-2">{t('errorBoundary.title')}</h1>
        <p className="text-muted-foreground mb-4">{t('errorBoundary.body')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('errorBoundary.reload')}
        </button>
      </div>
    </div>
  );
};
