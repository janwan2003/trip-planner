import { enUS } from 'date-fns/locale/en-US';

/**
 * English: the source language. Every other locale is typed against this object, so
 * a key added here and missing from `de.ts`, `nl.ts` or `es.ts` fails `pnpm run
 * typecheck` - see `Messages` in `../types.ts`.
 *
 * Keys are grouped by the component that renders them. A string used by two
 * components lives in `common`.
 *
 * Plurals follow i18next: `key_one` and `key_other`, selected by a `count`
 * argument (`t('trip.participantCount', { count })`). Placeholders are
 * `{{name}}`; `src/i18n/locales.test.ts` checks every translation carries the same
 * ones as the English string, because a dropped `{{name}}` typechecks fine.
 */
const messages = {
  common: {
    loading: 'Loading...',
    logoAlt: 'WeGoWhen logo',
    genericError: 'Something went wrong. Please try again.',
    editDates: "Edit {{name}}'s dates",
    language: 'Language',
  },

  home: {
    title: 'Find the days your group can actually go',
    subtitle: "Plan trips with friends by finding when everyone's available",
    freeNote: 'Free, no account, and nothing for your friends to sign up to.',
    footer: {
      tagline: 'Pick trip dates with friends. No accounts, just a link.',
      project: 'Project',
      about: 'About',
      contact: 'Contact',
      learn: 'Learn',
      faq: 'FAQ',
      when2meet: 'When2meet alternative',
      doodle: 'Doodle alternative',
      legal: 'Legal',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      closing: 'Share the link. Mark your dates. Go on adventures.',
      languages: 'Languages',
    },
  },

  landing: {
    home: 'Home',
    ctaTitle: 'Find the days your group can actually go',
    ctaBody: 'Free, no account, and nothing to install.',
    ctaButton: 'Create a trip',
  },

  createTrip: {
    title: 'Plan Your Trip',
    description: 'Create a trip and share the link with friends to find the best dates',
    nameLabel: 'Trip Name',
    namePlaceholder: 'Summer Adventure 2026',
    startLabel: 'Start Date',
    startPlaceholder: 'Start date',
    endLabel: 'End Date',
    endPlaceholder: 'End date',
    submit: 'Create Trip',
    submitting: 'Creating...',
    invalidDatesTitle: 'Invalid dates',
    invalidDatesBody: 'End date must be after start date.',
    errorTitle: 'Error creating trip',
    tooLongTitle: 'Trip too long',
    tooLongBody_one: 'A trip can span at most {{count}} day.',
    tooLongBody_other: 'A trip can span at most {{count}} days.',
  },

  dateInput: {
    placeholder: 'Select date',
  },

  recentTrips: {
    title: 'Your trips',
    description:
      'Trips you opened in this browser. Saved here only — not on our servers, and not on your other devices.',
    untitled: 'Untitled trip',
    yours: 'Yours',
    open: 'Open {{name}}',
    openWithRange: 'Open {{name}}, {{range}}',
    remove: 'Remove {{name}} from this list',
  },

  notFound: {
    message: 'Oops! Page not found',
    home: 'Return to Home',
  },
  errorBoundary: {
    title: 'Something went wrong',
    body: 'This page hit an error. Your saved dates are safe on the server; reloading usually fixes it.',
    reload: 'Reload',
  },

  trip: {
    loading: 'Loading trip...',
    loadErrorTitle: "Couldn't load this trip",
    loadErrorBody:
      "The trip may well be fine — we just couldn't reach it. Check your connection and try again.",
    tryAgain: 'Try again',
    createNew: 'Create a new trip',
    notFoundTitle: 'Trip not found',
    notFoundBody: "This trip doesn't exist or has been removed.",
    share: 'Share',
    shareLink: 'Share Link',
    copied: 'Copied!',
    back: 'Back to trip view',
    participantCount_one: '{{count}} participant',
    participantCount_other: '{{count}} participants',

    join: {
      title: 'Join this trip',
      body: 'Your name labels the days you pick, so everyone can see who is free when. No account, no email.',
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name',
      submit: 'Mark my dates',
    },

    mark: {
      title: 'Mark Your Availability',
      // <name> wraps the button that edits the name; see the Trans in TripPage.
      greeting: "Hi <name>{{name}}</name>! Tap or drag across the days you're free.",
      selectAll: 'Select All',
      clearAll: 'Clear All',
      legendAvailable: 'Available',
      legendNotSelected: 'Not selected',
      save: 'Save Availability',
      saving: 'Saving...',
      noChanges: 'No Changes to Save',
    },

    withdraw: {
      label: 'Withdraw from trip',
      confirmTitle: 'Withdraw from this trip?',
      confirmBody:
        'The days you marked will be removed from {{trip}}, and the group will no longer see you as coming. You can rejoin with the same name later, but your dates will be gone.',
      cancel: 'Stay on the trip',
      confirm: 'Withdraw',
    },

    group: {
      title: 'Group Availability',
      showingAll: 'Showing all participants',
      filteredTo: 'Filtered to: {{names}}',
      noOne: 'No one',
      everyone: 'Everyone',
    },

    participants: {
      title: 'Participants',
      hint: "Click to filter by subset, or the pencil to edit someone's dates",
    },

    leaveEditor: {
      title: 'Discard your unsaved days?',
      switchBody: "You have days marked as {{current}} that are not saved. Editing {{other}}'s dates loads their answer instead, and your unsaved marks are lost.",
      backBody: 'You have days marked as {{current}} that are not saved. Going back to the trip view loses them.',
      keep: 'Keep editing as {{name}}',
      discardBack: 'Discard and go back',
    },

    toast: {
      linkCopiedTitle: 'Link copied!',
      linkCopiedBody: 'Share this link with your friends.',
      copyFailedTitle: 'Couldn\'t copy the link',
      copyFailedBody: 'Copy it from your browser\'s address bar instead.',
      savedTitle: 'Availability saved!',
      savedBody: 'Your dates have been updated.',
      saveErrorTitle: 'Error saving',
      conflictTitle: 'These dates changed meanwhile',
      conflictBody: '{{name}}\'s answer was updated from another device. Your marks are still here; save again to replace it, or check the group view first.',
      nameTakenTitle: 'Name already taken',
      nameTakenBody: 'Someone else is already using this name.',
      renamedTitle: 'Name updated!',
      renamedBody: 'You are now known as {{name}}.',
      renameErrorTitle: 'Error updating name',
      withdrawnTitle: 'Withdrawn from trip',
      withdrawnBody: 'Your availability has been removed.',
      withdrawErrorTitle: 'Error withdrawing',
    },
  },

  calendar: {
    dayWithCount_one: '{{date}}, {{count}} available',
    dayWithCount_other: '{{date}}, {{count}} available',
    nobodyFree: 'nobody is free',
    tapHint: 'Tap a day to see who is free',
  },

  bestDates: {
    title: 'Best Dates',
    forNames: 'for {{names}}',
    minHelp: 'Minimum length of trip period.',
    minLabel: 'Min:',
    minTitle: 'Min days',
    days_one: '{{count}} day',
    days_other: '{{count}} days',
    // Screen-reader completion of "3/5": "3 of 5 people free".
    ofPeopleFree_one: 'of {{count}} person free',
    ofPeopleFree_other: 'of {{count}} people free',
    empty: {
      noParticipantsTitle: 'Best dates will appear here',
      noParticipantsBody: 'Send the link to everyone, then their days show up',
      filteredTitle: 'No days work for {{names}}',
      filteredBody: 'Try including more people',
      nobodyMarkedTitle_one: 'Someone has joined, but nobody has marked days yet',
      nobodyMarkedTitle_other: 'People have joined, but nobody has marked days yet',
      nobodyMarkedBody: 'Best dates appear as soon as anyone does',
      noOverlapTitle: 'No overlapping days yet',
      noOverlapBody: 'Nobody is free on the same day so far',
    },
  },

  participantsList: {
    emptyTitle: 'No one has responded yet',
    emptyBody: 'Be the first to mark your availability!',
    daysAvailable_one: '{{count}} day available',
    daysAvailable_other: '{{count}} days available',
  },

  tutorial: {
    show: 'Show Tutorial',
    hide: 'Hide Tutorial',
    organiserHeading: 'How it works',
    participantHeading: 'What to do',
    organiser: {
      createTitle: 'Create a Trip',
      createBody: 'Set your trip name and date range',
      shareTitle: 'Share the Link',
      shareBody: 'Send the trip link to all participants',
      markTitle: 'Mark and Save Availability',
      markBody: 'Everyone selects their available dates',
      pickTitle: 'Pick Best Dates',
      pickBody: 'See when most people are free',
    },
    participant: {
      markTitle: 'Mark the days you can go',
      markBody: 'Tap a day, or drag across several',
      saveTitle: 'Save',
      saveBody: 'Your dates go to the group straight away',
      watchTitle: 'Watch the answer change',
      watchBody: 'Best Dates updates as more people reply',
    },
  },

  feedback: {
    bug: {
      label: 'Report a bug',
      intro:
        "Hi, I'm Janek, and I made WeGoWhen. If something broke or felt off, I'd be really grateful if you told me. Every report helps.",
      placeholder: 'What happened, and what did you expect?',
    },
    feature: {
      label: 'Suggest a feature',
      intro:
        "Hi, I'm Janek, and I made WeGoWhen. Missing something? I read every request carefully, and most of them end up in the app.",
      placeholder: 'What would make planning easier for you?',
    },
    emailLabel: 'Your email (optional)',
    emailPlaceholder: 'Email for a reply (optional)',
    send: 'Send',
    thanks: "Thank you! It's on its way to me.",
    failed: "Couldn't send that. Please check your connection and try again.",
  },
};

export default { messages, dateLocale: enUS };
