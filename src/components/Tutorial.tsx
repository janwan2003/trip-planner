import { Calendar, Users, Share2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TutorialProps {
  completedSteps?: number[];
}

export function Tutorial({ completedSteps = [] }: TutorialProps) {
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
      title: 'Mark Availability',
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
        <h3 className="text-lg font-display font-semibold mb-4 text-foreground">
          How it works
        </h3>
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.number);
            return (
              <div 
                key={step.number} 
                className={cn(
                  "flex gap-3 items-start transition-opacity",
                  isCompleted && "opacity-40"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  isCompleted 
                    ? "bg-muted text-muted-foreground" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isCompleted ? "text-muted-foreground" : "text-primary"
                    )} />
                    <h4 className={cn(
                      "font-medium text-sm",
                      isCompleted ? "text-muted-foreground" : "text-foreground"
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
