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

/** Prefija una ruta interna con el idioma. `ruta("en", "/obras") -> "/en/obras"` */
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
    obras: "Obras",
    musica: "Música",
    libro: "El Aprendiz",
    arquitectura: "Arquitectura",
    sobre: "Sobre",
    contacto: "Contacto",
    abrirMenu: "Abrir el menú",
    cerrarMenu: "Cerrar el menú",
    cambiarTema: "Cambiar entre claro y oscuro",
    cambiarIdioma: "Read in English",
  },
  home: {
    statement:
      "Pintura, dibujo, música y arquitectura. Una obra atravesada por lo cósmico y lo místico.",
    verObras: (n: number) => `Ver las ${n} obras →`,
    musicaEtiqueta: "Música",
    musicaTitulo: "Discos, videos y shows",
    musicaTexto: "La obra sonora, embebida desde las plataformas donde ya vive.",
    libroEtiqueta: "El Aprendiz",
    libroTitulo: "La novela",
    libroTexto: "Ciudad Intradorada.",
    arqEtiqueta: "Arquitectura",
    arqTitulo: "Proyectos",
    arqTexto: "Templo circular en Chacarita, vivienda en Chapadmalal.",
    ver: "Ver →",
  },
  obras: {
    titulo: "Obras",
    vacio: "No hay obras que combinen esos filtros.",
    cuenta: (n: number) => `${n} ${n === 1 ? "obra" : "obras"}`,
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
    noDisponible: "No disponible",
    consultar: "Consultar por esta obra",
    mas: (cat: string) => `Más ${cat.toLowerCase()}`,
    categorias: { figurativo: "Figurativo", abstracto: "Abstracto", dibujo: "Dibujo" },
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
    reproducir: (t: string) => `Reproducir «${t}»`,
    cargando: "Cargando el reproductor…",
  },
  libro: {
    etiqueta: "Novela · Editorial Dunken, 2023",
    subtitulo: "Ciudad Intradorada",
    sinopsis:
      "Una historia fantástica con una enseñanza oculta entre líneas. Algo de magia, algo de ficción y algo de realidad.",
    ficha: (caps: number, palabras: string) => `${caps} capítulos · ${palabras} palabras`,
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
    volverObras: "Ver la obra plástica →",
  },
  arq: {
    titulo: "Arquitectura",
    ubicacion: "Ubicación",
    anio: "Año",
    estado: "Estado",
    laminas: "Láminas",
    lamina: (t: string, i: number) => `${t}, lámina ${i}`,
  },
  sobre: { titulo: "Sobre", nota: "Biografía, statement y recorrido. Pendiente de carga." },
  contacto: { titulo: "Contacto", nota: "Formulario de consulta. Pendiente de carga." },
  cierre: { obra: "Pintura, música,\narquitectura y palabra." },
  err: {
    titulo: "404",
    texto: "Esta página no existe.",
    volver: "Volver al inicio →",
    mientras: "Mientras tanto, ver las obras →",
  },
};

/** El inglés replica la forma del español; TypeScript avisa si falta una clave. */
const en: typeof es = {
  nav: {
    obras: "Works",
    musica: "Music",
    libro: "The Apprentice",
    arquitectura: "Architecture",
    sobre: "About",
    contacto: "Contact",
    abrirMenu: "Open menu",
    cerrarMenu: "Close menu",
    cambiarTema: "Switch between light and dark",
    cambiarIdioma: "Leer en español",
  },
  home: {
    statement:
      "Painting, drawing, music and architecture. A body of work run through by the cosmic and the mystical.",
    verObras: (n: number) => `See all ${n} works →`,
    musicaEtiqueta: "Music",
    musicaTitulo: "Albums, videos and shows",
    musicaTexto: "The sound work, embedded from the platforms where it already lives.",
    libroEtiqueta: "The Apprentice",
    libroTitulo: "The novel",
    libroTexto: "Ciudad Intradorada.",
    arqEtiqueta: "Architecture",
    arqTitulo: "Projects",
    arqTexto: "A circular temple in Chacarita, a house in Chapadmalal.",
    ver: "See →",
  },
  obras: {
    titulo: "Works",
    vacio: "No works match those filters.",
    cuenta: (n: number) => `${n} ${n === 1 ? "work" : "works"}`,
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
    noDisponible: "Not available",
    consultar: "Ask about this work",
    mas: (cat: string) => `More ${cat.toLowerCase()}`,
    categorias: { figurativo: "Figurative", abstracto: "Abstract", dibujo: "Drawing" },
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
    reproducir: (t: string) => `Play “${t}”`,
    cargando: "Loading the player…",
  },
  libro: {
    etiqueta: "Novel · Editorial Dunken, 2023",
    subtitulo: "Ciudad Intradorada",
    sinopsis:
      "A fantastical story with a teaching hidden between the lines. Some magic, some fiction and some truth. Written in Spanish.",
    ficha: (caps: number, palabras: string) => `${caps} chapters · ${palabras} words`,
    seguir: "Keep reading →",
    indice: "Contents",
    puertaLabel: "Leave your email and read it in full",
    puertaBoton: "Read →",
    puertaNota: "Kept only to let you know about new work. Nothing else.",
    audioEtiqueta: "Audiobook",
    audioTitulo: "Rather listen to it?",
    audioTexto: "The whole novel, read aloud. Plays from YouTube, no email needed.",
    fin: "The end.",
    volverObras: "See the paintings →",
  },
  arq: {
    titulo: "Architecture",
    ubicacion: "Location",
    anio: "Year",
    estado: "Status",
    laminas: "Plates",
    lamina: (t: string, i: number) => `${t}, plate ${i}`,
  },
  sobre: { titulo: "About", nota: "Biography, statement and background. Not loaded yet." },
  contacto: { titulo: "Contact", nota: "Enquiry form. Not loaded yet." },
  cierre: { obra: "Painting, music,\narchitecture and the word." },
  err: {
    titulo: "404",
    texto: "This page doesn't exist.",
    volver: "Back to the start →",
    mientras: "In the meantime, see the works →",
  },
};

const DICC = { es, en };
export type Diccionario = typeof es;

export const t = (lang: Lang): Diccionario => DICC[lang];

/** Formato de miles segun idioma: 70.271 en español, 70,271 en inglés. */
export const miles = (n: number, lang: Lang) => n.toLocaleString(lang === "es" ? "es-AR" : "en-US");
