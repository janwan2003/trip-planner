import { es as dateLocale } from 'date-fns/locale/es';

import type { LocaleBundle } from '../types';

/**
 * Spanish. Informal "tú" throughout: this is a tool friends send each other. Neutral
 * Latin-American-friendly wording (no "vosotros"), since the Spanish-speaking traffic
 * so far is from Paraguay as much as Spain.
 */
export default {
  dateLocale,
  messages: {
    common: {
      loading: 'Cargando…',
      logoAlt: 'Logo de WeGoWhen',
      genericError: 'Algo salió mal. Inténtalo de nuevo.',
      editDates: 'Editar las fechas de {{name}}',
      language: 'Idioma',
    },

    home: {
      title: 'Encuentra los días en que tu grupo sí puede ir',
      subtitle: 'Organiza viajes con amigos: mira cuándo pueden todos',
      freeNote: 'Gratis, sin cuenta y sin que tus amigos tengan que registrarse.',
      footer: {
        tagline: 'Elige fechas de viaje con amigos. Sin cuentas, solo un enlace.',
        project: 'Proyecto',
        about: 'Acerca de',
        contact: 'Contacto',
        learn: 'Más información',
        faq: 'Preguntas frecuentes',
        when2meet: 'Alternativa a When2meet',
        doodle: 'Alternativa a Doodle',
        legal: 'Legal',
        terms: 'Términos del servicio',
        privacy: 'Política de privacidad',
        closing: 'Comparte el enlace. Marca tus días. ¡Y a viajar!',
        languages: 'Idiomas',
      },
    },

    landing: {

      home: 'Inicio',

      ctaTitle: 'Encuentra los días en que tu grupo sí puede ir',

      ctaBody: 'Gratis, sin cuenta y sin instalar nada.',

      ctaButton: 'Crear un viaje',

    },


    createTrip: {
      title: 'Organiza tu viaje',
      description: 'Crea un viaje y comparte el enlace con tus amigos para encontrar las mejores fechas',
      nameLabel: 'Nombre del viaje',
      namePlaceholder: 'Escapada de verano 2026',
      startLabel: 'Fecha de inicio',
      startPlaceholder: 'Fecha de inicio',
      endLabel: 'Fecha de fin',
      endPlaceholder: 'Fecha de fin',
      submit: 'Crear viaje',
      submitting: 'Creando…',
      invalidDatesTitle: 'Fechas no válidas',
      invalidDatesBody: 'La fecha de fin debe ser posterior a la de inicio.',
      errorTitle: 'No se pudo crear el viaje',
      tooLongTitle: 'Viaje demasiado largo',
      tooLongBody_one: 'Un viaje puede durar como máximo {{count}} día.',
      tooLongBody_other: 'Un viaje puede durar como máximo {{count}} días.',
    },

    dateInput: {
      placeholder: 'Elige una fecha',
    },

    recentTrips: {
      title: 'Tus viajes',
      description:
        'Los viajes que abriste en este navegador. Solo se guardan aquí, no en nuestros servidores ni en tus otros dispositivos.',
      untitled: 'Viaje sin nombre',
      yours: 'Tuyo',
      open: 'Abrir {{name}}',
      openWithRange: 'Abrir {{name}}, {{range}}',
      remove: 'Quitar {{name}} de esta lista',
    },

    notFound: {
      message: '¡Uy! No encontramos esta página',
      home: 'Volver al inicio',
    },
    errorBoundary: {
      title: 'Algo salió mal',
      body: 'Algo falló en esta página. Tus fechas guardadas siguen a salvo en el servidor; recargar suele solucionarlo.',
      reload: 'Recargar',
    },

    trip: {
      loading: 'Cargando viaje…',
      loadErrorTitle: 'No se pudo cargar este viaje',
      loadErrorBody:
        'Seguramente el viaje está bien; es que no pudimos cargarlo. Revisa tu conexión e inténtalo de nuevo.',
      tryAgain: 'Reintentar',
      createNew: 'Crear un viaje nuevo',
      startOwn: {
        title: '¿Planeas algo más?',
        body: 'Crea tu propio viaje y envía el enlace a tu grupo. Lleva un minuto y nadie necesita una cuenta.',
        link: 'Crear mi propio viaje',
      },
      notFoundTitle: 'Viaje no encontrado',
      notFoundBody: 'Este viaje no existe o se ha eliminado.',
      share: 'Compartir',
      shareLink: 'Compartir enlace',
      copied: '¡Copiado!',
      back: 'Volver al viaje',
      participantCount_one: '{{count}} participante',
      participantCount_other: '{{count}} participantes',

      join: {
        title: 'Únete a este viaje',
        body: 'Tu nombre aparecerá junto a los días que marques, para que todos vean quién puede cuándo. Sin cuenta ni correo.',
        nameLabel: 'Tu nombre',
        namePlaceholder: 'Escribe tu nombre',
        submit: 'Marcar mis días',
      },

      mark: {
        title: 'Marca cuándo puedes',
        greeting: '¡Hola, <name>{{name}}</name>! Toca o arrastra para marcar los días que puedes.',
        selectAll: 'Marcar todo',
        clearAll: 'Borrar todo',
        legendAvailable: 'Disponible',
        legendNotSelected: 'Sin marcar',
        save: 'Guardar mis días',
        saving: 'Guardando…',
        noChanges: 'Sin cambios',
      },

      withdraw: {
        label: 'Salir del viaje',
        confirmTitle: '¿Salir de este viaje?',
        confirmBody:
          'Tus días marcados se borrarán de {{trip}} y el grupo ya no te contará. Podrás volver a unirte con el mismo nombre, pero tendrás que marcar tus días otra vez.',
        cancel: 'Quedarme',
        confirm: 'Salir',
      },

      group: {
        title: 'Disponibilidad del grupo',
        showingAll: 'Se muestra a todo el grupo',
        filteredTo: 'Solo: {{names}}',
        noOne: 'Nadie',
        everyone: 'Todos',
      },

      participants: {
        title: 'Participantes',
        hint: 'Toca a alguien para filtrar, o el lápiz para editar sus días',
      },

      leaveEditor: {
        title: '¿Descartar tus días sin guardar?',
        switchBody: 'Marcaste días como {{current}} y no los guardaste. Si editas los de {{other}}, se cargarán sus días y perderás esos cambios.',
        backBody: 'Marcaste días como {{current}} y no los guardaste. Si vuelves al viaje, se perderán.',
        keep: 'Seguir editando como {{name}}',
        discardBack: 'Descartar y volver',
      },

      toast: {
        linkCopiedTitle: '¡Enlace copiado!',
        linkCopiedBody: 'Ya puedes enviárselo a tus amigos.',
        copyFailedTitle: 'No se pudo copiar el enlace',
        copyFailedBody: 'Cópialo desde la barra de direcciones de tu navegador.',
        savedTitle: '¡Guardado!',
        savedBody: 'Tus días ya están actualizados.',
        saveErrorTitle: 'No se pudo guardar',
        conflictTitle: 'Alguien cambió estos días mientras tanto',
        conflictBody: 'Los días de {{name}} se cambiaron desde otro dispositivo. Tus cambios siguen aquí: guarda otra vez para reemplazarlos o revisa antes el calendario del grupo.',
        nameTakenTitle: 'Ese nombre ya está en uso',
        nameTakenBody: 'Otra persona del grupo ya lo usa.',
        renamedTitle: '¡Nombre actualizado!',
        renamedBody: 'Ahora apareces como {{name}}.',
        renameErrorTitle: 'No se pudo cambiar el nombre',
        withdrawnTitle: 'Saliste del viaje',
        withdrawnBody: 'Tus días se borraron.',
        withdrawErrorTitle: 'No se pudo salir del viaje',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} persona puede',
      dayWithCount_other: '{{date}}, {{count}} personas pueden',
      nobodyFree: 'nadie puede',
      tapHint: 'Toca un día para ver quién puede',
    },

    bestDates: {
      title: 'Mejores fechas',
      forNames: 'para {{names}}',
      minHelp: 'Duración mínima del viaje.',
      minLabel: 'Mín.:',
      minTitle: 'Mínimo de días',
      days_one: '{{count}} día',
      days_other: '{{count}} días',
      ofPeopleFree_one: 'de {{count}} persona puede',
      ofPeopleFree_other: 'de {{count}} personas pueden',
      empty: {
        noParticipantsTitle: 'Aquí aparecerán las mejores fechas',
        noParticipantsBody: 'Envía el enlace al grupo y aquí verás sus días',
        filteredTitle: 'Sin días posibles para {{names}}',
        filteredBody: 'Intenta incluir a más personas',
        nobodyMarkedTitle_one: 'Alguien se unió, pero aún no hay días marcados',
        nobodyMarkedTitle_other: 'Ya se unió gente, pero aún no hay días marcados',
        nobodyMarkedBody: 'Las mejores fechas aparecerán en cuanto alguien marque los suyos',
        noOverlapTitle: 'Todavía no hay días en común',
        noOverlapBody: 'Por ahora nadie coincide en ningún día',
      },
    },

    participantsList: {
      emptyTitle: 'Nadie ha respondido todavía',
      emptyBody: 'Empieza tú: marca tus días.',
      daysAvailable_one: '{{count}} día disponible',
      daysAvailable_other: '{{count}} días disponibles',
    },

    tutorial: {
      show: 'Ver tutorial',
      hide: 'Ocultar tutorial',
      organiserHeading: 'Cómo funciona',
      participantHeading: 'Qué hacer',
      organiser: {
        createTitle: 'Crea un viaje',
        createBody: 'Ponle un nombre y elige las fechas',
        shareTitle: 'Comparte el enlace',
        shareBody: 'Envía el enlace a todo el grupo',
        markTitle: 'Todos marcan sus días',
        markBody: 'Cada persona elige los días que puede y guarda',
        pickTitle: 'Elige las mejores fechas',
        pickBody: 'Mira cuándo puede la mayoría',
      },
      participant: {
        markTitle: 'Marca cuándo puedes ir',
        markBody: 'Toca un día o arrastra para marcar varios',
        saveTitle: 'Guarda tus días',
        saveBody: 'El grupo los ve al instante',
        watchTitle: 'Sigue los resultados',
        watchBody: '«Mejores fechas» se actualiza a medida que responde más gente',
      },
    },

    feedback: {
      bug: {
        label: 'Informar de un error',
        intro:
          'Hola, soy Janek y creé WeGoWhen. Si algo falló o no funcionó como esperabas, te agradecería mucho que me lo contaras. Cada aviso ayuda.',
        placeholder: '¿Qué pasó y qué esperabas?',
      },
      feature: {
        label: 'Sugerir una función',
        intro:
          'Hola, soy Janek y creé WeGoWhen. ¿Te falta algo? Leo cada sugerencia con atención y la mayoría terminan en la app.',
        placeholder: '¿Qué te haría más fácil organizar el viaje?',
      },
      emailLabel: 'Tu correo (opcional)',
      emailPlaceholder: 'Correo para responderte (opcional)',
      send: 'Enviar',
      thanks: '¡Gracias! Tu mensaje ya va de camino.',
      failed: 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.',
    },
  },
} satisfies LocaleBundle;
