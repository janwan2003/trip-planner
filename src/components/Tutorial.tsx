import { Calendar, Users, Share2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Tutorial() {
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
            return (
              <div key={step.number} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <h4 className="font-medium text-sm text-foreground">
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
