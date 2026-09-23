import { pl as dateLocale } from 'date-fns/locale/pl';

import type { LocaleBundle } from '../types';

/** Polish. Informal "ty" throughout, "wyjazd" for a trip, and no gendered past tense aimed at the user. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Ładowanie…',
      logoAlt: 'Logo WeGoWhen',
      genericError: 'Coś poszło nie tak. Spróbuj ponownie.',
      editDates: 'Edytuj dni: {{name}}',
      language: 'Język',
    },

    home: {
      title: 'Znajdź dni, w które cała ekipa może jechać',
      subtitle: 'Planuj wyjazdy ze znajomymi i sprawdź, kiedy wszyscy mają wolne',
      freeNote: 'Za darmo, bez konta – a znajomi nie muszą się nigdzie rejestrować.',
      footer: {
        tagline: 'Ustalcie termin wyjazdu ze znajomymi. Bez kont, wystarczy link.',
        project: 'Projekt',
        about: 'O nas',
        contact: 'Kontakt',
        learn: 'Więcej',
        faq: 'FAQ',
        when2meet: 'Alternatywa dla When2meet',
        doodle: 'Alternatywa dla Doodle',
        legal: 'Informacje prawne',
        terms: 'Regulamin',
        privacy: 'Polityka prywatności',
        closing: 'Wyślij link. Zaznacz dni. Ruszaj w drogę.',
        languages: 'Języki',
      },
    },

    landing: {

      home: 'Strona główna',

      ctaTitle: 'Znajdź dni, w które cała ekipa może jechać',

      ctaBody: 'Za darmo, bez konta i bez instalowania.',

      ctaButton: 'Utwórz wyjazd',

    },


    createTrip: {
      title: 'Zaplanuj wyjazd',
      description: 'Utwórz wyjazd i wyślij link znajomym, żeby znaleźć najlepszy termin',
      nameLabel: 'Nazwa wyjazdu',
      namePlaceholder: 'Mazury 2026',
      startLabel: 'Początek',
      startPlaceholder: 'Pierwszy dzień',
      endLabel: 'Koniec',
      endPlaceholder: 'Ostatni dzień',
      submit: 'Utwórz wyjazd',
      submitting: 'Tworzenie…',
      invalidDatesTitle: 'Nieprawidłowe daty',
      invalidDatesBody: 'Ostatni dzień nie może być wcześniejszy niż pierwszy.',
      errorTitle: 'Nie udało się utworzyć wyjazdu',
      tooLongTitle: 'Za długi wyjazd',
      tooLongBody_one: 'Wyjazd może trwać najwyżej {{count}} dzień.',
      tooLongBody_few: 'Wyjazd może trwać najwyżej {{count}} dni.',
      tooLongBody_many: 'Wyjazd może trwać najwyżej {{count}} dni.',
      tooLongBody_other: 'Wyjazd może trwać najwyżej {{count}} dnia.',
    },

    dateInput: {
      placeholder: 'Wybierz datę',
    },

    recentTrips: {
      title: 'Twoje wyjazdy',
      description:
        'Wyjazdy otwierane w tej przeglądarce. Lista jest zapisana tylko tutaj – nie na naszych serwerach i nie na twoich innych urządzeniach.',
      untitled: 'Wyjazd bez nazwy',
      yours: 'Twój',
      open: 'Otwórz: {{name}}',
      openWithRange: 'Otwórz: {{name}}, {{range}}',
      remove: 'Usuń z listy: {{name}}',
    },

    notFound: {
      message: 'Ups! Nie ma takiej strony',
      home: 'Wróć na stronę główną',
    },
    errorBoundary: {
      title: 'Coś poszło nie tak',
      body: 'Na tej stronie wystąpił błąd. Twoje zapisane dni są bezpieczne na serwerze – zwykle wystarczy odświeżyć stronę.',
      reload: 'Odśwież',
    },

    trip: {
      loading: 'Wczytywanie wyjazdu…',
      loadErrorTitle: 'Nie udało się wczytać wyjazdu',
      loadErrorBody:
        'Z wyjazdem najpewniej wszystko w porządku – po prostu nie udało się go pobrać. Sprawdź internet i spróbuj ponownie.',
      tryAgain: 'Spróbuj ponownie',
      createNew: 'Utwórz nowy wyjazd',
      notFoundTitle: 'Nie znaleziono wyjazdu',
      notFoundBody: 'Ten wyjazd nie istnieje albo został usunięty.',
      share: 'Wyślij',
      shareLink: 'Udostępnij link',
      copied: 'Skopiowano!',
      back: 'Wróć do wyjazdu',
      participantCount_one: '{{count}} osoba',
      participantCount_few: '{{count}} osoby',
      participantCount_many: '{{count}} osób',
      participantCount_other: '{{count}} osoby',

      join: {
        title: 'Dołącz do wyjazdu',
        body: 'Twoje imię pojawi się przy wybranych dniach, żeby wszyscy widzieli, kto kiedy może. Bez konta i bez maila.',
        nameLabel: 'Twoje imię',
        namePlaceholder: 'Wpisz swoje imię',
        submit: 'Zaznacz moje dni',
      },

      mark: {
        title: 'Zaznacz, kiedy możesz',
        greeting: 'Cześć, <name>{{name}}</name>! Zaznacz dni, w które masz wolne – dotknij albo przeciągnij.',
        selectAll: 'Zaznacz wszystko',
        clearAll: 'Wyczyść',
        legendAvailable: 'Wolne',
        legendNotSelected: 'Niezaznaczone',
        save: 'Zapisz dni',
        saving: 'Zapisywanie…',
        noChanges: 'Brak zmian',
      },

      withdraw: {
        label: 'Wypisz się z wyjazdu',
        confirmTitle: 'Wypisać się z wyjazdu?',
        confirmBody:
          'Twoje zaznaczone dni znikną z wyjazdu „{{trip}}”, a grupa nie będzie już widzieć, że jedziesz. Możesz później dołączyć ponownie pod tym samym imieniem, ale zaznaczone dni przepadną.',
        cancel: 'Zostaję',
        confirm: 'Wypisz się',
      },

      group: {
        title: 'Kto kiedy może',
        showingAll: 'Wszyscy uczestnicy',
        filteredTo: 'Tylko: {{names}}',
        noOne: 'Nikt',
        everyone: 'Wszyscy',
      },

      participants: {
        title: 'Uczestnicy',
        hint: 'Kliknij osobę, żeby filtrować, albo ołówek, żeby zmienić jej dni',
      },

      leaveEditor: {
        title: 'Odrzucić niezapisane zmiany?',
        switchBody:
          'Jako {{current}} masz zaznaczone dni, które nie są zapisane. Jeśli przejdziesz do dni osoby {{other}}, wczyta się jej odpowiedź, a twoje niezapisane zmiany przepadną.',
        backBody: 'Jako {{current}} masz zaznaczone dni, które nie są zapisane. Po powrocie do widoku wyjazdu przepadną.',
        keep: 'Edytuj dalej jako {{name}}',
        discardBack: 'Odrzuć i wróć',
      },

      toast: {
        linkCopiedTitle: 'Skopiowano link!',
        linkCopiedBody: 'Wyślij go znajomym.',
        copyFailedTitle: 'Nie udało się skopiować linku',
        copyFailedBody: 'Skopiuj go z paska adresu przeglądarki.',
        savedTitle: 'Dni zapisane!',
        savedBody: 'Twoje dni zostały zaktualizowane.',
        saveErrorTitle: 'Nie udało się zapisać',
        conflictTitle: 'W międzyczasie ktoś to zmienił',
        conflictBody:
          'Odpowiedź osoby {{name}} została zmieniona na innym urządzeniu. Twoje zaznaczenia nadal tu są – zapisz ponownie, żeby ją zastąpić, albo najpierw zajrzyj do widoku grupy.',
        nameTakenTitle: 'To imię jest już zajęte',
        nameTakenBody: 'Ktoś inny już go używa.',
        renamedTitle: 'Zmieniono imię!',
        renamedBody: 'Teraz występujesz jako {{name}}.',
        renameErrorTitle: 'Nie udało się zmienić imienia',
        withdrawnTitle: 'Wypisano z wyjazdu',
        withdrawnBody: 'Twoje dni zostały usunięte.',
        withdrawErrorTitle: 'Nie udało się wypisać',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} osoba może',
      dayWithCount_few: '{{date}}, {{count}} osoby mogą',
      dayWithCount_many: '{{date}}, {{count}} osób może',
      dayWithCount_other: '{{date}}, {{count}} osoby może',
      nobodyFree: 'nikt nie może',
      tapHint: 'Dotknij dnia, żeby zobaczyć, kto może',
    },

    bestDates: {
      title: 'Najlepsze terminy',
      forNames: 'dla: {{names}}',
      minHelp: 'Minimalna długość wyjazdu.',
      minLabel: 'Min.:',
      minTitle: 'Minimalna liczba dni',
      days_one: '{{count}} dzień',
      days_few: '{{count}} dni',
      days_many: '{{count}} dni',
      days_other: '{{count}} dnia',
      // Screen-reader completion of "3/5": "3 z 5 osób". Verbless on purpose: the verb
      // would have to agree with the first number, which this string never sees.
      ofPeopleFree_one: 'z {{count}} osoby',
      ofPeopleFree_few: 'z {{count}} osób',
      ofPeopleFree_many: 'z {{count}} osób',
      ofPeopleFree_other: 'z {{count}} osoby',
      empty: {
        noParticipantsTitle: 'Tu pojawią się najlepsze terminy',
        noParticipantsBody: 'Wyślij link wszystkim – ich dni pojawią się tutaj',
        filteredTitle: 'Brak wspólnych dni dla: {{names}}',
        filteredBody: 'Spróbuj dodać więcej osób',
        nobodyMarkedTitle_one: 'Ktoś już dołączył, ale nie zaznaczył jeszcze dni',
        nobodyMarkedTitle_few: 'Są już chętni, ale nikt nie zaznaczył jeszcze dni',
        nobodyMarkedTitle_many: 'Są już chętni, ale nikt nie zaznaczył jeszcze dni',
        nobodyMarkedTitle_other: 'Są już chętni, ale nikt nie zaznaczył jeszcze dni',
        nobodyMarkedBody: 'Najlepsze terminy pojawią się, gdy tylko ktoś zaznaczy dni',
        noOverlapTitle: 'Na razie brak wspólnych dni',
        noOverlapBody: 'Jak dotąd każdy ma wolne w inne dni',
      },
    },

    participantsList: {
      emptyTitle: 'Nikt jeszcze nie odpowiedział',
      emptyBody: 'Bądź pierwszą osobą, która zaznaczy dni!',
      daysAvailable_one: '{{count}} wolny dzień',
      daysAvailable_few: '{{count}} wolne dni',
      daysAvailable_many: '{{count}} wolnych dni',
      daysAvailable_other: '{{count}} wolnego dnia',
    },

    feedback: {
      bug: {
        label: 'Zgłoś błąd',
        intro:
          'Cześć, jestem Janek i to ja zrobiłem WeGoWhen. Jeśli coś nie działa albo wydaje się dziwne, będę bardzo wdzięczny, jeśli dasz mi znać. Każde zgłoszenie pomaga.',
        placeholder: 'Co się stało, a co powinno się stać?',
      },
      feature: {
        label: 'Zaproponuj funkcję',
        intro:
          'Cześć, jestem Janek i to ja zrobiłem WeGoWhen. Czegoś ci brakuje? Czytam każdą prośbę i większość z nich trafia do aplikacji.',
        placeholder: 'Co ułatwiłoby ci planowanie?',
      },
      emailLabel: 'Twój e-mail (opcjonalnie)',
      emailPlaceholder: 'E-mail, jeśli chcesz odpowiedź (opcjonalnie)',
      send: 'Wyślij',
      thanks: 'Dzięki! Wiadomość jest już w drodze do mnie.',
      failed: 'Nie udało się wysłać. Sprawdź połączenie i spróbuj ponownie.',
    },
    tutorial: {
      show: 'Jak to działa?',
      hide: 'Ukryj',
      organiserHeading: 'Jak to działa',
      participantHeading: 'Co dalej',
      organiser: {
        createTitle: 'Utwórz wyjazd',
        createBody: 'Podaj nazwę i zakres dat',
        shareTitle: 'Wyślij link',
        shareBody: 'Przekaż go wszystkim, którzy jadą',
        markTitle: 'Wszyscy zaznaczają dni',
        markBody: 'Każdy wybiera, kiedy może, i zapisuje',
        pickTitle: 'Wybierz termin',
        pickBody: 'Zobacz, kiedy może najwięcej osób',
      },
      participant: {
        markTitle: 'Zaznacz dni, w które możesz',
        markBody: 'Dotknij dnia albo przeciągnij po kilku',
        saveTitle: 'Zapisz',
        saveBody: 'Twoje dni od razu trafiają do grupy',
        watchTitle: 'Patrz, jak zmienia się wynik',
        watchBody: '„Najlepsze terminy” aktualizują się, gdy odpowiadają kolejne osoby',
      },
    },
  },
} satisfies LocaleBundle;
