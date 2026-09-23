import { nl as dateLocale } from 'date-fns/locale/nl';

import type { LocaleBundle } from '../types';

/** Dutch. Informal "je" throughout: this is a tool friends send each other. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Laden…',
      logoAlt: 'WeGoWhen-logo',
      genericError: 'Er ging iets mis. Probeer het opnieuw.',
      editDates: 'Data van {{name}} bewerken',
      language: 'Taal',
    },

    home: {
      title: 'Vind de dagen waarop je groep echt kan',
      subtitle: 'Plan reizen met vrienden door te zien wanneer iedereen kan',
      freeNote: 'Gratis, geen account, en je vrienden hoeven zich nergens aan te melden.',
      footer: {
        tagline: 'Kies reisdata met vrienden. Geen accounts, alleen een link.',
        project: 'Project',
        about: 'Over',
        contact: 'Contact',
        learn: 'Meer weten',
        faq: 'Veelgestelde vragen',
        when2meet: 'Alternatief voor When2meet',
        doodle: 'Alternatief voor Doodle',
        legal: 'Juridisch',
        terms: 'Gebruiksvoorwaarden',
        privacy: 'Privacybeleid',
        closing: 'Deel de link. Markeer je data. Ga op avontuur.',
      },
    },

    createTrip: {
      title: 'Plan je reis',
      description: 'Maak een reis aan en deel de link met vrienden om de beste data te vinden',
      nameLabel: 'Naam van de reis',
      namePlaceholder: 'Zomeravontuur 2026',
      startLabel: 'Begindatum',
      startPlaceholder: 'Begindatum',
      endLabel: 'Einddatum',
      endPlaceholder: 'Einddatum',
      submit: 'Reis aanmaken',
      submitting: 'Bezig met aanmaken…',
      invalidDatesTitle: 'Ongeldige data',
      invalidDatesBody: 'De einddatum moet na de begindatum liggen.',
      errorTitle: 'Reis aanmaken mislukt',
      tooLongTitle: 'Reis te lang',
      tooLongBody_one: 'Een reis kan maximaal {{count}} dag duren.',
      tooLongBody_other: 'Een reis kan maximaal {{count}} dagen duren.',
    },

    dateInput: {
      placeholder: 'Kies een datum',
    },

    recentTrips: {
      title: 'Jouw reizen',
      description:
        'Reizen die je in deze browser hebt geopend. Alleen hier opgeslagen – niet op onze servers en niet op je andere apparaten.',
      untitled: 'Naamloze reis',
      yours: 'Van jou',
      open: '{{name}} openen',
      openWithRange: '{{name}} openen, {{range}}',
      remove: '{{name}} uit deze lijst verwijderen',
    },

    notFound: {
      message: 'Oeps! Pagina niet gevonden',
      home: 'Terug naar de startpagina',
    },
    errorBoundary: {
      title: 'Er ging iets mis',
      body: 'Er is een fout opgetreden op deze pagina. Je opgeslagen data staan veilig op de server; opnieuw laden lost het meestal op.',
      reload: 'Opnieuw laden',
    },

    trip: {
      loading: 'Reis laden…',
      loadErrorTitle: 'Deze reis kon niet worden geladen',
      loadErrorBody:
        'Met de reis is waarschijnlijk niets mis – we konden hem alleen niet bereiken. Controleer je verbinding en probeer het opnieuw.',
      tryAgain: 'Opnieuw proberen',
      createNew: 'Nieuwe reis aanmaken',
      notFoundTitle: 'Reis niet gevonden',
      notFoundBody: 'Deze reis bestaat niet of is verwijderd.',
      share: 'Delen',
      shareLink: 'Link delen',
      copied: 'Gekopieerd!',
      back: 'Terug naar het overzicht',
      participantCount_one: '{{count}} deelnemer',
      participantCount_other: '{{count}} deelnemers',

      join: {
        title: 'Doe mee met deze reis',
        body: 'Je naam komt bij de dagen die je kiest, zodat iedereen ziet wie wanneer kan. Geen account, geen e-mail.',
        nameLabel: 'Je naam',
        namePlaceholder: 'Vul je naam in',
        submit: 'Mijn data markeren',
      },

      mark: {
        title: 'Markeer wanneer je kunt',
        greeting: 'Hoi <name>{{name}}</name>! Tik of sleep over de dagen waarop je kunt.',
        selectAll: 'Alles selecteren',
        clearAll: 'Alles wissen',
        legendAvailable: 'Beschikbaar',
        legendNotSelected: 'Niet geselecteerd',
        save: 'Beschikbaarheid opslaan',
        saving: 'Opslaan…',
        noChanges: 'Geen wijzigingen',
      },

      withdraw: {
        label: 'Afmelden voor de reis',
        confirmTitle: 'Afmelden voor deze reis?',
        confirmBody:
          'De dagen die je hebt gemarkeerd worden verwijderd uit {{trip}}, en de groep ziet je niet meer als deelnemer. Je kunt later met dezelfde naam opnieuw meedoen, maar je data zijn dan weg.',
        cancel: 'Blijf erbij',
        confirm: 'Afmelden',
      },

      group: {
        title: 'Beschikbaarheid van de groep',
        showingAll: 'Alle deelnemers worden getoond',
        filteredTo: 'Gefilterd op: {{names}}',
        noOne: 'Niemand',
        everyone: 'Iedereen',
      },

      participants: {
        title: 'Deelnemers',
        hint: 'Tik om op personen te filteren, of op het potlood om iemands data te bewerken',
      },

      leaveEditor: {
        title: 'Niet-opgeslagen dagen weggooien?',
        switchBody: 'Je hebt als {{current}} dagen gemarkeerd die nog niet zijn opgeslagen. Als je de data van {{other}} bewerkt, wordt hun antwoord geladen en ben je je niet-opgeslagen markeringen kwijt.',
        backBody: 'Je hebt als {{current}} dagen gemarkeerd die nog niet zijn opgeslagen. Als je teruggaat naar het overzicht, ben je ze kwijt.',
        keep: 'Verder bewerken als {{name}}',
        discardBack: 'Weggooien en teruggaan',
      },

      toast: {
        linkCopiedTitle: 'Link gekopieerd!',
        linkCopiedBody: 'Deel deze link met je vrienden.',
        copyFailedTitle: 'Link kopiëren mislukt',
        copyFailedBody: 'Kopieer hem in plaats daarvan uit de adresbalk van je browser.',
        savedTitle: 'Beschikbaarheid opgeslagen!',
        savedBody: 'Je data zijn bijgewerkt.',
        saveErrorTitle: 'Fout bij opslaan',
        conflictTitle: 'Deze data zijn intussen gewijzigd',
        conflictBody: 'Het antwoord van {{name}} is op een ander apparaat bijgewerkt. Je markeringen staan er nog; sla opnieuw op om het te vervangen, of bekijk eerst de groepsweergave.',
        nameTakenTitle: 'Naam al in gebruik',
        nameTakenBody: 'Iemand anders gebruikt deze naam al.',
        renamedTitle: 'Naam gewijzigd!',
        renamedBody: 'Je heet nu {{name}}.',
        renameErrorTitle: 'Fout bij wijzigen van naam',
        withdrawnTitle: 'Afgemeld voor de reis',
        withdrawnBody: 'Je beschikbaarheid is verwijderd.',
        withdrawErrorTitle: 'Fout bij afmelden',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} beschikbaar',
      dayWithCount_other: '{{date}}, {{count}} beschikbaar',
      nobodyFree: 'niemand kan',
      tapHint: 'Tik op een dag om te zien wie kan',
    },

    bestDates: {
      title: 'Beste data',
      forNames: 'voor {{names}}',
      minHelp: 'Minimale lengte van de reisperiode.',
      minLabel: 'Min.:',
      minTitle: 'Minimaal aantal dagen',
      days_one: '{{count}} dag',
      days_other: '{{count}} dagen',
      ofPeopleFree_one: 'van {{count}} persoon kan',
      ofPeopleFree_other: 'van {{count}} personen kunnen',
      empty: {
        noParticipantsTitle: 'Hier verschijnen de beste data',
        noParticipantsBody: 'Stuur iedereen de link, dan verschijnen hun dagen hier',
        filteredTitle: 'Geen dagen die passen voor {{names}}',
        filteredBody: 'Probeer meer mensen mee te nemen',
        nobodyMarkedTitle_one: 'Er doet iemand mee, maar nog niemand heeft dagen gemarkeerd',
        nobodyMarkedTitle_other: 'Er doen mensen mee, maar nog niemand heeft dagen gemarkeerd',
        nobodyMarkedBody: 'De beste data verschijnen zodra iemand dat doet',
        noOverlapTitle: 'Nog geen overlappende dagen',
        noOverlapBody: 'Tot nu toe kan niemand op dezelfde dag',
      },
    },

    participantsList: {
      emptyTitle: 'Nog niemand heeft gereageerd',
      emptyBody: 'Markeer als eerste je beschikbaarheid!',
      daysAvailable_one: '{{count}} dag beschikbaar',
      daysAvailable_other: '{{count}} dagen beschikbaar',
    },

    tutorial: {
      show: 'Uitleg tonen',
      hide: 'Uitleg verbergen',
      organiserHeading: 'Zo werkt het',
      participantHeading: 'Wat je moet doen',
      organiser: {
        createTitle: 'Maak een reis aan',
        createBody: 'Kies een naam en een periode',
        shareTitle: 'Deel de link',
        shareBody: 'Stuur de link naar alle deelnemers',
        markTitle: 'Markeer en sla beschikbaarheid op',
        markBody: 'Iedereen kiest de dagen waarop hij of zij kan',
        pickTitle: 'Kies de beste data',
        pickBody: 'Zie wanneer de meeste mensen kunnen',
      },
      participant: {
        markTitle: 'Markeer de dagen waarop je kunt',
        markBody: 'Tik op een dag, of sleep over meerdere',
        saveTitle: 'Opslaan',
        saveBody: 'Je data gaan meteen naar de groep',
        watchTitle: 'Zie het antwoord veranderen',
        watchBody: '‘Beste data’ wordt bijgewerkt zodra meer mensen reageren',
      },
    },

    feedback: {
      bug: {
        label: 'Meld een bug',
        intro:
          'Hoi, ik ben Janek en ik heb WeGoWhen gemaakt. Werkt er iets niet of voelt iets raar? Ik zou het echt waarderen als je het me laat weten. Elke melding helpt.',
        placeholder: 'Wat gebeurde er, en wat verwachtte je?',
      },
      feature: {
        label: 'Stel een functie voor',
        intro:
          'Hoi, ik ben Janek en ik heb WeGoWhen gemaakt. Mis je iets? Ik lees elk verzoek zorgvuldig, en de meeste komen in de app terecht.',
        placeholder: 'Wat zou het plannen voor jou makkelijker maken?',
      },
      emailLabel: 'Je e-mail (optioneel)',
      emailPlaceholder: 'E-mail voor een antwoord (optioneel)',
      send: 'Versturen',
      thanks: 'Bedankt! Je bericht is onderweg naar mij.',
      failed: 'Versturen is niet gelukt. Controleer je verbinding en probeer het opnieuw.',
    },
  },
} satisfies LocaleBundle;
