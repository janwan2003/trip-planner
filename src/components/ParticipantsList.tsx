import { Participant } from '@/lib/tripStore';
import { User, Check, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ParticipantsListProps {
  participants: Participant[];
  currentUser?: string;
  selectedParticipants?: string[];
  onToggleParticipant?: (participantName: string) => void;
  /**
   * Take over a participant's answer and edit their days. Optional: the pencil is only
   * rendered when a caller can act on it, so a read-only list stays one button per row.
   */
  onEditParticipant?: (participantName: string) => void;
}

export function ParticipantsList({
  participants,
  currentUser,
  selectedParticipants = [],
  onToggleParticipant,
  onEditParticipant,
}: ParticipantsListProps) {
  const { t } = useTranslation();

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{t('participantsList.emptyTitle')}</p>
        <p className="text-xs">{t('participantsList.emptyBody')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map(participant => {
        const isSelected = selectedParticipants.includes(participant.name);
        const isCurrentUser = currentUser?.toLowerCase() === participant.name.toLowerCase();

        return (
          /*
            The row is a div, not a button: the pencil is a second, independent action and
            a button cannot be nested inside a button. The filter click stays on an inner
            button that fills the row, so the target is unchanged.
          */
          <div
            key={participant.name}
            className={cn(
              "w-full flex items-center gap-1 pr-2 rounded-lg transition-all",
              "hover:scale-[1.02] active:scale-[0.98]",
              isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/10",
              !isSelected && isCurrentUser && "bg-success-light",
              !isSelected && !isCurrentUser && "bg-muted"
            )}
          >
            <button
              onClick={() => onToggleParticipant?.(participant.name)}
              className={cn(
                "flex-1 min-w-0 flex items-center gap-3 pl-4 pr-2 py-3 rounded-lg text-left",
                onToggleParticipant ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div className={cn(
                "w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && isCurrentUser && "bg-success text-primary-foreground",
                !isSelected && !isCurrentUser && "bg-background"
              )}>
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{participant.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t('participantsList.daysAvailable', { count: participant.availableDates.length })}
                </div>
              </div>
              {isSelected && (
                <div className="w-4 h-4 shrink-0 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              {!isSelected && isCurrentUser && (
                <Check className="w-4 h-4 shrink-0 text-success" />
              )}
            </button>

            {onEditParticipant && (
              <button
                type="button"
                onClick={() => onEditParticipant(participant.name)}
                aria-label={t('common.editDates', { name: participant.name })}
                title={t('common.editDates', { name: participant.name })}
                className="shrink-0 h-11 w-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/60"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
