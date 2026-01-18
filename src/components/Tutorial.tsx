import { Calendar, Users, Share2, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TutorialProps {
  completedSteps?: number[];
}

export function Tutorial({ completedSteps = [] }: TutorialProps) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('tutorialHidden');
    if (hidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  const handleHide = () => {
    setIsHidden(true);
    localStorage.setItem('tutorialHidden', 'true');
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.removeItem('tutorialHidden');
  };

  if (isHidden) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleShow}
        className="w-full"
      >
        Show Tutorial
      </Button>
    );
  }

  const steps = [
    {
      icon: Calendar,
      number: 1,
      title: 'Create a Trip',
      description: 'Set your trip name and date range',
    },
    {
      icon: Share2,
      number: 2,
      title: 'Share the Link',
      description: 'Send the trip link to all participants',
    },
    {
      icon: Users,
      number: 3,
      title: 'Mark and Save Availability',
      description: 'Everyone selects their available dates',
    },
    {
      icon: Check,
      number: 4,
      title: 'Pick Best Dates',
      description: 'See when most people are free',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-foreground">
            How it works
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHide}
            className="text-xs"
          >
            Hide Tutorial
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
                    <h4 className={cn(
                      "font-medium text-sm transition-colors",
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {step.title}
                    </h4>
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
