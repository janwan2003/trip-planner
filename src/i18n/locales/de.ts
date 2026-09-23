import { de as dateLocale } from 'date-fns/locale/de';

import type { LocaleBundle } from '../types';

/** German. Informal "du" throughout: this is a tool friends send each other. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Wird geladen …',
      logoAlt: 'WeGoWhen-Logo',
      genericError: 'Etwas ist schiefgelaufen. Bitte versuch es noch einmal.',
      editDates: 'Termine von {{name}} bearbeiten',
      language: 'Sprache',
    },

    home: {
      title: 'Finde die Tage, an denen deine Gruppe wirklich kann',
      subtitle: 'Plant Reisen mit Freunden, indem ihr herausfindet, wann alle Zeit haben',
      freeNote: 'Kostenlos, ohne Konto – und deine Freunde müssen sich nirgends anmelden.',
      footer: {
        tagline: 'Reisetermine mit Freunden finden. Kein Konto, nur ein Link.',
        project: 'Projekt',
        about: 'Über uns',
        contact: 'Kontakt',
        learn: 'Mehr erfahren',
        faq: 'FAQ',
        when2meet: 'When2meet-Alternative',
        doodle: 'Doodle-Alternative',
        legal: 'Rechtliches',
        terms: 'Nutzungsbedingungen',
        privacy: 'Datenschutzerklärung',
        closing: 'Link teilen. Termine markieren. Los geht’s.',
      },
    },

    createTrip: {
      title: 'Plane deine Reise',
      description: 'Erstelle eine Reise und teile den Link mit Freunden, um die besten Termine zu finden',
      nameLabel: 'Name der Reise',
      namePlaceholder: 'Sommerabenteuer 2026',
      startLabel: 'Startdatum',
      startPlaceholder: 'Startdatum',
      endLabel: 'Enddatum',
      endPlaceholder: 'Enddatum',
      submit: 'Reise erstellen',
      submitting: 'Wird erstellt …',
      invalidDatesTitle: 'Ungültige Daten',
      invalidDatesBody: 'Das Enddatum muss nach dem Startdatum liegen.',
      errorTitle: 'Reise konnte nicht erstellt werden',
      tooLongTitle: 'Reise zu lang',
      tooLongBody_one: 'Eine Reise kann höchstens {{count}} Tag umfassen.',
      tooLongBody_other: 'Eine Reise kann höchstens {{count}} Tage umfassen.',
    },

    dateInput: {
      placeholder: 'Datum wählen',
    },

    recentTrips: {
      title: 'Deine Reisen',
      description:
        'Reisen, die du in diesem Browser geöffnet hast. Nur hier gespeichert – nicht auf unseren Servern und nicht auf deinen anderen Geräten.',
      untitled: 'Reise ohne Namen',
      yours: 'Deine',
      open: '{{name}} öffnen',
      openWithRange: '{{name}} öffnen, {{range}}',
      remove: '{{name}} aus dieser Liste entfernen',
    },

    notFound: {
      message: 'Hoppla! Seite nicht gefunden',
      home: 'Zur Startseite',
    },
    errorBoundary: {
      title: 'Etwas ist schiefgelaufen',
      body: 'Auf dieser Seite ist ein Fehler aufgetreten. Deine gespeicherten Tage sind sicher auf dem Server; ein Neuladen behebt das meistens.',
      reload: 'Neu laden',
    },

    trip: {
      loading: 'Reise wird geladen …',
      loadErrorTitle: 'Diese Reise konnte nicht geladen werden',
      loadErrorBody:
        'Mit der Reise ist wahrscheinlich alles in Ordnung – wir konnten sie nur nicht erreichen. Prüf deine Verbindung und versuch es noch einmal.',
      tryAgain: 'Erneut versuchen',
      createNew: 'Neue Reise erstellen',
      notFoundTitle: 'Reise nicht gefunden',
      notFoundBody: 'Diese Reise existiert nicht oder wurde entfernt.',
      share: 'Teilen',
      shareLink: 'Link teilen',
      copied: 'Kopiert!',
      back: 'Zurück zur Übersicht',
      participantCount_one: '{{count}} Person',
      participantCount_other: '{{count}} Personen',

      join: {
        title: 'Bei dieser Reise mitmachen',
        body: 'Dein Name steht an den Tagen, die du auswählst, damit alle sehen, wer wann Zeit hat. Kein Konto, keine E-Mail.',
        nameLabel: 'Dein Name',
        namePlaceholder: 'Gib deinen Namen ein',
        submit: 'Meine Tage markieren',
      },

      mark: {
        title: 'Markiere, wann du kannst',
        greeting: 'Hallo <name>{{name}}</name>! Tippe auf die Tage, an denen du Zeit hast, oder zieh darüber.',
        selectAll: 'Alle auswählen',
        clearAll: 'Alle abwählen',
        legendAvailable: 'Verfügbar',
        legendNotSelected: 'Nicht ausgewählt',
        save: 'Verfügbarkeit speichern',
        saving: 'Wird gespeichert …',
        noChanges: 'Keine Änderungen',
      },

      withdraw: {
        label: 'Von der Reise abmelden',
        confirmTitle: 'Von dieser Reise abmelden?',
        confirmBody:
          'Deine markierten Tage werden aus {{trip}} entfernt, und die Gruppe sieht dich nicht mehr als dabei. Du kannst später mit demselben Namen wieder mitmachen, aber deine Tage sind dann weg.',
        cancel: 'Dabei bleiben',
        confirm: 'Abmelden',
      },

      group: {
        title: 'Verfügbarkeit der Gruppe',
        showingAll: 'Alle Teilnehmenden werden angezeigt',
        filteredTo: 'Gefiltert auf: {{names}}',
        noOne: 'Niemand',
        everyone: 'Alle',
      },

      participants: {
        title: 'Teilnehmende',
        hint: 'Tippe, um nach Personen zu filtern, oder auf den Stift, um ihre Tage zu bearbeiten',
      },

      leaveEditor: {
        title: 'Ungespeicherte Tage verwerfen?',
        switchBody: 'Du hast als {{current}} Tage markiert, die noch nicht gespeichert sind. Wenn du die Tage von {{other}} bearbeitest, wird stattdessen deren Antwort geladen, und deine ungespeicherten Markierungen gehen verloren.',
        backBody: 'Du hast als {{current}} Tage markiert, die noch nicht gespeichert sind. Wenn du zur Übersicht zurückgehst, gehen sie verloren.',
        keep: 'Weiter als {{name}} bearbeiten',
        discardBack: 'Verwerfen und zurück',
      },

      toast: {
        linkCopiedTitle: 'Link kopiert!',
        linkCopiedBody: 'Teile diesen Link mit deinen Freunden.',
        copyFailedTitle: 'Link konnte nicht kopiert werden',
        copyFailedBody: 'Kopiere ihn stattdessen aus der Adressleiste deines Browsers.',
        savedTitle: 'Verfügbarkeit gespeichert!',
        savedBody: 'Deine Tage wurden aktualisiert.',
        saveErrorTitle: 'Fehler beim Speichern',
        conflictTitle: 'Diese Tage wurden inzwischen geändert',
        conflictBody: 'Die Antwort von {{name}} wurde auf einem anderen Gerät geändert. Deine Markierungen sind noch da; speichere erneut, um sie zu ersetzen, oder sieh dir zuerst die Gruppenansicht an.',
        nameTakenTitle: 'Name schon vergeben',
        nameTakenBody: 'Jemand anderes verwendet diesen Namen bereits.',
        renamedTitle: 'Name geändert!',
        renamedBody: 'Du heißt jetzt {{name}}.',
        renameErrorTitle: 'Fehler beim Ändern des Namens',
        withdrawnTitle: 'Von der Reise abgemeldet',
        withdrawnBody: 'Deine Verfügbarkeit wurde entfernt.',
        withdrawErrorTitle: 'Fehler beim Abmelden',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} verfügbar',
      dayWithCount_other: '{{date}}, {{count}} verfügbar',
      nobodyFree: 'niemand hat Zeit',
      tapHint: 'Tippe auf einen Tag, um zu sehen, wer Zeit hat',
    },

    bestDates: {
      title: 'Beste Termine',
      forNames: 'für {{names}}',
      minHelp: 'Mindestlänge des Reisezeitraums.',
      minLabel: 'Min.:',
      minTitle: 'Mindestanzahl Tage',
      days_one: '{{count}} Tag',
      days_other: '{{count}} Tage',
      ofPeopleFree_one: 'von {{count}} Person hat Zeit',
      ofPeopleFree_other: 'von {{count}} Personen haben Zeit',
      empty: {
        noParticipantsTitle: 'Hier erscheinen die besten Termine',
        noParticipantsBody: 'Schick allen den Link, dann tauchen ihre Tage hier auf',
        filteredTitle: 'Keine Tage passen für {{names}}',
        filteredBody: 'Nimm mehr Personen dazu',
        nobodyMarkedTitle_one: 'Jemand ist dabei, aber noch niemand hat Tage markiert',
        nobodyMarkedTitle_other: 'Einige sind dabei, aber noch niemand hat Tage markiert',
        nobodyMarkedBody: 'Die besten Termine erscheinen, sobald jemand Tage markiert',
        noOverlapTitle: 'Noch keine gemeinsamen Tage',
        noOverlapBody: 'Bisher hat niemand am selben Tag Zeit',
      },
    },

    participantsList: {
      emptyTitle: 'Noch hat niemand geantwortet',
      emptyBody: 'Markiere als Erste(r) deine Tage!',
      daysAvailable_one: '{{count}} Tag verfügbar',
      daysAvailable_other: '{{count}} Tage verfügbar',
    },

    tutorial: {
      show: 'Anleitung anzeigen',
      hide: 'Anleitung ausblenden',
      organiserHeading: 'So funktioniert’s',
      participantHeading: 'Was zu tun ist',
      organiser: {
        createTitle: 'Reise erstellen',
        createBody: 'Name der Reise und Zeitraum festlegen',
        shareTitle: 'Link teilen',
        shareBody: 'Den Link an alle Teilnehmenden schicken',
        markTitle: 'Verfügbarkeit markieren und speichern',
        markBody: 'Alle wählen die Tage aus, an denen sie können',
        pickTitle: 'Beste Termine wählen',
        pickBody: 'Sehen, wann die meisten Zeit haben',
      },
      participant: {
        markTitle: 'Markiere die Tage, an denen du kannst',
        markBody: 'Tippe auf einen Tag oder zieh über mehrere',
        saveTitle: 'Speichern',
        saveBody: 'Deine Tage gehen sofort an die Gruppe',
        watchTitle: 'Sieh zu, wie sich das Ergebnis ändert',
        watchBody: '„Beste Termine“ aktualisiert sich, sobald mehr Leute antworten',
      },
    },

    feedback: {
      bug: {
        label: 'Fehler melden',
        intro:
          'Hi, ich bin Janek und habe WeGoWhen gebaut. Wenn etwas kaputt ist oder sich komisch anfühlt, freue ich mich sehr, wenn du es mir sagst. Jede Meldung hilft.',
        placeholder: 'Was ist passiert, und was hast du erwartet?',
      },
      feature: {
        label: 'Funktion vorschlagen',
        intro:
          'Hi, ich bin Janek und habe WeGoWhen gebaut. Fehlt dir etwas? Ich lese jeden Wunsch genau, und die meisten landen in der App.',
        placeholder: 'Was würde dir die Planung leichter machen?',
      },
      emailLabel: 'Deine E-Mail (optional)',
      emailPlaceholder: 'E-Mail für eine Antwort (optional)',
      send: 'Senden',
      thanks: 'Danke! Deine Nachricht ist auf dem Weg zu mir.',
      failed: 'Das konnte nicht gesendet werden. Prüfe deine Verbindung und versuch es noch einmal.',
    },
  },
} satisfies LocaleBundle;
