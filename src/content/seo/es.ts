import type { LocaleSeo } from './types';

/**
 * Spanish, neutral "tú" with no "vosotros", so it reads naturally in Spain and in Latin
 * America alike. Terminology follows the app: people mark "días", the results are
 * "fechas" ("Mejores fechas").
 *
 * The landing page answers the searches Spanish speakers actually make for this job:
 * "when2meet" (1,300/mo in Spain, 1,300 in Mexico), "encuesta de fechas", and how to pick
 * dates for a trip with friends. When2meet facts checked on when2meet.com 2026-08-28,
 * Doodle facts on doodle.com 2026-08-31.
 */
const es: LocaleSeo = {
  locale: 'es',
  contentUpdated: '2026-09-23',
  home: {
    title: 'Elegir fechas para un viaje en grupo, gratis | WeGoWhen',
    description:
      'Organiza un viaje con amigos sin registro: compartes un enlace, cada uno marca los días que puede y ves en qué fechas coincide el grupo. Gratis.',
  },
  landing: {
    slug: 'alternativa-when2meet',
    title: 'Alternativa a When2meet para viajes, en español | WeGoWhen',
    description:
      '¿Buscas algo como When2meet pero por días? WeGoWhen encuentra los días seguidos en que tu grupo puede viajar. Gratis, sin registro y sin anuncios.',
    linkLabel: 'Alternativa a When2meet',
    heading: 'Una alternativa a When2meet para elegir las fechas de un viaje',
    standfirst:
      'When2meet sirve para encontrar una hora de reunión. Para un viaje necesitas otra cosa: varios días seguidos en los que pueda ir la mayor parte del grupo. WeGoWhen hace justo eso, y en español.',
    sections: [
      {
        heading: 'When2meet busca una hora; un viaje necesita días seguidos',
        paragraphs: [
          'Al crear un When2meet te pide las fechas candidatas y, además, una franja horaria obligatoria («No earlier than» y «No later than»). Para un viaje acabas poniendo de medianoche a medianoche y todo el mundo arrastra sobre franjas de horas que no le importan a nadie.',
          'El resultado es una cuadrícula sombreada según cuánta gente puede en cada franja. Averiguar qué fin de semana largo o qué semana le va bien a más personas te toca a ti, mirando la cuadrícula.',
        ],
      },
      {
        heading: 'Cómo funciona WeGoWhen',
        paragraphs: [
          'Una persona crea el viaje: le pone un nombre y elige entre qué fechas podría ser. Después comparte un único enlace por WhatsApp, Messenger o donde esté el grupo.',
          'Cada uno abre el enlace, escribe su nombre y toca o arrastra los días que tiene libres, desde el teléfono o desde cualquier navegador. No hace falta cuenta ni correo, ni para quien organiza ni para quien responde.',
        ],
      },
      {
        heading: 'Lo que obtienes: fechas, no una cuadrícula que descifrar',
        paragraphs: [
          'WeGoWhen calcula todos los tramos de días seguidos en los que algún grupo de personas puede estar de principio a fin, descarta los que ya quedan cubiertos por uno más largo y los ordena por número de personas, luego por duración y luego por fecha.',
          'Un mapa de calor muestra cuántos pueden cada día, y puedes filtrar por una parte del grupo para ver qué fechas les van bien solo a esas personas. Es gratis, sin plan de pago ni anuncios, y admite hasta 200 participantes por viaje.',
        ],
      },
      {
        heading: 'Cuándo te conviene más When2meet o Doodle',
        paragraphs: [
          'Si lo que buscas es una hora para una reunión, una llamada o una cena, WeGoWhen no te sirve: solo trabaja con días completos. Para eso When2meet o Doodle son la herramienta adecuada.',
          'WeGoWhen tampoco se sincroniza con tu calendario ni manda avisos o recordatorios, y funciona solo en la web. Si necesitas alguna de esas cosas, busca otra herramienta.',
        ],
      },
    ],
    comparison: {
      competitor: 'When2meet',
      rows: [
        {
          aspect: 'Qué eliges',
          them: 'Franjas horarias dentro de unas fechas',
          us: 'Días completos',
        },
        {
          aspect: 'Qué pide al crearla',
          them: 'Fechas candidatas y una franja horaria obligatoria; para un viaje, de medianoche a medianoche',
          us: 'Un nombre y entre qué fechas podría ser el viaje',
        },
        {
          aspect: 'Qué obtienes',
          them: 'Una cuadrícula sombreada según cuánta gente puede',
          us: 'Tramos de días seguidos ordenados por personas, duración y fecha, más un mapa de calor',
        },
        {
          aspect: 'Quién interpreta el resultado',
          them: 'Tú, leyendo la cuadrícula',
          us: 'WeGoWhen calcula los tramos; tú solo eliges',
        },
        {
          aspect: 'Cuenta para responder',
          them: 'No',
          us: 'No, y tampoco para crear el viaje',
        },
        {
          aspect: 'Precio',
          them: 'Gratis',
          us: 'Gratis, sin plan de pago ni anuncios',
        },
        {
          aspect: 'Máximo de personas',
          them: 'No lo publica',
          us: '200 por viaje',
        },
      ],
      checked: 'Datos de When2meet comprobados en when2meet.com el 28 de agosto de 2026.',
    },
    questions: [
      {
        question: '¿Hay algo como When2meet pero por días?',
        answer:
          'Sí. En WeGoWhen cada persona marca los días que puede, sin horas, y la herramienta te da los tramos de días seguidos en los que coincide más gente.',
      },
      {
        question: '¿Cómo elegir fechas para un viaje con amigos?',
        answer:
          'Crea un viaje en WeGoWhen con el intervalo de fechas posible y manda el enlace al grupo. Cada uno marca sus días libres y en «Mejores fechas» verás los tramos que le van bien a más personas.',
      },
      {
        question: '¿Hay que registrarse?',
        answer:
          'No. Ni quien crea el viaje ni quien responde necesita cuenta o correo: basta con escribir un nombre.',
      },
      {
        question: '¿Hay una alternativa a When2meet en español?',
        answer:
          'WeGoWhen está en español, además de en inglés, alemán, francés, neerlandés, polaco, japonés y coreano. Está pensado para elegir fechas de viaje, no horas de reunión.',
      },
      {
        question: '¿Es gratis? ¿Cuántas personas pueden participar?',
        answer:
          'Es gratis, sin plan de pago y sin anuncios. Un viaje admite hasta 200 participantes y un intervalo de fechas de hasta 366 días.',
      },
      {
        question: '¿Sirve para quedar a una hora concreta?',
        answer:
          'No, WeGoWhen trabaja solo con días completos. Para encontrar una hora de reunión, When2meet o Doodle son mejor opción.',
      },
    ],
  },
};

export default es;
