import type { LocaleSeo } from './types';

/**
 * Polish, informal "ty", "wyjazd" for a trip, "dni" for what people mark and "termin" for
 * the result ("Najlepsze terminy"), matching the app. No gendered past tense aimed at the
 * reader, and participant names are never declined.
 *
 * The landing page answers the searches Poles make for this job: "doodle ankieta"
 * (210/mo), "when2meet" (880/mo), "kiedy się spotkamy" (110/mo). Doodle facts checked on
 * doodle.com 2026-08-31, When2meet facts on when2meet.com 2026-08-28.
 */
const pl: LocaleSeo = {
  locale: 'pl',
  contentUpdated: '2026-09-23',
  home: {
    title: 'Ustal termin wyjazdu ze znajomymi – za darmo | WeGoWhen',
    description:
      'Sprawdź, kiedy wszyscy mają wolne. Wyślij znajomym jeden link, każdy zaznacza swoje dni, a WeGoWhen pokaże wspólny termin. Za darmo, bez rejestracji.',
  },
  landing: {
    slug: 'alternatywa-dla-doodle',
    title: 'Alternatywa dla Doodle do ustalania terminu wyjazdu | WeGoWhen',
    description:
      'Ankieta w Doodle pomaga wybrać godzinę spotkania. Na wyjazd potrzeba kilku dni z rzędu – WeGoWhen je znajdzie. Za darmo, bez konta i bez reklam.',
    linkLabel: 'Alternatywa dla Doodle',
    heading: 'Alternatywa dla Doodle, kiedy ustalacie termin wyjazdu',
    standfirst:
      'Doodle i When2meet pomagają wybrać jeden termin spotkania. Przy wyjeździe chodzi o coś innego: o kilka dni z rzędu, w które może pojechać jak najwięcej osób.',
    sections: [
      {
        heading: 'Ankieta w Doodle a termin wyjazdu',
        paragraphs: [
          'W Doodle organizator najpierw układa listę propozycji, a reszta na nie głosuje. Wynik to liczba głosów przy każdej propozycji. Przy wyjeździe trudno jednak z góry zgadnąć, które kilka dni będzie pasować – a jeśli dobrego terminu nie ma na liście, ankieta go nie pokaże.',
          'When2meet działa inaczej, ale też myśli godzinami: przy tworzeniu wymaga przedziału godzin „od–do”, więc na wyjazd trzeba ustawić od północy do północy, a potem samemu odczytywać zacieniowaną siatkę.',
        ],
      },
      {
        heading: 'Jak działa WeGoWhen',
        paragraphs: [
          'Jedna osoba tworzy wyjazd: wpisuje nazwę i przedział dat, w którym mógłby się odbyć. Potem wysyła jeden link – na WhatsAppie, Messengerze albo tam, gdzie pisze wasza ekipa.',
          'Każdy otwiera link, wpisuje imię i zaznacza dni, w które ma wolne – dotykiem albo przeciągając, na telefonie lub komputerze. Nikt nie zakłada konta ani nie podaje maila, organizator też nie.',
        ],
      },
      {
        heading: 'Co dostajesz: gotowe terminy zamiast liczenia głosów',
        paragraphs: [
          'WeGoWhen wylicza wszystkie ciągi kolejnych dni, w których jakaś grupa osób może być od początku do końca, pomija te, które zawiera już dłuższy ciąg, i układa je według liczby osób, potem długości, a potem daty.',
          'Mapa dostępności pokazuje, ile osób ma wolne każdego dnia, a filtr pozwala sprawdzić terminy tylko dla części ekipy. Całość jest za darmo, bez płatnych planów i reklam, do 200 osób na wyjazd.',
        ],
      },
      {
        heading: 'Kiedy lepiej wybrać Doodle',
        paragraphs: [
          'Jeśli umawiasz spotkanie, rozmowę albo kolację na konkretną godzinę, lepszy będzie Doodle albo When2meet. WeGoWhen zna tylko całe dni, bez godzin.',
          'WeGoWhen nie łączy się też z kalendarzem, nie wysyła powiadomień ani przypomnień i działa wyłącznie w przeglądarce. Jeśli tego potrzebujesz, sięgnij po inne narzędzie.',
        ],
      },
    ],
    comparison: {
      competitor: 'Doodle',
      rows: [
        {
          aspect: 'Do czego służy',
          them: 'Umawianie spotkań i wizyt',
          us: 'Ustalanie terminu wyjazdu',
        },
        {
          aspect: 'Co tworzy organizator',
          them: 'Listę propozycji do głosowania',
          us: 'Wyjazd z nazwą i przedziałem dat – bez propozycji',
        },
        {
          aspect: 'Co dostajesz',
          them: 'Liczbę głosów przy każdej propozycji',
          us: 'Ciągi kolejnych dni ułożone według liczby osób, długości i daty oraz mapę dostępności',
        },
        {
          aspect: 'Darmowa wersja',
          them: 'Jedna ankieta grupowa, jedna strona rezerwacji i jedno spotkanie 1:1, z reklamami',
          us: 'Wszystko za darmo, bez reklam, do 200 osób na wyjazd',
        },
        {
          aspect: 'Płatne plany',
          them: 'Pro 11 USD i Team 16 USD za osobę miesięcznie, przy płatności rocznej',
          us: 'Brak',
        },
        {
          aspect: 'Konto do utworzenia',
          them: 'Wymagane',
          us: 'Niepotrzebne',
        },
        {
          aspect: 'Konto do odpowiedzi',
          them: 'Niepotrzebne',
          us: 'Niepotrzebne',
        },
        {
          aspect: 'Godziny',
          them: 'Tak – to narzędzie do umawiania spotkań',
          us: 'Nie – tylko całe dni',
        },
      ],
      checked: 'Dane Doodle sprawdzone na doodle.com 31 sierpnia 2026 r.',
    },
    questions: [
      {
        question: 'Czy jest darmowa alternatywa dla Doodle?',
        answer:
          'Do ustalania terminu wyjazdu tak: WeGoWhen jest w całości darmowy, bez płatnych planów, reklam i zakładania konta. Do umawiania spotkań na godzinę się nie nadaje.',
      },
      {
        question: 'Jak ustalić termin wyjazdu ze znajomymi?',
        answer:
          'Utwórz wyjazd w WeGoWhen z przedziałem możliwych dat i wyślij link ekipie. Każdy zaznacza dni, w które ma wolne, a w sekcji „Najlepsze terminy” widać ciągi dni pasujące największej liczbie osób.',
      },
      {
        question: 'Czy trzeba zakładać konto?',
        answer:
          'Nie. Ani organizator, ani pozostali nie zakładają konta i nie podają maila – wystarczy wpisać imię.',
      },
      {
        question: 'Kiedy się spotkamy? Jak sprawdzić, kiedy wszyscy mają wolne?',
        answer:
          'Wyślij wszystkim jeden link do wyjazdu w WeGoWhen. Mapa dostępności pokaże, ile osób ma wolne każdego dnia, a lista terminów – kiedy może pojechać najwięcej osób naraz.',
      },
      {
        question: 'Czym WeGoWhen różni się od When2meet?',
        answer:
          'When2meet wymaga przedziału godzin i pokazuje siatkę, którą trzeba odczytać samemu. WeGoWhen pyta tylko o dni i sam wylicza ciągi kolejnych dni, w które pasuje najwięcej osób.',
      },
      {
        question: 'Ile osób może dołączyć do wyjazdu?',
        answer:
          'Do jednego wyjazdu może dołączyć do 200 osób, a przedział dat może obejmować najwyżej 366 dni.',
      },
    ],
  },
};

export default pl;
