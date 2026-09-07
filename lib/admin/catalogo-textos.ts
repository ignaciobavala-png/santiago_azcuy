import { type Diccionario } from "@/lib/i18n";

/**
 * Nombres en criollo para el panel. El diccionario del codigo esta organizado
 * para programar (`home.arqEtiqueta`); Santiago necesita leer "Bloque
 * arquitectura — volanta". Lo que no figure acá cae en un nombre derivado de la
 * clave, asi que agregar una frase al diccionario nunca deja el panel roto:
 * como mucho aparece con un nombre feo hasta que se le escribe uno.
 */
export const SECCIONES: { id: keyof Diccionario; titulo: string; nota?: string }[] = [
  { id: "home", titulo: "Portada", nota: "Lo que se lee al entrar y las tres interrupciones." },
  { id: "obras", titulo: "Obras", nota: "Listado, filtros y la ficha de cada obra." },
  { id: "musica", titulo: "Música" },
  { id: "libro", titulo: "El Aprendiz" },
  { id: "arq", titulo: "Arquitectura" },
  { id: "sobre", titulo: "Sobre" },
  { id: "contacto", titulo: "Contacto" },
  { id: "cierre", titulo: "Pie de página" },
  { id: "nav", titulo: "Menú", nota: "Los nombres de las secciones y los botones de la barra." },
  { id: "err", titulo: "Página no encontrada", nota: "También el enlace del pie de Sobre y Contacto." },
  { id: "meta", titulo: "Buscadores", nota: "No se ve en la página: es lo que muestra Google." },
];

export const ETIQUETAS: Record<string, string> = {
  // Menú
  "nav.obras": "Obras",
  "nav.musica": "Música",
  "nav.libro": "El Aprendiz",
  "nav.arquitectura": "Arquitectura",
  "nav.sobre": "Sobre",
  "nav.contacto": "Contacto",
  "nav.abrirMenu": "Abrir el menú (lectores de pantalla)",
  "nav.cerrarMenu": "Cerrar el menú (lectores de pantalla)",
  "nav.cambiarTema": "Botón claro/oscuro (lectores de pantalla)",
  "nav.cambiarIdioma": "Botón de idioma (lectores de pantalla)",

  // Portada
  "home.statement": "Bajada del nombre",
  "home.verObras": "Enlace a las obras",
  "home.musicaEtiqueta": "Bloque música — volanta",
  "home.musicaTitulo": "Bloque música — título",
  "home.musicaTexto": "Bloque música — texto",
  "home.libroEtiqueta": "Bloque libro — volanta",
  "home.libroTitulo": "Bloque libro — título",
  "home.libroTexto": "Bloque libro — texto",
  "home.arqEtiqueta": "Bloque arquitectura — volanta",
  "home.arqTitulo": "Bloque arquitectura — título",
  "home.arqTexto": "Bloque arquitectura — texto",
  "home.ver": "Enlace de los tres bloques",

  // Obras
  "obras.titulo": "Título de la página",
  "obras.vacio": "Cuando ningún filtro da resultados",
  "obras.cuentaUna": "Contador — una sola obra",
  "obras.cuentaVarias": "Contador — varias obras",
  "obras.todo": "Filtro «todo»",
  "obras.porEncargo": "Filtro «por encargo»",
  "obras.categoria": "Ficha — categoría",
  "obras.tecnica": "Ficha — técnica",
  "obras.medidas": "Ficha — medidas",
  "obras.anio": "Ficha — año",
  "obras.origen": "Ficha — origen",
  "obras.encargo": "Ficha — valor «por encargo»",
  "obras.estado": "Ficha — estado",
  "obras.disponible": "Ficha — disponible",
  "obras.noDisponible": "Ficha — no disponible",
  "obras.consultar": "Botón de consulta",
  "obras.mas": "Enlace a más obras de la categoría",
  "obras.categorias.figurativo": "Categoría figurativo",
  "obras.categorias.abstracto": "Categoría abstracto",
  "obras.categorias.dibujo": "Categoría dibujo",

  // Música
  "musica.titulo": "Título de la página",
  "musica.intro": "Bajada",
  "musica.escuchar": "Título del bloque de Spotify",
  "musica.albumes": "Título del bloque de álbumes",
  "musica.albumesNota": "Nota al lado de los álbumes",
  "musica.clips": "Título del bloque de videoclips",
  "musica.temas": "Título del bloque de temas",
  "musica.verCanal": "Enlace al canal de YouTube",
  "musica.verSpotify": "Enlace al perfil de Spotify",
  "musica.reproducir": "Botón de play (lectores de pantalla)",
  "musica.cargando": "Mientras carga el video",

  // Libro
  "libro.etiqueta": "Volanta (editorial y año)",
  "libro.subtitulo": "Subtítulo",
  "libro.sinopsis": "Sinopsis de respaldo",
  "libro.ficha": "Ficha de capítulos y palabras",
  "libro.seguir": "Botón de quien ya dejó el mail",
  "libro.indice": "Título del índice",
  "libro.puertaLabel": "Pedido del mail",
  "libro.puertaBoton": "Botón de leer",
  "libro.puertaNota": "Aclaración debajo del mail",
  "libro.audioEtiqueta": "Audiolibro — volanta",
  "libro.audioTitulo": "Audiolibro — título",
  "libro.audioTexto": "Audiolibro — texto",
  "libro.fin": "Final de la lectura",
  "libro.volverObras": "Enlace a las obras al terminar",

  // Arquitectura
  "arq.titulo": "Título de la página",
  "arq.ubicacion": "Ficha — ubicación",
  "arq.anio": "Ficha — año",
  "arq.estado": "Ficha — estado",
  "arq.laminas": "Ficha — láminas",
  "arq.lamina": "Descripción de cada lámina (lectores de pantalla)",

  // Sobre / contacto / pie
  "sobre.titulo": "Título de la página",
  "sobre.nota": "Texto provisorio",
  "contacto.titulo": "Título de la página",
  "contacto.nota": "Texto provisorio",
  "cierre.obra": "Frase de cierre (los saltos de línea se respetan)",

  // 404 y buscadores
  "err.titulo": "Número grande",
  "err.texto": "Explicación",
  "err.volver": "Enlace al inicio (se le agrega la flecha)",
  "err.mientras": "Enlace a las obras (404, Sobre y Contacto)",
  "meta.descripcion": "Descripción del sitio",
};

/** Ultimo recurso: `arqEtiqueta` -> «Arq etiqueta». */
export function nombreDerivado(ruta: string): string {
  const hoja = ruta.split(".").pop() ?? ruta;
  const suelto = hoja.replace(/([A-Z])/g, " $1").toLowerCase().trim();
  return suelto.charAt(0).toUpperCase() + suelto.slice(1);
}

export const etiquetaDe = (ruta: string) => ETIQUETAS[ruta] ?? nombreDerivado(ruta);

/** Los huecos `{n}` de una plantilla, para avisar en el panel que no se borran. */
export const huecosDe = (plantilla: string) =>
  [...plantilla.matchAll(/\{(\w+)\}/g)].map((m) => m[0]);
