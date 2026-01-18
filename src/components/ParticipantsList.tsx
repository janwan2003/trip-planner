import { Participant } from '@/lib/tripStore';
import { User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantsListProps {
  participants: Participant[];
  currentUser?: string;
}

export function ParticipantsList({ participants, currentUser }: ParticipantsListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No one has responded yet</p>
        <p className="text-xs">Be the first to mark your availability!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map(participant => (
        <div
          key={participant.name}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            currentUser?.toLowerCase() === participant.name.toLowerCase()
              ? "bg-success-light"
              : "bg-muted"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            currentUser?.toLowerCase() === participant.name.toLowerCase()
              ? "bg-success text-primary-foreground"
              : "bg-background"
          )}>
            {participant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{participant.name}</div>
            <div className="text-xs text-muted-foreground">
              {participant.availableDates.length} day{participant.availableDates.length !== 1 ? 's' : ''} available
            </div>
          </div>
          {currentUser?.toLowerCase() === participant.name.toLowerCase() && (
            <Check className="w-4 h-4 text-success" />
          )}
        </div>
      ))}
    </div>
  );
}
