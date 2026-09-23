import { fr as dateLocale } from 'date-fns/locale/fr';

import type { LocaleBundle } from '../types';

/** French (France). Informal "tu" throughout, "voyage" for trip, "prénom" for the name people type. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Chargement…',
      logoAlt: 'Logo WeGoWhen',
      genericError: 'Oups, quelque chose n’a pas marché. Réessaie.',
      editDates: 'Modifier les dates de {{name}}',
      language: 'Langue',
    },

    home: {
      title: 'Trouve les jours où ton groupe peut vraiment partir',
      subtitle: 'Organise un voyage entre amis en voyant d’un coup d’œil quand tout le monde est libre',
      freeNote: 'Gratuit, sans compte, et tes amis n’ont besoin de s’inscrire nulle part.',
      footer: {
        tagline: 'Choisir les dates d’un voyage entre amis. Pas de compte, juste un lien.',
        project: 'Projet',
        about: 'À propos',
        contact: 'Contact',
        learn: 'En savoir plus',
        faq: 'FAQ',
        when2meet: 'Alternative à When2meet',
        doodle: 'Alternative à Doodle',
        legal: 'Informations légales',
        terms: 'Conditions d’utilisation',
        privacy: 'Politique de confidentialité',
        closing: 'Partage le lien. Coche tes dates. Pars à l’aventure.',
        languages: 'Langues',
      },
    },

    landing: {
      home: 'Accueil',
      ctaTitle: 'Trouve les jours où ton groupe peut vraiment partir',
      ctaBody: 'Gratuit, sans compte, rien à installer.',
      ctaButton: 'Créer un voyage',
    },

    createTrip: {
      title: 'Organise ton voyage',
      description: 'Crée un voyage et envoie le lien à tes amis pour trouver les meilleures dates',
      nameLabel: 'Nom du voyage',
      namePlaceholder: 'Vacances d’été 2026',
      startLabel: 'Date de début',
      startPlaceholder: 'Date de début',
      endLabel: 'Date de fin',
      endPlaceholder: 'Date de fin',
      submit: 'Créer le voyage',
      submitting: 'Création…',
      invalidDatesTitle: 'Dates invalides',
      invalidDatesBody: 'La date de fin doit être après la date de début.',
      errorTitle: 'Impossible de créer le voyage',
      tooLongTitle: 'Période trop longue',
      tooLongBody_one: 'La période d’un voyage ne peut pas dépasser {{count}} jour.',
      tooLongBody_other: 'La période d’un voyage ne peut pas dépasser {{count}} jours.',
    },

    dateInput: {
      placeholder: 'Choisir une date',
    },

    recentTrips: {
      title: 'Tes voyages',
      description:
        'Les voyages ouverts dans ce navigateur. Enregistrés uniquement ici — ni sur nos serveurs, ni sur tes autres appareils.',
      untitled: 'Voyage sans nom',
      yours: 'Créé par toi',
      open: 'Ouvrir {{name}}',
      openWithRange: 'Ouvrir {{name}}, {{range}}',
      remove: 'Retirer {{name}} de cette liste',
    },

    notFound: {
      message: 'Oups ! Page introuvable',
      home: 'Retour à l’accueil',
    },
    errorBoundary: {
      title: 'Un problème est survenu',
      body: 'Cette page a rencontré une erreur. Tes dates enregistrées sont en sécurité sur le serveur ; recharger la page suffit en général.',
      reload: 'Recharger',
    },

    trip: {
      loading: 'Chargement du voyage…',
      loadErrorTitle: 'Impossible de charger ce voyage',
      loadErrorBody:
        'Le voyage va sûrement très bien — on n’arrive simplement pas à le joindre. Vérifie ta connexion et réessaie.',
      tryAgain: 'Réessayer',
      createNew: 'Créer un nouveau voyage',
      notFoundTitle: 'Voyage introuvable',
      notFoundBody: 'Ce voyage n’existe pas ou a été supprimé.',
      share: 'Partager',
      shareLink: 'Partager le lien',
      copied: 'Copié !',
      back: 'Retour au voyage',
      participantCount_one: '{{count}} participant',
      participantCount_other: '{{count}} participants',

      join: {
        title: 'Rejoindre ce voyage',
        body: 'Ton prénom s’affiche sur les jours que tu choisis, pour que chacun voie qui est libre et quand. Pas de compte, pas d’e-mail.',
        nameLabel: 'Ton prénom',
        namePlaceholder: 'Saisis ton prénom',
        submit: 'Indiquer mes dates',
      },

      mark: {
        title: 'Indique tes disponibilités',
        greeting:
          'Salut <name>{{name}}</name> ! Appuie sur les jours où tu es libre, ou fais glisser pour en cocher plusieurs.',
        selectAll: 'Tout sélectionner',
        clearAll: 'Tout effacer',
        legendAvailable: 'Disponible',
        legendNotSelected: 'Non sélectionné',
        save: 'Enregistrer mes dates',
        saving: 'Enregistrement…',
        noChanges: 'Aucune modification',
      },

      withdraw: {
        label: 'Me retirer du voyage',
        confirmTitle: 'Te retirer de ce voyage ?',
        confirmBody:
          'Les jours que tu as cochés seront supprimés de {{trip}}, et le groupe ne te comptera plus parmi les participants. Tu pourras revenir plus tard avec le même prénom, mais tes dates auront disparu.',
        cancel: 'Rester dans le voyage',
        confirm: 'Me retirer',
      },

      group: {
        title: 'Disponibilités du groupe',
        showingAll: 'Tous les participants sont affichés',
        filteredTo: 'Filtré sur : {{names}}',
        noOne: 'Personne',
        everyone: 'Tout le monde',
      },

      participants: {
        title: 'Participants',
        hint: 'Clique sur des prénoms pour filtrer le groupe, ou sur le crayon pour modifier les dates de quelqu’un',
      },

      leaveEditor: {
        title: 'Abandonner les jours non enregistrés ?',
        switchBody:
          'Tu as coché des jours en tant que {{current}} sans les enregistrer. Modifier les dates de {{other}} charge sa réponse à la place, et tes sélections non enregistrées seront perdues.',
        backBody:
          'Tu as coché des jours en tant que {{current}} sans les enregistrer. Si tu reviens au voyage, ils seront perdus.',
        keep: 'Continuer en tant que {{name}}',
        discardBack: 'Abandonner et revenir',
      },

      toast: {
        linkCopiedTitle: 'Lien copié !',
        linkCopiedBody: 'Envoie ce lien à tes amis.',
        copyFailedTitle: 'Impossible de copier le lien',
        copyFailedBody: 'Copie-le plutôt depuis la barre d’adresse de ton navigateur.',
        savedTitle: 'Disponibilités enregistrées !',
        savedBody: 'Tes dates ont été mises à jour.',
        saveErrorTitle: 'Erreur lors de l’enregistrement',
        conflictTitle: 'Ces dates ont changé entre-temps',
        conflictBody:
          'La réponse de {{name}} a été modifiée depuis un autre appareil. Tes sélections sont toujours là : enregistre à nouveau pour la remplacer, ou jette d’abord un œil aux disponibilités du groupe.',
        nameTakenTitle: 'Prénom déjà pris',
        nameTakenBody: 'Quelqu’un utilise déjà ce prénom.',
        renamedTitle: 'Prénom modifié !',
        renamedBody: 'Tu apparais désormais sous le nom {{name}}.',
        renameErrorTitle: 'Impossible de modifier le prénom',
        withdrawnTitle: 'Tu ne participes plus au voyage',
        withdrawnBody: 'Tes disponibilités ont été supprimées.',
        withdrawErrorTitle: 'Impossible de te retirer du voyage',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} disponible',
      dayWithCount_other: '{{date}}, {{count}} disponibles',
      nobodyFree: 'personne n’est libre',
      tapHint: 'Touche un jour pour voir qui est libre',
    },

    bestDates: {
      title: 'Meilleures dates',
      forNames: 'pour {{names}}',
      minHelp: 'Nombre minimum de jours d’affilée.',
      minLabel: 'Min :',
      minTitle: 'Jours minimum',
      days_one: '{{count}} jour',
      days_other: '{{count}} jours',
      ofPeopleFree_one: 'sur {{count}} personne disponible',
      ofPeopleFree_other: 'sur {{count}} personnes disponibles',
      empty: {
        noParticipantsTitle: 'Les meilleures dates s’afficheront ici',
        noParticipantsBody: 'Envoie le lien à tout le monde : leurs jours apparaîtront au fil des réponses',
        filteredTitle: 'Aucun jour ne convient à {{names}}',
        filteredBody: 'Essaie d’inclure plus de monde',
        nobodyMarkedTitle_one: 'Quelqu’un a rejoint le voyage, mais personne n’a encore coché de jours',
        nobodyMarkedTitle_other: 'Des participants ont rejoint le voyage, mais personne n’a encore coché de jours',
        nobodyMarkedBody: 'Les meilleures dates apparaîtront dès que quelqu’un l’aura fait',
        noOverlapTitle: 'Aucun jour en commun pour l’instant',
        noOverlapBody: 'Personne n’est libre le même jour pour le moment',
      },
    },

    participantsList: {
      emptyTitle: 'Personne n’a encore répondu',
      emptyBody: 'Lance-toi : indique tes disponibilités en premier !',
      daysAvailable_one: '{{count}} jour disponible',
      daysAvailable_other: '{{count}} jours disponibles',
    },

    tutorial: {
      show: 'Afficher le tutoriel',
      hide: 'Masquer le tutoriel',
      organiserHeading: 'Comment ça marche',
      participantHeading: 'Ce qu’il faut faire',
      organiser: {
        createTitle: 'Crée un voyage',
        createBody: 'Donne-lui un nom et une période',
        shareTitle: 'Partage le lien',
        shareBody: 'Envoie le lien du voyage à tous les participants',
        markTitle: 'Chacun coche et enregistre ses dates',
        markBody: 'Tout le monde sélectionne les jours où il est libre',
        pickTitle: 'Choisis les meilleures dates',
        pickBody: 'Repère les jours où le plus de monde est libre',
      },
      participant: {
        markTitle: 'Coche les jours où tu peux partir',
        markBody: 'Appuie sur un jour, ou fais glisser sur plusieurs',
        saveTitle: 'Enregistre',
        saveBody: 'Le groupe voit tes dates tout de suite',
        watchTitle: 'Suis l’évolution',
        watchBody: 'Les meilleures dates se mettent à jour au fil des réponses',
      },
    },

    feedback: {
      bug: {
        label: 'Signaler un bug',
        intro:
          'Salut, moi c’est Janek, j’ai créé WeGoWhen. Si quelque chose a planté ou t’a paru bizarre, je te serais vraiment reconnaissant de me le dire. Chaque signalement m’aide.',
        placeholder: 'Que s’est-il passé, et à quoi t’attendais-tu ?',
      },
      feature: {
        label: 'Suggérer une fonctionnalité',
        intro:
          'Salut, moi c’est Janek, j’ai créé WeGoWhen. Il te manque quelque chose ? Je lis attentivement chaque demande, et la plupart finissent dans l’appli.',
        placeholder: 'Qu’est-ce qui te faciliterait l’organisation ?',
      },
      emailLabel: 'Ton e-mail (facultatif)',
      emailPlaceholder: 'E-mail pour te répondre (facultatif)',
      send: 'Envoyer',
      thanks: 'Merci ! Ton message est bien parti, il arrive directement chez moi.',
      failed: 'Impossible d’envoyer ton message. Vérifie ta connexion et réessaie.',
    },
  },
} satisfies LocaleBundle;
