import { nl as dateLocale } from 'date-fns/locale/nl';

import type { LocaleBundle } from '../types';

/** Dutch. Informal "je" throughout: this is a tool friends send each other. "Datums", not "data". */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Laden…',
      logoAlt: 'WeGoWhen-logo',
      genericError: 'Er ging iets mis. Probeer het opnieuw.',
      editDates: 'Datums van {{name}} aanpassen',
      language: 'Taal',
    },

    home: {
      title: 'Vind de dagen waarop je groep echt kan',
      subtitle: 'Plan samen een reis en zie meteen wanneer iedereen kan',
      freeNote: 'Gratis en zonder account. Je vrienden hoeven zich ook nergens aan te melden.',
      footer: {
        tagline: 'Kies samen de datums voor je reis. Geen account, alleen een link.',
        project: 'Project',
        about: 'Over WeGoWhen',
        contact: 'Contact',
        learn: 'Meer weten',
        faq: 'Veelgestelde vragen',
        when2meet: 'Alternatief voor When2meet',
        doodle: 'Alternatief voor Doodle',
        legal: 'Juridisch',
        terms: 'Gebruiksvoorwaarden',
        privacy: 'Privacybeleid',
        closing: 'Deel de link. Kies je datums. Ga op avontuur.',
        languages: 'Talen',
      },
    },

    landing: {

      home: 'Home',

      ctaTitle: 'Vind de dagen waarop je groep echt kan',

      ctaBody: 'Gratis, zonder account en niets te installeren.',

      ctaButton: 'Maak een reis aan',

    },


    createTrip: {
      title: 'Plan je reis',
      description: 'Maak een reis aan, deel de link en vind samen de beste datums',
      nameLabel: 'Naam van je reis',
      namePlaceholder: 'Weekendje Ardennen',
      startLabel: 'Begindatum',
      startPlaceholder: 'Begindatum',
      endLabel: 'Einddatum',
      endPlaceholder: 'Einddatum',
      submit: 'Reis aanmaken',
      submitting: 'Aanmaken…',
      invalidDatesTitle: 'Ongeldige datums',
      invalidDatesBody: 'De einddatum moet na de begindatum liggen.',
      errorTitle: 'Reis aanmaken mislukt',
      tooLongTitle: 'Reis is te lang',
      tooLongBody_one: 'Een reis duurt maximaal {{count}} dag.',
      tooLongBody_other: 'Een reis duurt maximaal {{count}} dagen.',
    },

    dateInput: {
      placeholder: 'Kies een datum',
    },

    recentTrips: {
      title: 'Jouw reizen',
      description:
        'Reizen die je in deze browser hebt geopend. Dit lijstje staat alleen hier: niet op onze servers en niet op je andere apparaten.',
      untitled: 'Reis zonder naam',
      yours: 'Van jou',
      open: '{{name}} openen',
      openWithRange: '{{name}} openen, {{range}}',
      remove: '{{name}} uit dit lijstje halen',
    },

    notFound: {
      message: 'Oeps! Pagina niet gevonden',
      home: 'Terug naar de startpagina',
    },
    errorBoundary: {
      title: 'Er ging iets mis',
      body: 'Deze pagina liep vast. Je opgeslagen datums staan veilig op de server; opnieuw laden helpt meestal.',
      reload: 'Opnieuw laden',
    },

    trip: {
      loading: 'Reis laden…',
      loadErrorTitle: 'Kan deze reis niet laden',
      loadErrorBody:
        'Waarschijnlijk is er niets mis met de reis, we konden hem alleen niet bereiken. Controleer je verbinding en probeer het opnieuw.',
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
        title: 'Ga je mee?',
        body: 'Je naam komt bij de dagen die je kiest, zodat iedereen ziet wie wanneer kan. Geen account, geen e-mail.',
        nameLabel: 'Je naam',
        namePlaceholder: 'Vul je naam in',
        submit: 'Datums kiezen',
      },

      mark: {
        title: 'Wanneer kun jij?',
        greeting: 'Hoi <name>{{name}}</name>! Tik of sleep over de dagen waarop je kunt.',
        selectAll: 'Alles selecteren',
        clearAll: 'Alles wissen',
        legendAvailable: 'Beschikbaar',
        legendNotSelected: 'Niet gekozen',
        save: 'Datums opslaan',
        saving: 'Opslaan…',
        noChanges: 'Geen wijzigingen',
      },

      withdraw: {
        label: 'Afmelden voor deze reis',
        confirmTitle: 'Afmelden voor deze reis?',
        confirmBody:
          'De dagen die je hebt gekozen verdwijnen uit {{trip}} en de groep ziet je niet meer als deelnemer. Je kunt later met dezelfde naam opnieuw meedoen, maar dan ben je je datums kwijt.',
        cancel: 'Blijven',
        confirm: 'Afmelden',
      },

      group: {
        title: 'Wie kan wanneer?',
        showingAll: 'Je ziet iedereen',
        filteredTo: 'Alleen: {{names}}',
        noOne: 'Niemand',
        everyone: 'Iedereen',
      },

      participants: {
        title: 'Deelnemers',
        hint: 'Tik op namen om te filteren, of op het potlood om iemands datums aan te passen',
      },

      leaveEditor: {
        title: 'Niet-opgeslagen dagen weggooien?',
        switchBody: 'Je hebt dagen voor {{current}} gekozen, maar nog niet opgeslagen. Pas je de datums van {{other}} aan, dan zie je dat antwoord en ben je je eigen wijzigingen kwijt.',
        backBody: 'Je hebt dagen voor {{current}} gekozen, maar nog niet opgeslagen. Ga je terug naar het overzicht, dan ben je ze kwijt.',
        keep: 'Verder met {{name}}',
        discardBack: 'Weggooien en teruggaan',
      },

      toast: {
        linkCopiedTitle: 'Link gekopieerd!',
        linkCopiedBody: 'Stuur hem naar je vrienden.',
        copyFailedTitle: 'Kopiëren mislukt',
        copyFailedBody: 'Kopieer de link dan uit de adresbalk van je browser.',
        savedTitle: 'Opgeslagen!',
        savedBody: 'Je datums zijn bijgewerkt.',
        saveErrorTitle: 'Opslaan mislukt',
        conflictTitle: 'Intussen aangepast',
        conflictBody: 'Het antwoord van {{name}} is intussen op een ander apparaat aangepast. Jouw keuzes staan er nog; sla opnieuw op om het te overschrijven, of kijk eerst wat de groep ziet.',
        nameTakenTitle: 'Naam al in gebruik',
        nameTakenBody: 'Iemand anders heeft deze naam al.',
        renamedTitle: 'Naam gewijzigd!',
        renamedBody: 'Je heet nu {{name}}.',
        renameErrorTitle: 'Naam wijzigen mislukt',
        withdrawnTitle: 'Je bent afgemeld',
        withdrawnBody: 'Je datums zijn verwijderd.',
        withdrawErrorTitle: 'Afmelden mislukt',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} persoon kan',
      dayWithCount_other: '{{date}}, {{count}} mensen kunnen',
      nobodyFree: 'niemand kan',
      tapHint: 'Tik op een dag om te zien wie kan',
    },

    bestDates: {
      title: 'Beste datums',
      forNames: 'voor {{names}}',
      minHelp: 'Hoeveel dagen de reis minstens duurt.',
      minLabel: 'Min.:',
      minTitle: 'Minimaal aantal dagen',
      days_one: '{{count}} dag',
      days_other: '{{count}} dagen',
      ofPeopleFree_one: 'van {{count}} persoon kan',
      ofPeopleFree_other: 'van {{count}} mensen kunnen',
      empty: {
        noParticipantsTitle: 'Hier verschijnen de beste datums',
        noParticipantsBody: 'Stuur iedereen de link, dan verschijnen hun dagen hier',
        filteredTitle: 'Geen passende dagen voor {{names}}',
        filteredBody: 'Probeer het met meer mensen',
        nobodyMarkedTitle_one: 'Er doet iemand mee, maar nog niemand heeft dagen gekozen',
        nobodyMarkedTitle_other: 'Er doen al mensen mee, maar nog niemand heeft dagen gekozen',
        nobodyMarkedBody: 'Zodra iemand dat doet, zie je hier de beste datums',
        noOverlapTitle: 'Nog geen overlappende dagen',
        noOverlapBody: 'Er is nog geen dag waarop meer dan één persoon kan',
      },
    },

    participantsList: {
      emptyTitle: 'Nog niemand heeft gereageerd',
      emptyBody: 'Geef als eerste door wanneer je kunt!',
      daysAvailable_one: 'kan {{count}} dag',
      daysAvailable_other: 'kan {{count}} dagen',
    },

    tutorial: {
      show: 'Uitleg tonen',
      hide: 'Uitleg verbergen',
      organiserHeading: 'Zo werkt het',
      participantHeading: 'Zo doe je mee',
      organiser: {
        createTitle: 'Maak een reis aan',
        createBody: 'Kies een naam en een periode',
        shareTitle: 'Deel de link',
        shareBody: 'Stuur de link naar iedereen die mee wil',
        markTitle: 'Laat iedereen invullen',
        markBody: 'Iedereen tikt de dagen aan die passen en slaat ze op',
        pickTitle: 'Kies de beste datums',
        pickBody: 'Bekijk wanneer de meeste mensen kunnen',
      },
      participant: {
        markTitle: 'Kies de dagen waarop je kunt',
        markBody: 'Tik op een dag, of sleep over meerdere',
        saveTitle: 'Opslaan',
        saveBody: 'De groep ziet je datums meteen',
        watchTitle: 'Volg de uitkomst',
        watchBody: '‘Beste datums’ past zich aan zodra meer mensen reageren',
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
