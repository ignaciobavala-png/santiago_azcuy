/**
 * El español vive sin prefijo y el inglés bajo /en, igual que ivavala.com.
 * Un `proxy.ts` reescribe (no redirige) todo lo que no arranca con /en hacia
 * /es, asi que el segmento [lang] siempre existe para el router pero la URL
 * que ve el visitante sigue siendo limpia.
 */
export const IDIOMAS = ["es", "en"] as const;
export type Lang = (typeof IDIOMAS)[number];

export const esIdioma = (v: string): v is Lang =>
  (IDIOMAS as readonly string[]).includes(v);

/** Prefija una ruta interna con el idioma. `ruta("en", "/galeria") -> "/en/galeria"` */
export const ruta = (lang: Lang, path: string) =>
  lang === "es" ? path : path === "/" ? "/en" : `/en${path}`;

/** La contraria de la actual, para el conmutador ES/EN. */
export const otro = (lang: Lang): Lang => (lang === "es" ? "en" : "es");

/**
 * Quita el prefijo /en de un pathname para poder reconstruirlo en el otro
 * idioma sin perder en que pagina estaba el visitante.
 */
export const sinPrefijo = (pathname: string) =>
  pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/)/, "") || "/";

const es = {
  nav: {
    obras: "Galería",
    encargos: "Encargos",
    musica: "Música",
    libro: "Novela",
    arquitectura: "Arquitectura",
    sobre: "Sobre",
    contacto: "Contacto",
    abrirMenu: "Abrir el menú",
    cerrarMenu: "Cerrar el menú",
    cambiarIdioma: "Read in English",
  },
  home: {
    statement:
      "Pintura, dibujo, música y arquitectura. Una obra atravesada por lo cósmico y lo místico.",
    verObras: "Ver la galería ({n} obras) →",
  },
  obras: {
    titulo: "Galería",
    vacio: "No hay obras que combinen esos filtros.",
    cuentaUna: "{n} obra",
    cuentaVarias: "{n} obras",
    todo: "Todo",
    porEncargo: "Por encargo",
    categoria: "Categoría",
    tecnica: "Técnica",
    medidas: "Medidas",
    anio: "Año",
    origen: "Origen",
    encargo: "Por encargo",
    estado: "Estado",
    disponible: "Disponible",
    vendido: "Vendido",
    noDisponible: "No disponible",
    consultar: "Consultar por esta obra",
    mas: "Más {categoria}",
    categorias: { figurativo: "Figurativo", abstracto: "Abstracto", dibujo: "Dibujo", encargos: "Encargos" },
  },
  encargos: {
    titulo: "Proyectos por Encargo",
    intro:
      "Este formulario está destinado a la recepción de solicitudes para la realización de obras y proyectos artísticos por encargo.",
    evaluacion:
      "Cada propuesta se evalúa de manera individual considerando su alcance, características técnicas, dimensiones, plazos de ejecución y requerimientos específicos. Una vez recibida la información, se elabora una propuesta y su correspondiente cotización.",
    recibeTitulo: "Se reciben solicitudes para la ejecución de",
    recibe:
      "Pinturas · Dibujos · Diseño de Marca · Murales · Arte Digital · Proyectos expositivos",
    obligatorio: "Los campos marcados con * son obligatorios.",
    campos: {
      nombre: "Nombre y apellido",
      email: "Correo electrónico",
      whatsapp: "Whatsapp de contacto",
      ciudad: "Ciudad",
      pais: "País",
      tipoProyecto: "Tipo de proyecto",
      tipoOtro: "¿Cuál?",
      descripcion: "Describí detalladamente el proyecto que querés desarrollar",
      descripcionAyuda:
        "Cuanta más información aportes, más precisa será la evaluación. Incluí medidas, temática, técnica y estilo de pintura (abstracto o figurativo).",
      destino: "Destino de la obra",
      destinoOtro: "¿Cuál?",
      referencias: "¿Tenés imágenes, bocetos o referencias visuales del proyecto?",
      adjuntos: "Adjuntar imágenes",
      adjuntosAyuda:
        "Hasta 8 imágenes. Se comprimen solas antes de subir: no hace falta prepararlas.",
      elegir: "Elegí una opción",
      sumar: "Sumar imágenes",
      quitar: "Quitar",
    },
    opciones: {
      tipos: {
        pintura: "Pintura",
        dibujo: "Dibujo",
        diseno: "Diseño",
        mural: "Mural",
        exposicion: "Exposición",
        otro: "Otro",
      },
      destinos: {
        residencia: "Residencia particular",
        comercial: "Espacio comercial",
        institucion: "Institución",
        publico: "Espacio público",
        galeria: "Galería",
        otro: "Otro",
      },
    },
    enviar: "Enviar solicitud",
    enviando: "Enviando…",
    exitoTitulo: "Recibimos tu solicitud",
    exitoTexto:
      "La vamos a evaluar y, si es viable, nos comunicamos para continuar con la propuesta y la cotización.",
    cierre:
      "Una vez recibida la solicitud, la información será evaluada y, de ser viable, se establecerá contacto para continuar con el desarrollo de la propuesta y la cotización correspondiente.",
    errorCorto: "Contá un poco más sobre el proyecto.",
    errorMail: "Escribí un mail válido.",
    errorEnvio: "No se pudo enviar la solicitud. Probá de nuevo en un momento.",
  },
  musica: {
    titulo: "Música",
    intro:
      "Mantras, bhajans y canciones en 432 Hz. Todo se reproduce desde Spotify y YouTube: nada se aloja acá.",
    escuchar: "Escuchar en Spotify",
    albumes: "Álbumes completos",
    albumesNota: "Cada uno se escucha entero, sin cortes.",
    clips: "Videoclips",
    temas: "Temas y presentaciones",
    verCanal: "Ver el canal completo en YouTube →",
    verSpotify: "Ver el perfil en Spotify →",
    reproducir: "Reproducir «{titulo}»",
    cargando: "Cargando el reproductor…",
  },
  libro: {
    etiqueta: "Novela · Editorial Dunken, 2023",
    subtitulo: "Ciudad Intradorada",
    sinopsis:
      "Una historia fantástica con una enseñanza oculta entre líneas. Algo de magia, algo de ficción y algo de realidad.",
    ficha: "{capitulos} capítulos · {palabras} palabras",
    seguir: "Seguir leyendo →",
    indice: "Índice",
    puertaLabel: "Dejá tu mail y leelo completo",
    puertaBoton: "Leer →",
    puertaNota: "Se guarda solo para avisarte de novedades. Nada más.",
    audioEtiqueta: "Audiolibro",
    audioTitulo: "¿Preferís escucharlo?",
    audioTexto:
      "La novela entera, leída en voz alta. Se reproduce desde YouTube, sin dejar el mail.",
    fin: "Fin.",
    volverObras: "Ver la galería →",
  },
  arq: {
    titulo: "Arquitectura",
    ubicacion: "Ubicación",
    anio: "Año",
    estado: "Estado",
    laminas: "Láminas",
    lamina: "{titulo}, lámina {n}",
  },
  sobre: { titulo: "Sobre", nota: "Biografía, statement y recorrido. Pendiente de carga." },
  contacto: { titulo: "Contacto", nota: "Formulario de consulta. Pendiente de carga." },
  meta: {
    descripcion:
      "Obra de Santiago Azcuy: pintura, dibujo, música, arquitectura y El Aprendiz.",
  },
  err: {
    titulo: "404",
    texto: "Esta página no existe.",
    volver: "Volver al inicio",
    mientras: "Mientras tanto, ver la galería →",
  },
};

/** El inglés replica la forma del español; TypeScript avisa si falta una clave. */
const en: typeof es = {
  nav: {
    obras: "Gallery",
    encargos: "Commissions",
    musica: "Music",
    libro: "Novel",
    arquitectura: "Architecture",
    sobre: "About",
    contacto: "Contact",
    abrirMenu: "Open menu",
    cerrarMenu: "Close menu",
    cambiarIdioma: "Leer en español",
  },
  home: {
    statement:
      "Painting, drawing, music and architecture. A body of work run through by the cosmic and the mystical.",
    verObras: "See the gallery ({n} works) →",
  },
  obras: {
    titulo: "Gallery",
    vacio: "No works match those filters.",
    cuentaUna: "{n} work",
    cuentaVarias: "{n} works",
    todo: "All",
    porEncargo: "Commissioned",
    categoria: "Category",
    tecnica: "Technique",
    medidas: "Size",
    anio: "Year",
    origen: "Origin",
    encargo: "Commission",
    estado: "Status",
    disponible: "Available",
    vendido: "Sold",
    noDisponible: "Not available",
    consultar: "Ask about this work",
    mas: "More {categoria}",
    categorias: { figurativo: "Figurative", abstracto: "Abstract", dibujo: "Drawing", encargos: "Commissions" },
  },
  encargos: {
    titulo: "Commissions",
    intro:
      "This form is for requests to create commissioned artworks and art projects.",
    evaluacion:
      "Each proposal is reviewed individually, considering its scope, technical features, dimensions, timeline and specific requirements. Once the information is received, a proposal and its corresponding quote are prepared.",
    recibeTitulo: "Requests are received for",
    recibe: "Paintings · Drawings · Brand Design · Murals · Digital Art · Exhibition projects",
    obligatorio: "Fields marked with * are required.",
    campos: {
      nombre: "Full name",
      email: "Email",
      whatsapp: "WhatsApp",
      ciudad: "City",
      pais: "Country",
      tipoProyecto: "Project type",
      tipoOtro: "Which?",
      descripcion: "Describe in detail the project you want to develop",
      descripcionAyuda:
        "The more information you provide, the more precise the review. Include dimensions, theme, technique and painting style (abstract or figurative).",
      destino: "Destination of the work",
      destinoOtro: "Which?",
      referencias: "Do you have images, sketches or visual references for the project?",
      adjuntos: "Attach images",
      adjuntosAyuda:
        "Up to 8 images. They are compressed automatically before uploading, so no need to prepare them.",
      elegir: "Choose an option",
      sumar: "Add images",
      quitar: "Remove",
    },
    opciones: {
      tipos: {
        pintura: "Painting",
        dibujo: "Drawing",
        diseno: "Design",
        mural: "Mural",
        exposicion: "Exhibition",
        otro: "Other",
      },
      destinos: {
        residencia: "Private residence",
        comercial: "Commercial space",
        institucion: "Institution",
        publico: "Public space",
        galeria: "Gallery",
        otro: "Other",
      },
    },
    enviar: "Send request",
    enviando: "Sending…",
    exitoTitulo: "We received your request",
    exitoTexto:
      "We'll review it and, if viable, get in touch to continue with the proposal and the quote.",
    cierre:
      "Once the request is received, the information will be reviewed and, if viable, we will get in touch to continue developing the proposal and its corresponding quote.",
    errorCorto: "Tell us a bit more about the project.",
    errorMail: "Please enter a valid email.",
    errorEnvio: "We couldn't send your request. Please try again shortly.",
  },
  musica: {
    titulo: "Music",
    intro:
      "Mantras, bhajans and songs in 432 Hz. Everything plays from Spotify and YouTube: nothing is hosted here.",
    escuchar: "Listen on Spotify",
    albumes: "Full albums",
    albumesNota: "Each one plays end to end, uncut.",
    clips: "Music videos",
    temas: "Tracks and appearances",
    verCanal: "See the full channel on YouTube →",
    verSpotify: "See the Spotify profile →",
    reproducir: "Play “{titulo}”",
    cargando: "Loading the player…",
  },
  libro: {
    etiqueta: "Novel · Editorial Dunken, 2023",
    subtitulo: "Ciudad Intradorada",
    sinopsis:
      "A fantastical story with a teaching hidden between the lines. Some magic, some fiction and some truth. Written in Spanish.",
    ficha: "{capitulos} chapters · {palabras} words",
    seguir: "Keep reading →",
    indice: "Contents",
    puertaLabel: "Leave your email and read it in full",
    puertaBoton: "Read →",
    puertaNota: "Kept only to let you know about new work. Nothing else.",
    audioEtiqueta: "Audiobook",
    audioTitulo: "Rather listen to it?",
    audioTexto: "The whole novel, read aloud. Plays from YouTube, no email needed.",
    fin: "The end.",
    volverObras: "See the gallery →",
  },
  arq: {
    titulo: "Architecture",
    ubicacion: "Location",
    anio: "Year",
    estado: "Status",
    laminas: "Plates",
    lamina: "{titulo}, plate {n}",
  },
  sobre: { titulo: "About", nota: "Biography, statement and background. Not loaded yet." },
  contacto: { titulo: "Contact", nota: "Enquiry form. Not loaded yet." },
  meta: {
    descripcion:
      "The work of Santiago Azcuy: painting, drawing, music, architecture and The Apprentice.",
  },
  err: {
    titulo: "404",
    texto: "This page doesn't exist.",
    volver: "Back to the start",
    mientras: "In the meantime, see the gallery →",
  },
};

const DICC = { es, en };
export type Diccionario = typeof es;

export const t = (lang: Lang): Diccionario => DICC[lang];

/** Formato de miles segun idioma: 70.271 en español, 70,271 en inglés. */
export const miles = (n: number, lang: Lang) => n.toLocaleString(lang === "es" ? "es-AR" : "en-US");

/**
 * Rellena los huecos `{clave}` de una plantilla. Las frases con numeros o
 * titulos adentro se guardan asi, en vez de como funciones, para que Santiago
 * pueda reescribirlas desde el panel sin tocar codigo: lo unico que tiene que
 * respetar es dejar el hueco donde va el dato.
 */
export const fmt = (plantilla: string, vals: Record<string, string | number>) =>
  plantilla.replace(/\{(\w+)\}/g, (hueco, clave) =>
    clave in vals ? String(vals[clave]) : hueco
  );
