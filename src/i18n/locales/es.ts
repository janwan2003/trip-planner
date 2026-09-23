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
      logoAlt: 'Logotipo de WeGoWhen',
      genericError: 'Algo salió mal. Inténtalo de nuevo.',
      editDates: 'Editar las fechas de {{name}}',
      language: 'Idioma',
    },

    home: {
      title: 'Encuentra los días en que tu grupo realmente puede ir',
      subtitle: 'Planifica viajes con amigos viendo cuándo están todos disponibles',
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
        closing: 'Comparte el enlace. Marca tus fechas. Vive la aventura.',
      },
    },

    createTrip: {
      title: 'Planifica tu viaje',
      description: 'Crea un viaje y comparte el enlace con tus amigos para encontrar las mejores fechas',
      nameLabel: 'Nombre del viaje',
      namePlaceholder: 'Aventura de verano 2026',
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
        'Viajes que abriste en este navegador. Guardados solo aquí: ni en nuestros servidores ni en tus otros dispositivos.',
      untitled: 'Viaje sin nombre',
      yours: 'Tuyo',
      open: 'Abrir {{name}}',
      openWithRange: 'Abrir {{name}}, {{range}}',
      remove: 'Quitar {{name}} de esta lista',
    },

    notFound: {
      message: '¡Vaya! Página no encontrada',
      home: 'Volver al inicio',
    },
    errorBoundary: {
      title: 'Algo salió mal',
      body: 'Esta página tuvo un error. Tus fechas guardadas están a salvo en el servidor; recargar suele solucionarlo.',
      reload: 'Recargar',
    },

    trip: {
      loading: 'Cargando viaje…',
      loadErrorTitle: 'No se pudo cargar este viaje',
      loadErrorBody:
        'Es muy probable que el viaje esté bien: simplemente no pudimos acceder a él. Revisa tu conexión e inténtalo de nuevo.',
      tryAgain: 'Reintentar',
      createNew: 'Crear un viaje nuevo',
      notFoundTitle: 'Viaje no encontrado',
      notFoundBody: 'Este viaje no existe o se ha eliminado.',
      share: 'Compartir',
      shareLink: 'Compartir enlace',
      copied: '¡Copiado!',
      back: 'Volver a la vista del viaje',
      participantCount_one: '{{count}} participante',
      participantCount_other: '{{count}} participantes',

      join: {
        title: 'Únete a este viaje',
        body: 'Tu nombre acompaña a los días que elijas, para que todos vean quién puede y cuándo. Sin cuenta, sin correo electrónico.',
        nameLabel: 'Tu nombre',
        namePlaceholder: 'Escribe tu nombre',
        submit: 'Marcar mis fechas',
      },

      mark: {
        title: 'Marca tu disponibilidad',
        greeting: '¡Hola, <name>{{name}}</name>! Toca o arrastra sobre los días en que puedes.',
        selectAll: 'Seleccionar todo',
        clearAll: 'Borrar todo',
        legendAvailable: 'Disponible',
        legendNotSelected: 'No seleccionado',
        save: 'Guardar disponibilidad',
        saving: 'Guardando…',
        noChanges: 'No hay cambios que guardar',
      },

      withdraw: {
        label: 'Salir del viaje',
        confirmTitle: '¿Salir de este viaje?',
        confirmBody:
          'Los días que marcaste se eliminarán de {{trip}} y el grupo ya no te verá como participante. Puedes volver a unirte más tarde con el mismo nombre, pero tus fechas se habrán perdido.',
        cancel: 'Seguir en el viaje',
        confirm: 'Salir',
      },

      group: {
        title: 'Disponibilidad del grupo',
        showingAll: 'Se muestran todos los participantes',
        filteredTo: 'Filtrado por: {{names}}',
        noOne: 'Nadie',
        everyone: 'Todos',
      },

      participants: {
        title: 'Participantes',
        hint: 'Toca para filtrar por personas, o el lápiz para editar las fechas de alguien',
      },

      leaveEditor: {
        title: '¿Descartar tus días sin guardar?',
        switchBody: 'Tienes días marcados como {{current}} que no se han guardado. Si editas las fechas de {{other}}, se cargará su respuesta y perderás lo que no guardaste.',
        backBody: 'Tienes días marcados como {{current}} que no se han guardado. Si vuelves a la vista del viaje, se perderán.',
        keep: 'Seguir editando como {{name}}',
        discardBack: 'Descartar y volver',
      },

      toast: {
        linkCopiedTitle: '¡Enlace copiado!',
        linkCopiedBody: 'Comparte este enlace con tus amigos.',
        copyFailedTitle: 'No se pudo copiar el enlace',
        copyFailedBody: 'Cópialo desde la barra de direcciones de tu navegador.',
        savedTitle: '¡Disponibilidad guardada!',
        savedBody: 'Tus fechas se han actualizado.',
        saveErrorTitle: 'Error al guardar',
        conflictTitle: 'Estas fechas cambiaron mientras tanto',
        conflictBody: 'La respuesta de {{name}} se actualizó desde otro dispositivo. Tus marcas siguen aquí; guarda de nuevo para reemplazarla, o revisa primero la vista del grupo.',
        nameTakenTitle: 'Nombre ya en uso',
        nameTakenBody: 'Otra persona ya está usando este nombre.',
        renamedTitle: '¡Nombre actualizado!',
        renamedBody: 'Ahora te llamas {{name}}.',
        renameErrorTitle: 'Error al cambiar el nombre',
        withdrawnTitle: 'Saliste del viaje',
        withdrawnBody: 'Tu disponibilidad se ha eliminado.',
        withdrawErrorTitle: 'Error al salir del viaje',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}} disponible',
      dayWithCount_other: '{{date}}, {{count}} disponibles',
      nobodyFree: 'nadie puede',
      tapHint: 'Toca un día para ver quién puede',
    },

    bestDates: {
      title: 'Mejores fechas',
      forNames: 'para {{names}}',
      minHelp: 'Duración mínima del viaje.',
      minLabel: 'Mín.:',
      minTitle: 'Días mínimos',
      days_one: '{{count}} día',
      days_other: '{{count}} días',
      ofPeopleFree_one: 'de {{count}} persona puede',
      ofPeopleFree_other: 'de {{count}} personas pueden',
      empty: {
        noParticipantsTitle: 'Aquí aparecerán las mejores fechas',
        noParticipantsBody: 'Envía el enlace a todos y sus días aparecerán aquí',
        filteredTitle: 'No hay días que funcionen para {{names}}',
        filteredBody: 'Prueba a incluir a más personas',
        nobodyMarkedTitle_one: 'Alguien se ha unido, pero nadie ha marcado días todavía',
        nobodyMarkedTitle_other: 'Se ha unido gente, pero nadie ha marcado días todavía',
        nobodyMarkedBody: 'Las mejores fechas aparecen en cuanto alguien lo haga',
        noOverlapTitle: 'Todavía no hay días en común',
        noOverlapBody: 'Por ahora nadie puede el mismo día',
      },
    },

    participantsList: {
      emptyTitle: 'Nadie ha respondido todavía',
      emptyBody: '¡Sé el primero en marcar tu disponibilidad!',
      daysAvailable_one: '{{count}} día disponible',
      daysAvailable_other: '{{count}} días disponibles',
    },

    tutorial: {
      show: 'Mostrar tutorial',
      hide: 'Ocultar tutorial',
      organiserHeading: 'Cómo funciona',
      participantHeading: 'Qué hacer',
      organiser: {
        createTitle: 'Crea un viaje',
        createBody: 'Ponle nombre y elige el rango de fechas',
        shareTitle: 'Comparte el enlace',
        shareBody: 'Envía el enlace del viaje a todos los participantes',
        markTitle: 'Marca y guarda la disponibilidad',
        markBody: 'Cada persona elige los días en que puede',
        pickTitle: 'Elige las mejores fechas',
        pickBody: 'Mira cuándo puede la mayoría',
      },
      participant: {
        markTitle: 'Marca los días en que puedes ir',
        markBody: 'Toca un día o arrastra sobre varios',
        saveTitle: 'Guarda',
        saveBody: 'Tus fechas llegan al grupo al instante',
        watchTitle: 'Mira cómo cambia la respuesta',
        watchBody: '«Mejores fechas» se actualiza a medida que responde más gente',
      },
    },

    feedback: {
      bug: {
        label: 'Informar de un error',
        intro:
          'Hola, soy Janek y he creado WeGoWhen. Si algo se ha roto o no funciona como esperabas, te agradecería mucho que me lo contaras. Cada aviso ayuda.',
        placeholder: '¿Qué ha pasado y qué esperabas?',
      },
      feature: {
        label: 'Sugerir una función',
        intro:
          'Hola, soy Janek y he creado WeGoWhen. ¿Echas algo en falta? Leo cada petición con atención y la mayoría acaban en la app.',
        placeholder: '¿Qué te haría más fácil organizar el viaje?',
      },
      emailLabel: 'Tu correo (opcional)',
      emailPlaceholder: 'Correo para responderte (opcional)',
      send: 'Enviar',
      thanks: '¡Gracias! Tu mensaje ya va de camino.',
      failed: 'No se ha podido enviar. Revisa tu conexión e inténtalo de nuevo.',
    },
  },
} satisfies LocaleBundle;
