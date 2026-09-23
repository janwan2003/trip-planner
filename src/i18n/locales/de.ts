import { de as dateLocale } from 'date-fns/locale/de';

import type { LocaleBundle } from '../types';

/** German. Informal "du" throughout: this is a tool friends send each other. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Wird geladen …',
      logoAlt: 'WeGoWhen-Logo',
      genericError: 'Da ist etwas schiefgelaufen. Bitte versuch es noch einmal.',
      editDates: 'Tage von {{name}} bearbeiten',
      language: 'Sprache',
    },

    home: {
      title: 'Finde die Tage, an denen deine Gruppe wirklich kann',
      subtitle: 'Plane Reisen mit Freunden – und sieh auf einen Blick, wann alle Zeit haben',
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
        closing: 'Link teilen. Tage eintragen. Los geht’s.',
        languages: 'Sprachen',
      },
    },

    landing: {

      home: 'Startseite',

      ctaTitle: 'Finde die Tage, an denen deine Gruppe wirklich kann',

      ctaBody: 'Kostenlos, ohne Konto und ohne Installation.',

      ctaButton: 'Reise anlegen',

    },


    createTrip: {
      title: 'Plane deine Reise',
      description: 'Leg eine Reise an und schick den Link an deine Freunde. So findet ihr die besten Termine.',
      nameLabel: 'Name der Reise',
      namePlaceholder: 'Sommerurlaub 2026',
      startLabel: 'Startdatum',
      startPlaceholder: 'Startdatum',
      endLabel: 'Enddatum',
      endPlaceholder: 'Enddatum',
      submit: 'Reise erstellen',
      submitting: 'Wird erstellt …',
      invalidDatesTitle: 'Ungültiger Zeitraum',
      invalidDatesBody: 'Das Enddatum muss nach dem Startdatum liegen.',
      errorTitle: 'Reise konnte nicht erstellt werden',
      tooLongTitle: 'Zeitraum zu lang',
      tooLongBody_one: 'Der Zeitraum darf höchstens {{count}} Tag lang sein.',
      tooLongBody_other: 'Der Zeitraum darf höchstens {{count}} Tage lang sein.',
    },

    dateInput: {
      placeholder: 'Datum wählen',
    },

    recentTrips: {
      title: 'Deine Reisen',
      description:
        'Reisen, die du in diesem Browser geöffnet hast. Die Liste liegt nur hier – nicht auf unseren Servern und nicht auf deinen anderen Geräten.',
      untitled: 'Reise ohne Namen',
      yours: 'Von dir',
      open: '{{name}} öffnen',
      openWithRange: '{{name}} öffnen, {{range}}',
      remove: '{{name}} aus der Liste entfernen',
    },

    notFound: {
      message: 'Hoppla! Diese Seite gibt es nicht.',
      home: 'Zur Startseite',
    },
    errorBoundary: {
      title: 'Etwas ist schiefgelaufen',
      body: 'Auf dieser Seite ist ein Fehler aufgetreten. Deine gespeicherten Tage sind sicher auf dem Server – meistens hilft es, die Seite neu zu laden.',
      reload: 'Neu laden',
    },

    trip: {
      loading: 'Reise wird geladen …',
      loadErrorTitle: 'Die Reise konnte nicht geladen werden',
      loadErrorBody:
        'Mit der Reise ist vermutlich alles in Ordnung – wir haben nur gerade keine Verbindung bekommen. Prüf dein Internet und versuch es noch einmal.',
      tryAgain: 'Erneut versuchen',
      createNew: 'Neue Reise erstellen',
      startOwn: {
        title: 'Planst du noch etwas anderes?',
        body: 'Starte eine eigene Reise und schick den Link an deine Gruppe. Das dauert eine Minute, und niemand braucht ein Konto.',
        link: 'Eigene Reise starten',
      },
      notFoundTitle: 'Reise nicht gefunden',
      notFoundBody: 'Diese Reise gibt es nicht (mehr).',
      share: 'Teilen',
      shareLink: 'Link teilen',
      copied: 'Kopiert!',
      back: 'Zurück zur Übersicht',
      participantCount_one: '{{count}} Person',
      participantCount_other: '{{count}} Personen',

      join: {
        title: 'Bist du dabei?',
        body: 'Über deinen Namen sehen alle, wer wann Zeit hat. Kein Konto, keine E-Mail.',
        nameLabel: 'Dein Name',
        namePlaceholder: 'Wie heißt du?',
        submit: 'Tage eintragen',
      },

      mark: {
        title: 'Wann hast du Zeit?',
        greeting: 'Hallo <name>{{name}}</name>! Tippe auf die Tage, an denen du Zeit hast – oder zieh über mehrere.',
        selectAll: 'Alle auswählen',
        clearAll: 'Alle abwählen',
        legendAvailable: 'Frei',
        legendNotSelected: 'Nicht ausgewählt',
        save: 'Tage speichern',
        saving: 'Wird gespeichert …',
        noChanges: 'Keine Änderungen',
      },

      withdraw: {
        label: 'Mich austragen',
        confirmTitle: 'Aus dieser Reise austragen?',
        confirmBody:
          'Deine Tage werden aus {{trip}} gelöscht und du stehst nicht mehr auf der Liste. Du kannst dich später mit demselben Namen wieder eintragen, musst deine Tage dann aber neu markieren.',
        cancel: 'Dabei bleiben',
        confirm: 'Austragen',
      },

      group: {
        title: 'Wer kann wann?',
        showingAll: 'Alle Teilnehmenden',
        filteredTo: 'Nur: {{names}}',
        noOne: 'Niemand',
        everyone: 'Alle',
      },

      participants: {
        title: 'Teilnehmende',
        hint: 'Tippe auf Namen, um die Ansicht zu filtern – oder auf den Stift, um Tage zu bearbeiten',
      },

      leaveEditor: {
        title: 'Änderungen verwerfen?',
        switchBody: 'Du hast als {{current}} Tage markiert, aber noch nicht gespeichert. Wenn du jetzt die Tage von {{other}} öffnest, gehen deine Änderungen verloren.',
        backBody: 'Du hast als {{current}} Tage markiert, aber noch nicht gespeichert. Wenn du zur Übersicht zurückgehst, gehen sie verloren.',
        keep: 'Weiter als {{name}} bearbeiten',
        discardBack: 'Verwerfen und zurück',
      },

      toast: {
        linkCopiedTitle: 'Link kopiert!',
        linkCopiedBody: 'Schick ihn jetzt an deine Freunde.',
        copyFailedTitle: 'Link konnte nicht kopiert werden',
        copyFailedBody: 'Kopier ihn einfach aus der Adressleiste deines Browsers.',
        savedTitle: 'Gespeichert!',
        savedBody: 'Die Gruppe sieht jetzt deine Tage.',
        saveErrorTitle: 'Speichern fehlgeschlagen',
        conflictTitle: 'Die Tage wurden inzwischen geändert',
        conflictBody: 'Die Tage von {{name}} wurden auf einem anderen Gerät geändert. Deine Auswahl ist noch da: Speichere noch einmal, um die anderen Tage zu überschreiben, oder schau dir zuerst die Gruppenansicht an.',
        nameTakenTitle: 'Name schon vergeben',
        nameTakenBody: 'Diesen Namen nutzt schon jemand anderes.',
        renamedTitle: 'Name geändert!',
        renamedBody: 'Du heißt jetzt {{name}}.',
        renameErrorTitle: 'Name konnte nicht geändert werden',
        withdrawnTitle: 'Du hast dich ausgetragen',
        withdrawnBody: 'Deine Tage wurden gelöscht.',
        withdrawErrorTitle: 'Austragen fehlgeschlagen',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}: {{count}} Person hat Zeit',
      dayWithCount_other: '{{date}}: {{count}} Personen haben Zeit',
      nobodyFree: 'niemand hat Zeit',
      tapHint: 'Tippe auf einen Tag, um zu sehen, wer Zeit hat',
    },

    bestDates: {
      title: 'Beste Termine',
      forNames: 'für {{names}}',
      minHelp: 'Wie viele Tage die Reise mindestens dauern soll.',
      minLabel: 'Mind.:',
      minTitle: 'Mindestanzahl an Tagen',
      days_one: '{{count}} Tag',
      days_other: '{{count}} Tage',
      ofPeopleFree_one: 'von {{count}} Person hat Zeit',
      ofPeopleFree_other: 'von {{count}} Personen haben Zeit',
      empty: {
        noParticipantsTitle: 'Hier erscheinen die besten Termine',
        noParticipantsBody: 'Schick allen den Link, dann tauchen ihre Tage hier auf',
        filteredTitle: 'Kein gemeinsamer Tag für {{names}}',
        filteredBody: 'Nimm mehr Leute in die Auswahl',
        nobodyMarkedTitle_one: 'Eine Person ist dabei, hat aber noch keine Tage markiert',
        nobodyMarkedTitle_other: 'Es sind schon Leute dabei, aber noch niemand hat Tage markiert',
        nobodyMarkedBody: 'Die besten Termine erscheinen, sobald jemand Tage markiert',
        noOverlapTitle: 'Noch keine gemeinsamen Tage',
        noOverlapBody: 'Bisher hat an keinem Tag mehr als eine Person Zeit',
      },
    },

    participantsList: {
      emptyTitle: 'Noch hat niemand geantwortet',
      emptyBody: 'Mach den Anfang und trag deine Tage ein!',
      daysAvailable_one: '{{count}} Tag frei',
      daysAvailable_other: '{{count}} Tage frei',
    },

    tutorial: {
      show: 'Anleitung anzeigen',
      hide: 'Anleitung ausblenden',
      organiserHeading: 'So funktioniert’s',
      participantHeading: 'So machst du mit',
      organiser: {
        createTitle: 'Reise erstellen',
        createBody: 'Namen und Zeitraum festlegen',
        shareTitle: 'Link teilen',
        shareBody: 'Den Link an alle schicken, die mitkommen sollen',
        markTitle: 'Tage eintragen',
        markBody: 'Alle markieren, wann sie Zeit haben',
        pickTitle: 'Termin finden',
        pickBody: 'Sehen, wann die meisten Zeit haben',
      },
      participant: {
        markTitle: 'Trag ein, wann du kannst',
        markBody: 'Tippe auf einen Tag oder zieh über mehrere',
        saveTitle: 'Speichern',
        saveBody: 'Die Gruppe sieht deine Tage sofort',
        watchTitle: 'Ergebnis verfolgen',
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
