import type { LocaleSeo } from './types';

const fr: LocaleSeo = {
  locale: 'fr',
  contentUpdated: '2026-09-23',
  home: {
    title: 'Trouver une date pour partir à plusieurs, sans compte',
    description:
      'Sondage de dates gratuit pour un voyage entre amis : partage un lien, chacun coche ses jours libres, WeGoWhen trouve les dates qui arrangent le plus de monde.',
  },
  landing: {
    slug: 'alternative-framadate',
    title: 'Alternative à Framadate pour trouver les dates d’un voyage',
    description:
      'Framadate et Doodle font voter sur des dates proposées. WeGoWhen trouve les jours d’affilée où le plus d’amis sont libres. Gratuit, sans compte.',
    linkLabel: 'Alternative à Framadate',
    heading: 'Une alternative à Framadate pensée pour les voyages',
    standfirst:
      'Framadate et Doodle font voter sur une liste de dates ou de créneaux proposés. WeGoWhen part des jours où chacun est libre et trouve la période de jours consécutifs qui convient au plus de monde, gratuitement et sans compte.',
    sections: [
      {
        heading: 'Tu cherches où créer ton sondage de dates ?',
        paragraphs: [
          'L’ancienne version de Framadate n’accepte plus de nouveaux sondages depuis avril 2026, et Framasoft a annoncé que les anciens sondages resteraient consultables six mois, jusqu’en septembre 2026. Une nouvelle version est en ligne sur framadate.org : pour caler une réunion, c’est la suite logique.',
          'Mais si ton sondage servait à choisir les dates d’un week-end ou de vacances entre amis, c’est peut-être le moment d’essayer un outil conçu pour ça.',
        ],
      },
      {
        heading: 'Un sondage fait voter sur des options, un voyage se joue sur des jours d’affilée',
        paragraphs: [
          'Sur Framadate comme sur Doodle, l’organisateur propose des dates, parfois avec des horaires, et chacun vote option par option. On obtient un décompte par option.',
          'Pour un voyage, ce qui compte n’est pas un jour isolé mais une période continue, du vendredi au lundi par exemple. Avec un vote par date, c’est à toi de recoller les morceaux et de deviner quelle suite de jours arrange le plus de monde.',
        ],
      },
      {
        heading: 'Comment fonctionne WeGoWhen',
        paragraphs: [
          'Tu crées un voyage avec un nom et une période large, jusqu’à 366 jours, puis tu partages un seul lien. Chacun saisit son prénom, sans compte ni e-mail, et coche les jours où il est libre en appuyant dessus ou en faisant glisser, sur téléphone comme sur ordinateur.',
          'WeGoWhen calcule ensuite toutes les suites de jours consécutifs qu’un groupe de personnes peut faire ensemble, écarte celles qu’une période plus longue couvre déjà, et les classe par nombre de personnes, puis par durée, puis par date : « 6 sur 6 disponibles, ven. 12 – lun. 15 ».',
          'Une carte de chaleur montre combien de personnes sont libres chaque jour, et tu peux filtrer sur une partie du groupe pour voir ce qui marche sans ceux qui hésitent encore.',
        ],
      },
      {
        heading: 'Gratuit, sans compte, pour tout le monde',
        paragraphs: [
          'Il n’y a ni offre payante ni publicité, et personne ne crée de compte, pas même l’organisateur. Un voyage accepte jusqu’à 200 participants. Tout se passe dans le navigateur, sans rien à installer, et l’interface existe en français, anglais, allemand, espagnol, néerlandais, polonais, japonais et coréen.',
          'À titre de comparaison, l’offre gratuite de Doodle est limitée et affiche des publicités ; ses formules Pro et Team coûtent 11 et 16 dollars US par utilisateur et par mois, en facturation annuelle, et il faut un compte pour créer un sondage.',
        ],
      },
      {
        heading: 'Quand rester sur Framadate',
        paragraphs: [
          'Pour fixer une heure — une réunion, un rendez-vous, une assemblée d’association —, Framadate ou un autre sondage de réunion reste le bon outil. WeGoWhen ne gère que des jours entiers : pas de créneaux horaires, pas de synchronisation d’agenda, pas de notifications ni de rappels.',
          'Framadate est aussi porté par Framasoft, une association française à but non lucratif engagée pour le logiciel libre. Si ces valeurs comptent pour toi, ou si tu tiens à un outil que l’on peut héberger soi-même, c’est une vraie raison de rester chez eux.',
        ],
      },
    ],
    comparison: {
      competitor: 'Framadate',
      rows: [
        {
          aspect: 'Ce qu’on choisit',
          them: 'Une date et une heure parmi les options proposées',
          us: 'Une période de jours consécutifs',
        },
        {
          aspect: 'Ce que prépare l’organisateur',
          them: 'La liste des dates et horaires soumis au vote',
          us: 'Un nom et une période de 366 jours maximum',
        },
        {
          aspect: 'Ce qu’on obtient',
          them: 'Les votes par option, des graphiques et un export tableur',
          us: 'Les périodes classées par nombre de personnes, durée puis date, et une carte de chaleur',
        },
        { aspect: 'Compte', them: 'Aucun', us: 'Aucun, pour personne' },
        { aspect: 'Prix', them: 'Gratuit', us: 'Gratuit, sans offre payante ni publicité' },
        { aspect: 'Créneaux horaires', them: 'Oui', us: 'Non, uniquement des jours entiers' },
        { aspect: 'Taille du groupe', them: 'Non précisée', us: 'Jusqu’à 200 participants' },
        {
          aspect: 'Qui le propose',
          them: 'Framasoft, association française à but non lucratif',
          us: 'Janek, qui l’a créé',
        },
      ],
      checked: 'Colonne Framadate vérifiée sur framadate.org le 23 septembre 2026.',
    },
    questions: [
      {
        question: 'Quelle alternative à Framadate pour organiser un voyage ?',
        answer:
          'Pour un voyage, WeGoWhen fonctionne autrement qu’un sondage : chacun coche les jours où il est libre, et l’outil trouve les périodes de jours consécutifs qui conviennent au plus de monde. C’est gratuit et sans compte. Pour fixer l’heure d’une réunion, la nouvelle version de Framadate reste l’outil adapté.',
      },
      {
        question: 'Framadate fonctionne-t-il encore ?',
        answer:
          'Oui, une nouvelle version de Framadate est en ligne sur framadate.org. L’ancienne version n’accepte plus de nouveaux sondages depuis avril 2026, et Framasoft a annoncé que les anciens sondages resteraient accessibles six mois, jusqu’en septembre 2026.',
      },
      {
        question: 'Comment trouver une date qui convient à tout le monde ?',
        answer:
          'Avec WeGoWhen, tu partages un lien, chacun indique ses jours libres sans créer de compte, et l’outil classe les périodes de jours consécutifs par nombre de personnes disponibles, puis par durée. Si aucune date ne convient à tous, tu vois celle qui réunit le plus de monde.',
      },
      {
        question: 'Existe-t-il un Doodle gratuit sans publicité ?',
        answer:
          'L’offre gratuite de Doodle est limitée et affiche des publicités. WeGoWhen est entièrement gratuit, sans publicité ni compte, mais il sert à choisir des jours pour un voyage, pas un horaire de réunion.',
      },
      {
        question: 'Faut-il un compte pour utiliser WeGoWhen ?',
        answer:
          'Non, ni pour l’organisateur ni pour les participants. Sur WeGoWhen, chacun saisit simplement un prénom pour indiquer ses disponibilités.',
      },
      {
        question: 'Combien de personnes peuvent répondre à un même voyage ?',
        answer:
          'Un voyage WeGoWhen accepte jusqu’à 200 participants, sur une période de 366 jours au maximum.',
      },
    ],
  },
};

export default fr;
