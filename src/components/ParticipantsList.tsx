import { Participant } from '@/lib/tripStore';
import { User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantsListProps {
  participants: Participant[];
  currentUser?: string;
  selectedParticipants?: string[];
  onToggleParticipant?: (participantName: string) => void;
}

export function ParticipantsList({ 
  participants, 
  currentUser, 
  selectedParticipants = [], 
  onToggleParticipant 
}: ParticipantsListProps) {
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
      {participants.map(participant => {
        const isSelected = selectedParticipants.includes(participant.name);
        const isCurrentUser = currentUser?.toLowerCase() === participant.name.toLowerCase();
        
        return (
          <button
            key={participant.name}
            onClick={() => onToggleParticipant?.(participant.name)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              "hover:scale-[1.02] active:scale-[0.98]",
              onToggleParticipant && "cursor-pointer",
              !onToggleParticipant && "cursor-default",
              isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/10",
              !isSelected && isCurrentUser && "bg-success-light",
              !isSelected && !isCurrentUser && "bg-muted"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              isSelected && "bg-primary text-primary-foreground",
              !isSelected && isCurrentUser && "bg-success text-primary-foreground",
              !isSelected && !isCurrentUser && "bg-background"
            )}>
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">{participant.name}</div>
              <div className="text-xs text-muted-foreground">
                {participant.availableDates.length} day{participant.availableDates.length !== 1 ? 's' : ''} available
              </div>
            </div>
            {isSelected && (
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            {!isSelected && isCurrentUser && (
              <Check className="w-4 h-4 text-success" />
            )}
          </button>
        );
      })}
    </div>
  );
}
