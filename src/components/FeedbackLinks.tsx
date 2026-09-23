import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FeedbackKind,
  MAX_FEEDBACK_CONTACT,
  MAX_FEEDBACK_MESSAGE,
  sendFeedback,
} from '@/lib/feedback';

const FeedbackPopover = ({ kind, icon: Icon }: { kind: FeedbackKind; icon: typeof Bug }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { t } = useTranslation();
  const label = t(`feedback.${kind}.label`);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // A sent form starts fresh next time; an unsent draft is kept.
    if (!next && status === 'sent') {
      setMessage('');
      setContact('');
      setStatus('idle');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      await sendFeedback({
        kind,
        message: message.trim(),
        contact: contact.trim() || undefined,
        page: window.location.pathname,
      });
      setStatus('sent');
    } catch (cause) {
      // The form already refuses what the API would, so what is left is the network;
      // the server's own wording is English and stays in the console.
      console.error('Could not send feedback:', cause);
      setStatus('error');
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-2 hover:text-foreground transition-colors">
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        {label}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        {status === 'sent' ? (
          <p className="text-sm" role="status">
            {t('feedback.thanks')}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm">{t(`feedback.${kind}.intro`)}</p>
            <Textarea
              aria-label={label}
              placeholder={t(`feedback.${kind}.placeholder`)}
              value={message}
              maxLength={MAX_FEEDBACK_MESSAGE}
              onChange={(e) => setMessage(e.target.value)}
              required
              autoFocus
            />
            <Input
              aria-label={t('feedback.emailLabel')}
              placeholder={t('feedback.emailPlaceholder')}
              type="email"
              value={contact}
              maxLength={MAX_FEEDBACK_CONTACT}
              onChange={(e) => setContact(e.target.value)}
            />
            {status === 'error' && (
              <p className="text-sm text-destructive" role="alert">
                {t('feedback.failed')}
              </p>
            )}
            <Button type="submit" size="sm" className="w-full" disabled={status === 'sending' || !message.trim()}>
              {status === 'sending' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('feedback.send')}
            </Button>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
};

/**
 * The two small links at the very top of the home and trip pages. A slim strip of its
 * own rather than buttons in the header, because the trip header is already as wide as
 * a 320px phone allows.
 */
export const FeedbackLinks = () => (
  // data-nosnippet: "Report a bug" is never what a searcher wants quoted in a result.
  <div data-nosnippet className="px-4 pt-1">
    <div className="container max-w-6xl mx-auto flex justify-end gap-1 text-xs text-muted-foreground">
      <FeedbackPopover kind="bug" icon={Bug} />
      <FeedbackPopover kind="feature" icon={Lightbulb} />
    </div>
  </div>
);
