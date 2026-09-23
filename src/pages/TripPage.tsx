import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecentTrips, rememberTrip } from '@/lib/recentTrips';
import { forgetName, lastUsedName, MAX_NAME_LENGTH, recalledName, rememberName } from '@/lib/identity';
import { Trip, TripApiError, getTrip, addParticipant, updateParticipantName, removeParticipant, getAvailabilityCount, getDatesBetween } from '@/lib/tripStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { ParticipantsList } from '@/components/ParticipantsList';
import { BestDates } from '@/components/BestDates';
import { Tutorial } from '@/components/Tutorial';
import { FeedbackLinks } from '@/components/FeedbackLinks';
import { Copy, Check, ArrowLeft, Calendar, Users, Loader2, Pencil, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/lib/usePageMeta';
import { Trans, useTranslation } from 'react-i18next';
import { useFormat } from '@/i18n/format';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/**
 * The name in the greeting, as the button that renames it. Trans places the translated
 * name inside as `children`; the pencil follows it wherever the language puts the name.
 */
const NameButton = ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
  >
    {children}
    <Pencil className="w-3 h-3" />
  </button>
);

/** Stable props for the read-only group calendar, so its memo holds during a drag. */
const NO_DATES: string[] = [];
const noop = () => {};

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Whether two date lists hold the same days, whatever their order. */
const sameDays = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((date) => set.has(date));
};

/** What a confirmation about discarding unsaved marks is for. */
type PendingLeave = { kind: 'switch'; name: string } | { kind: 'back' };

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasSavedAvailability, setHasSavedAvailability] = useState(false);
  const [hasSharedLink, setHasSharedLink] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trips carry no access control beyond possession of the link, so they must not turn
  // up in a search result. `noindex` comes from the `/trip` entry in siteMeta.
  usePageMeta('/trip', trip ? { title: `${trip.name} | WeGoWhen` } : {});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  /**
   * A participant whose dates were asked for from the list while the current answer has
   * unsaved marks. Held here rather than switched straight away, so the confirmation
   * below decides whether those marks are discarded.
   */
  const [pendingLeave, setPendingLeave] = useState<PendingLeave | null>(null);
  /**
   * The `updated_at` of the answer being edited, as this page read it: a string for a
   * row on the server, `null` for a name nobody has saved yet, `undefined` when unknown.
   * Sent with every save so a save made from a stale read is refused rather than
   * overwriting a newer answer - for instance when this phone opened Bob's dates with
   * the pencil and Bob then changed them from his own.
   */
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null | undefined>(undefined);
  const editorRef = useRef<HTMLDivElement>(null);
  /**
   * Whether this browser created the trip. Read once on mount rather than on every
   * render, because opening the trip is itself what writes the row.
   */
  const [isOrganiser] = useState(
    () => getRecentTrips().find((entry) => entry.id === tripId)?.role === 'creator',
  );
  const { toast } = useToast();
  const { t } = useTranslation();
  const f = useFormat();

  /**
   * Re-attaches this browser to the participant it answered as last time.
   *
   * The recalled name is only a hint: it is matched against the participants the API
   * just returned, and an auto-rejoin happens only on a hit. If the name is not there -
   * someone withdrew it, or the trip was recreated - it becomes a prefill instead, so
   * nobody is silently re-added to a group they left. A name from a *different* trip is
   * never enough to auto-join; it only fills the field.
   */
  const restoreIdentity = useCallback((loaded: Trip) => {
    const remembered = recalledName(loaded.id);
    const mine = remembered
      ? loaded.participants.find((p) => p.name.toLowerCase() === remembered.toLowerCase())
      : undefined;

    if (mine) {
      setUserName(mine.name);
      setBaseUpdatedAt(mine.updated_at);
      setSelectedDates(mine.availableDates);
      setSavedDates(mine.availableDates);
      setHasSavedAvailability(mine.availableDates.length > 0);
      setHasJoined(true);
      return;
    }

    const guess = remembered ?? lastUsedName();
    if (guess) setUserName(guess);
  }, []);

  useEffect(() => {
    const loadTrip = async () => {
      if (!tripId) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const loaded = await getTrip(tripId);
        setTrip(loaded);
        // Opening a trip is what puts it in this browser's list, so a link someone was
        // sent is recoverable too, and a renamed trip updates the row.
        if (loaded) {
          rememberTrip(loaded);
          restoreIdentity(loaded);
        }
      } catch (error) {
        // getTrip returns null only for a trip that does not exist, and throws for
        // anything else. Telling someone their trip "does not exist" because the
        // network hiccuped would be a lie they cannot recover from.
        console.error('Error loading trip:', error);
        setLoadError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadTrip();
    // restoreIdentity is stable (useCallback with no deps); it is listed so the reload
    // path cannot silently stop restoring if it ever gains one.
  }, [tripId, restoreIdentity]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Trimmed before matching: a phone keyboard's autocomplete leaves a trailing space,
    // and "Anna " used to miss "Anna", load an empty calendar, and then - because the
    // API trims - save straight over her real answer.
    const name = userName.trim();
    if (!name) return;

    const existingParticipant = trip?.participants.find((p) => sameName(p.name, name));

    if (existingParticipant) {
      // Adopt the stored spelling, so the greeting, the list highlight and the filter
      // all agree on who this is.
      setUserName(existingParticipant.name);
      setBaseUpdatedAt(existingParticipant.updated_at);
      setSelectedDates(existingParticipant.availableDates);
      setSavedDates(existingParticipant.availableDates);
      setHasSavedAvailability(existingParticipant.availableDates.length > 0);
    } else {
      setUserName(name);
      setBaseUpdatedAt(null);
    }

    if (tripId) rememberName(tripId, existingParticipant?.name ?? name);
    setHasJoined(true);
  };

  const handleToggleDate = useCallback((date: string) => {
    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  }, []);

  const handleSave = async () => {
    if (!trip || !userName) return;

    setIsSaving(true);

    try {
      const updatedTrip = await addParticipant(
        trip.id,
        { name: userName, availableDates: selectedDates },
        baseUpdatedAt,
      );

      if (updatedTrip) {
        setTrip(updatedTrip);
        setSavedDates(selectedDates);
        setBaseUpdatedAt(
          updatedTrip.participants.find((p) => sameName(p.name, userName))?.updated_at,
        );
        setHasSavedAvailability(true);
        toast({
          title: t('trip.toast.savedTitle'),
          description: t('trip.toast.savedBody'),
        });
      }
    } catch (error) {
      if (error instanceof TripApiError && error.status === 409 && error.trip) {
        // Someone changed this answer since it was loaded. Show what is saved now, keep
        // the marks on screen, and let a second save replace it knowingly.
        const current = error.trip.participants.find((p) => sameName(p.name, userName));
        setTrip(error.trip);
        setSavedDates(current?.availableDates ?? []);
        setBaseUpdatedAt(current ? current.updated_at : null);
        toast({
          title: t('trip.toast.conflictTitle'),
          description: t('trip.toast.conflictBody', { name: userName }),
          variant: "destructive",
        });
        return;
      }
      console.error('Error saving availability:', error);
      toast({
        title: t('trip.toast.saveErrorTitle'),
        description: t('common.genericError'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // In-app browsers (Instagram, Messenger) and denied permissions reject the
      // clipboard. The share sheet is the next best thing; failing that, say so rather
      // than leaving an unhandled rejection and a button that seems to do nothing.
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ url });
          setHasSharedLink(true);
        } catch {
          // Dismissed the sheet: nothing to report.
        }
        return;
      }
      toast({
        title: t('trip.toast.copyFailedTitle'),
        description: t('trip.toast.copyFailedBody'),
        variant: "destructive",
      });
      return;
    }
    setCopied(true);
    setHasSharedLink(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: t('trip.toast.linkCopiedTitle'),
      description: t('trip.toast.linkCopiedBody'),
    });
  };

  const handleEditName = () => {
    setEditedName(userName);
    setIsEditingName(true);
  };

  const handleSaveNewName = async () => {
    if (!trip || !editedName.trim() || editedName.trim() === userName) {
      setIsEditingName(false);
      return;
    }

    const newName = editedName.trim();

    // Check if name already exists
    const nameExists = trip.participants.some(
      p => p.name.toLowerCase() === editedName.trim().toLowerCase() && 
           p.name.toLowerCase() !== userName.toLowerCase()
    );

    if (nameExists) {
      toast({
        title: t('trip.toast.nameTakenTitle'),
        description: t('trip.toast.nameTakenBody'),
        variant: "destructive",
      });
      return;
    }

    // Joining writes nothing to the server - the first save does - so before that there
    // is no row to rename, and the PATCH answered 404 "Error updating name" every time.
    if (!trip.participants.some((p) => sameName(p.name, userName))) {
      setUserName(newName);
      rememberName(trip.id, newName);
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatedTrip = await updateParticipantName(trip.id, userName, newName);
      // Recall the name that now exists on the trip; the old one no longer matches.
      rememberName(trip.id, newName);
      if (updatedTrip) {
        setTrip(updatedTrip);
        // A filter that named the old spelling follows the person to the new one.
        setSelectedParticipants((prev) => prev.map((n) => (sameName(n, userName) ? newName : n)));
        setBaseUpdatedAt(updatedTrip.participants.find((p) => sameName(p.name, newName))?.updated_at);
        setUserName(newName);
        toast({
          title: t('trip.toast.renamedTitle'),
          description: t('trip.toast.renamedBody', { name: newName }),
        });
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: t('trip.toast.renameErrorTitle'),
        description: t('common.genericError'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsEditingName(false);
    }
  };

  const handleWithdraw = async () => {
    if (!trip || !userName) return;

    // Confirmation is the AlertDialog wrapping the trigger, not window.confirm. The
    // native dialog renders as an unstyled system sheet on a phone, on the only
    // irreversible action in the product.
    setIsSaving(true);
    try {
      const updatedTrip = await removeParticipant(trip.id, userName);
      if (updatedTrip) {
        setTrip(updatedTrip);
        // Otherwise the next visit would auto-rejoin them to the trip they just left.
        forgetName(trip.id);
        setHasJoined(false);
        setUserName('');
        setSelectedDates([]);
        setSavedDates([]);
        setHasSavedAvailability(false);
        toast({
          title: t('trip.toast.withdrawnTitle'),
          description: t('trip.toast.withdrawnBody'),
        });
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast({
        title: t('trip.toast.withdrawErrorTitle'),
        description: t('common.genericError'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleParticipant = (participantName: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantName)
        ? prev.filter(name => name !== participantName)
        : [...prev, participantName]
    );
  };

  /**
   * Editing someone from the participants list is the same act as typing their name into
   * the join form: it adopts that identity, loads their saved days and saves through the
   * same path. It exists because one phone often answers for a friend who never opens
   * the link, and retyping the name exactly was the only way back into that answer.
   */
  const switchToParticipant = (participantName: string) => {
    const participant = trip?.participants.find((p) => p.name === participantName);
    if (!participant) return;

    setUserName(participant.name);
    setBaseUpdatedAt(participant.updated_at);
    setSelectedDates(participant.availableDates);
    setSavedDates(participant.availableDates);
    setHasSavedAvailability(participant.availableDates.length > 0);
    setHasJoined(true);
    setIsEditingName(false);
    // Remember them the way handleJoin does, so a reload comes back to this answer.
    if (tripId) rememberName(tripId, participant.name);
    scrollToEditor();
  };

  // The list sits in the sidebar, which is below the calendar on a phone: without this
  // the pencil would appear to do nothing. jsdom has no scrollIntoView, hence the `?.`.
  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const handleEditParticipant = (participantName: string) => {
    // A save or withdrawal in flight belongs to the current identity; switching now
    // would let its response land on the next person's editor.
    if (isSaving) return;

    if (hasJoined && sameName(userName, participantName)) {
      // Already answering as them; reloading their saved days would throw away marks
      // they have not saved yet.
      scrollToEditor();
      return;
    }

    if (hasJoined && hasUnsavedChanges) {
      setPendingLeave({ kind: 'switch', name: participantName });
      return;
    }

    switchToParticipant(participantName);
  };

  /** Leaves the editor for the read-only trip view. */
  const leaveEditor = () => {
    setHasJoined(false);
    setUserName('');
    setBaseUpdatedAt(undefined);
    setSelectedDates([]);
    setSavedDates([]);
    setHasSavedAvailability(false);
  };

  const handleBack = () => {
    // Same rule as switching and closing the tab: unsaved marks are not lost silently.
    if (hasUnsavedChanges) {
      setPendingLeave({ kind: 'back' });
      return;
    }
    leaveEditor();
  };

  // Computed once per render rather than by five separate calls that each sorted both lists.
  const hasUnsavedChanges = useMemo(
    () => !sameDays(selectedDates, savedDates),
    [selectedDates, savedDates],
  );

  const isSaveDisabled = isSaving || !hasUnsavedChanges;

  /**
   * The participant filter holds names, and a rename or a withdrawal can leave one behind
   * that no longer exists; it then counted toward every ratio and could never be
   * satisfied. Only names still on the trip take part.
   */
  const activeFilter = useMemo(
    () =>
      trip
        ? selectedParticipants.filter((n) => trip.participants.some((p) => p.name === n))
        : [],
    [trip, selectedParticipants],
  );

  // Memoised on the trip, so a drag - which changes only the selection - does not
  // recount the whole heat map on every cell it crosses.
  const availability = useMemo(() => (trip ? getAvailabilityCount(trip) : {}), [trip]);

  /**
   * A refresh or a closed tab used to discard marked-but-unsaved days silently. The
   * participant's whole interaction is a minute of tapping, so losing it without a word
   * is the worst possible outcome for the persona the product is built around.
   */
  const unsavedDays = hasJoined && hasUnsavedChanges;

  useEffect(() => {
    if (!unsavedDays) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Browsers ignore custom text and show their own wording; returnValue is what
      // actually triggers the prompt.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsavedDays]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('trip.loading')}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-display font-semibold mb-2">{t('trip.loadErrorTitle')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('trip.loadErrorBody')}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>{t('trip.tryAgain')}</Button>
            <Button variant="outline" asChild>
              <Link to="/">{t('trip.createNew')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-2">{t('trip.notFoundTitle')}</h2>
          <p className="text-muted-foreground mb-4">{t('trip.notFoundBody')}</p>
          <Button asChild>
            <Link to="/">{t('trip.createNew')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FeedbackLinks />

      {/* Header */}
      <header className="py-3 px-4 border-b">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
              <img src="/favicon.png" alt={t('common.logoAlt')} className="w-full h-full object-contain" />
            </div>
            {/* The logo still names the link below 360px; see the Share button note. */}
            <div className="h-8 flex items-center max-[359px]:hidden">
              <span className="font-display font-semibold text-xl sm:text-2xl select-none">
                WeGoWhen
              </span>
            </div>
          </Link>
          
          {/*
            The full "Share Link" label made this button 126px wide, which held the
            header wider than a 320px viewport and gave the whole page 66px of
            horizontal overflow. The word "Link" carries nothing the icon does not, so
            it is dropped on the narrowest screens rather than wrapping the header.

            Translation made the short label longer again - Spanish "Compartir" put the
            page 28px over at 320px. Below 360px the wordmark goes instead, because the
            logo beside it already says whose site this is and the button's label is
            the only thing saying what it does.
          */}
          <Button variant="outline" onClick={handleCopyLink} className="gap-2 shrink-0">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (
              t('trip.copied')
            ) : (
              <>
                <span className="sm:hidden">{t('trip.share')}</span>
                <span className="hidden sm:inline">{t('trip.shareLink')}</span>
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="mb-8 animate-fade-in">
          {hasJoined && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('trip.back')}
            </button>
          )}
          <h1 className="text-3xl font-display font-bold mb-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {f.dateRange(trip.startDate, trip.endDate, 'dayMonthYear')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {t('trip.participantCount', { count: trip.participants.length })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/*
            Card order here is reading order. The page answers one question, so the answer
            comes before the heat map that supports it, and before the tutorial explaining
            a flow the reader is already inside. This is DOM order, not `order-*`: the
            latter moves pixels only and would leave tab and screen-reader sequence stale.
          */}
          {/* Main Calendar Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scroll target for the pencils in the participants list */}
            <div ref={editorRef} className="scroll-mt-4">
            {!hasJoined ? (
              <Card className="animate-scale-in shadow-warm border-0">
                <CardHeader>
                  <CardTitle className="font-display">{t('trip.join.title')}</CardTitle>
                  {/*
                    A cold arrival has been sent a link by a friend and is being asked for
                    a name by a site they have never seen. Say what the name is for and
                    that it is not an account, or the ask reads like a signup wall.
                  */}
                  <p className="text-sm text-muted-foreground">
                    {t('trip.join.body')}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">{t('trip.join.nameLabel')}</Label>
                      <Input
                        id="userName"
                        placeholder={t('trip.join.namePlaceholder')}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="h-11"
                        maxLength={MAX_NAME_LENGTH}
                        required
                      />
                    </div>
                    {/* "Continue" named no destination on the one screen where the
                        visitor does not yet know what the product does. */}
                    <Button type="submit" className="w-full">
                      {t('trip.join.submit')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="animate-scale-in shadow-warm border-0">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="font-display">{t('trip.mark.title')}</CardTitle>
                      {isEditingName ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            maxLength={MAX_NAME_LENGTH}
                            className="h-8 text-sm w-40"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNewName();
                              if (e.key === 'Escape') setIsEditingName(false);
                            }}
                          />
                          <Button size="sm" variant="ghost" onClick={handleSaveNewName} disabled={isSaving}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          <Trans
                            i18nKey="trip.mark.greeting"
                            values={{ name: userName }}
                            components={{
                              name: <NameButton onClick={handleEditName} />,
                            }}
                          />
                        </p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t('trip.withdraw.label')}
                          className="min-h-11 min-w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title={t('trip.withdraw.label')}
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('trip.withdraw.confirmTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('trip.withdraw.confirmBody', { trip: trip.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('trip.withdraw.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleWithdraw}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('trip.withdraw.confirm')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDates(getDatesBetween(trip.startDate, trip.endDate))}
                    >
                      {t('trip.mark.selectAll')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDates([])}
                    >
                      {t('trip.mark.clearAll')}
                    </Button>
                  </div>
                  
                  <AvailabilityCalendar
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    selectedDates={selectedDates}
                    onToggleDate={handleToggleDate}
                    availability={availability}
                    totalParticipants={trip.participants.length}
                  />
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-success-light border-2 border-success" />
                      <span>{t('trip.mark.legendAvailable')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted" />
                      <span>{t('trip.mark.legendNotSelected')}</span>
                    </div>
                  </div>
                  
                  {/* Floating Save Button */}
                  <div className="sticky bottom-4 mt-6 z-10">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaveDisabled}
                      size="lg"
                      variant={hasUnsavedChanges ? "default" : "secondary"}
                      className={`w-full px-8 font-semibold transition-all ${
                        hasUnsavedChanges 
                          ? 'shadow-2xl hover:shadow-xl' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('trip.mark.saving')}
                        </>
                      ) : hasUnsavedChanges ? (
                        t('trip.mark.save')
                      ) : (
                        t('trip.mark.noChanges')
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>

            {/* Best Dates: the answer, above the heat map that explains it */}
            <Card className="shadow-soft animate-fade-in">
              <CardContent className="pt-6">
                <BestDates trip={trip} selectedParticipants={activeFilter} />
              </CardContent>
            </Card>

            {/* Group Availability View */}
            {trip.participants.length > 0 && (
              <Card className="shadow-soft animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-display">{t('trip.group.title')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {activeFilter.length === 0
                      ? t('trip.group.showingAll')
                      : t('trip.group.filteredTo', { names: activeFilter.join(', ') })}
                  </p>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    selectedDates={NO_DATES}
                    onToggleDate={noop}
                    readOnly
                    availability={availability}
                    totalParticipants={trip.participants.length}
                    selectedParticipants={activeFilter}
                    participants={trip.participants}
                  />
                  
                  <div className="mt-4">
                    {/* Dynamic gradient legend */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-muted to-primary" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('trip.group.noOne')}</span>
                      <span>{t('trip.group.everyone')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle className="font-display text-lg">{t('trip.participants.title')}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('trip.participants.hint')}
                </p>
              </CardHeader>
              <CardContent>
                <ParticipantsList
                  participants={trip.participants}
                  currentUser={hasJoined ? userName : undefined}
                  selectedParticipants={activeFilter}
                  onToggleParticipant={handleToggleParticipant}
                  onEditParticipant={handleEditParticipant}
                />
              </CardContent>
            </Card>

            {/* Tutorial last: it teaches the flow, it is not the flow */}
            {isOrganiser ? (
              <Tutorial
                completedSteps={[
                  1, // Trip created
                  ...(hasSharedLink || trip.participants.length > 1 ? [2] : []), // Link shared
                  ...(hasSavedAvailability ? [3] : []), // Availability saved
                  ...(trip.participants.length > 1 ? [4] : []), // Best dates available
                ]}
              />
            ) : (
              <Tutorial
                audience="participant"
                completedSteps={hasSavedAvailability ? [1, 2] : []}
              />
            )}
          </div>
        </div>
      </main>

      {/*
        Below the page rather than in the header, which already drops a word from the
        Share button to fit 320px. The language is picked from the browser on arrival,
        so this is the override, not the way in.
      */}
      <footer className="container max-w-6xl mx-auto px-4 pb-8 flex justify-center">
        <LanguageSwitcher />
      </footer>

      {/*
        Switching identity replaces the marked days on screen, so unsaved marks would go
        with it. The rest of the product warns before losing them (see the beforeunload
        handler above); this path has to as well.
      */}
      <AlertDialog
        open={pendingLeave !== null}
        onOpenChange={(open) => {
          if (!open) setPendingLeave(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trip.leaveEditor.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingLeave?.kind === 'switch'
                ? t('trip.leaveEditor.switchBody', { current: userName, other: pendingLeave.name })
                : t('trip.leaveEditor.backBody', { current: userName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('trip.leaveEditor.keep', { name: userName })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingLeave?.kind === 'switch') switchToParticipant(pendingLeave.name);
                else if (pendingLeave?.kind === 'back') leaveEditor();
                setPendingLeave(null);
              }}
            >
              {pendingLeave?.kind === 'switch'
                ? t('common.editDates', { name: pendingLeave.name })
                : t('trip.leaveEditor.discardBack')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
