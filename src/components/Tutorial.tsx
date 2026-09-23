import { Calendar, Users, Share2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TutorialProps {
  completedSteps?: number[];
  /**
   * Whose checklist this is. The default steps are the organiser's - create a trip, share
   * the link - and were being shown to people who arrived from someone else's link, where
   * two of the four steps are not their job and "Trip created" is permanently ticked.
   */
  audience?: 'organiser' | 'participant';
}

const HIDDEN_KEY = 'tutorialHidden';

/**
 * Storage access, guarded. Chrome's "block all site data" throws a SecurityError from the
 * `localStorage` getter itself, and an unguarded read here - inside an effect, with no
 * error boundary above it - unmounted the whole trip page. The preference is a nicety;
 * losing it must never cost the page.
 */
const storage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(HIDDEN_KEY);
    } catch {
      return null;
    }
  },
  set: (hidden: boolean): void => {
    try {
      if (hidden) localStorage.setItem(HIDDEN_KEY, 'true');
      else localStorage.removeItem(HIDDEN_KEY);
    } catch {
      // Not persisted; the in-memory state still applies for this visit.
    }
  },
};

export function Tutorial({ completedSteps = [], audience = 'organiser' }: TutorialProps) {
  const [isHidden, setIsHidden] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (storage.get() === 'true') {
      setIsHidden(true);
    }
  }, []);

  const handleHide = () => {
    setIsHidden(true);
    storage.set(true);
  };

  const handleShow = () => {
    setIsHidden(false);
    storage.set(false);
  };

  if (isHidden) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleShow}
        className="w-full"
      >
        {t('tutorial.show')}
      </Button>
    );
  }

  const organiserSteps = [
    {
      icon: Calendar,
      number: 1,
      title: t('tutorial.organiser.createTitle'),
      description: t('tutorial.organiser.createBody'),
    },
    {
      icon: Share2,
      number: 2,
      title: t('tutorial.organiser.shareTitle'),
      description: t('tutorial.organiser.shareBody'),
    },
    {
      icon: Users,
      number: 3,
      title: t('tutorial.organiser.markTitle'),
      description: t('tutorial.organiser.markBody'),
    },
    {
      icon: Check,
      number: 4,
      title: t('tutorial.organiser.pickTitle'),
      description: t('tutorial.organiser.pickBody'),
    },
  ];

  /**
   * What someone who was sent the link actually has to do. Sharing is not on the list,
   * and the last step is the payoff rather than a task, because they are not the one who
   * decides.
   */
  const participantSteps = [
    {
      icon: Calendar,
      number: 1,
      title: t('tutorial.participant.markTitle'),
      description: t('tutorial.participant.markBody'),
    },
    {
      icon: Check,
      number: 2,
      title: t('tutorial.participant.saveTitle'),
      description: t('tutorial.participant.saveBody'),
    },
    {
      icon: Users,
      number: 3,
      title: t('tutorial.participant.watchTitle'),
      description: t('tutorial.participant.watchBody'),
    },
  ];

  const steps = audience === 'participant' ? participantSteps : organiserSteps;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
      <CardContent className="p-6">
        {/* gap + a wrapping button: "Anleitung ausblenden" is twice "Hide Tutorial" and
            pushed a 320px screen 20px wide before the label was allowed to break. */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="shrink-0 text-lg font-display font-semibold text-foreground">
            {audience === 'participant' ? t('tutorial.participantHeading') : t('tutorial.organiserHeading')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHide}
            className="text-xs h-auto min-h-9 whitespace-normal text-right"
          >
            {t('tutorial.hide')}
          </Button>
        </div>
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.number);
            return (
              <div 
                key={step.number} 
                className={cn(
                  "flex gap-3 items-start transition-all duration-300",
                  isCompleted && "opacity-40"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  isCompleted 
                    ? "bg-muted text-muted-foreground" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isCompleted ? "text-muted-foreground" : "text-primary"
                    )} />
                    <h3 className={cn(
                      "font-sans font-medium text-sm transition-colors",
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
