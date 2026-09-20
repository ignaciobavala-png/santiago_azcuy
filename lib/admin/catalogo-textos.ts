import { type Diccionario } from "@/lib/i18n";

/**
 * Nombres en criollo para el panel. El diccionario del codigo esta organizado
 * para programar (`home.statement`); Santiago necesita leer "Bloque
 * arquitectura — volanta". Lo que no figure acá cae en un nombre derivado de la
 * clave, asi que agregar una frase al diccionario nunca deja el panel roto:
 * como mucho aparece con un nombre feo hasta que se le escribe uno.
 */
/**
 * `ruta` es la pagina real donde vive ese grupo: el panel la ofrece como
 * enlace ("Ver en la página ↗") para que Santiago pueda mirar el texto en su
 * lugar antes de tocarlo, en vez de adivinar por el nombre del grupo.
 */
export const SECCIONES: { id: keyof Diccionario; titulo: string; nota?: string; ruta?: string }[] = [
  { id: "home", titulo: "Portada", nota: "El nombre, la bajada y el enlace a la galería.", ruta: "/" },
  { id: "obras", titulo: "Galería", nota: "Listado, filtros y la ficha de cada obra.", ruta: "/galeria" },
  { id: "encargos", titulo: "Encargos", nota: "Formulario de proyectos por encargo.", ruta: "/encargos" },
  { id: "musica", titulo: "Música", ruta: "/musica" },
  { id: "libro", titulo: "El Aprendiz", ruta: "/libro" },
  { id: "arq", titulo: "Arquitectura", ruta: "/arquitectura" },
  { id: "sobre", titulo: "Sobre", ruta: "/sobre" },
  { id: "contacto", titulo: "Contacto", ruta: "/contacto" },
  { id: "nav", titulo: "Menú", nota: "Los nombres de las secciones y los botones de la barra.", ruta: "/" },
  { id: "err", titulo: "Página no encontrada", nota: "También el enlace del pie de Sobre y Contacto." },
  { id: "meta", titulo: "Buscadores", nota: "No se ve en la página: es lo que muestra Google." },
];

export const ETIQUETAS: Record<string, string> = {
  // Menú
  "nav.obras": "Galería",
  "nav.encargos": "Encargos",
  "nav.musica": "Música",
  "nav.libro": "Novela",
  "nav.arquitectura": "Arquitectura",
  "nav.sobre": "Sobre",
  "nav.contacto": "Contacto",
  "nav.abrirMenu": "Abrir el menú (lectores de pantalla)",
  "nav.cerrarMenu": "Cerrar el menú (lectores de pantalla)",
  "nav.cambiarIdioma": "Botón de idioma (lectores de pantalla)",

  // Portada
  "home.statement": "Bajada del nombre",
  "home.verObras": "Enlace a la galería",

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
  "obras.vendido": "Ficha — vendido",
  "obras.noDisponible": "Ficha — no disponible",
  "obras.consultar": "Botón de consulta",
  "obras.mas": "Enlace a más obras de la categoría",
  "obras.categorias.figurativo": "Categoría figurativo",
  "obras.categorias.abstracto": "Categoría abstracto",
  "obras.categorias.dibujo": "Categoría dibujo",
  "obras.categorias.encargos": "Categoría encargos (índice de Galería)",

  // Encargos
  "encargos.titulo": "Título de la página",
  "encargos.intro": "Bajada",
  "encargos.evaluacion": "Cómo se evalúan las propuestas",
  "encargos.recibeTitulo": "Volanta de lo que se recibe",
  "encargos.recibe": "Lista de lo que se recibe",
  "encargos.obligatorio": "Aclaración de campos obligatorios",
  "encargos.campos.nombre": "Campo — nombre y apellido",
  "encargos.campos.email": "Campo — correo electrónico",
  "encargos.campos.whatsapp": "Campo — whatsapp",
  "encargos.campos.ciudad": "Campo — ciudad",
  "encargos.campos.pais": "Campo — país",
  "encargos.campos.tipoProyecto": "Campo — tipo de proyecto",
  "encargos.campos.tipoOtro": "Campo — tipo, «otro»",
  "encargos.campos.descripcion": "Campo — descripción del proyecto",
  "encargos.campos.descripcionAyuda": "Ayuda de la descripción",
  "encargos.campos.destino": "Campo — destino de la obra",
  "encargos.campos.destinoOtro": "Campo — destino, «otro»",
  "encargos.campos.referencias": "Campo — referencias",
  "encargos.campos.adjuntos": "Bloque de adjuntos — título",
  "encargos.campos.adjuntosAyuda": "Bloque de adjuntos — ayuda",
  "encargos.campos.elegir": "Opción por defecto de los selectores",
  "encargos.campos.sumar": "Botón para sumar imágenes",
  "encargos.campos.quitar": "Botón para quitar una imagen",
  "encargos.opciones.tipos.pintura": "Tipo de proyecto — pintura",
  "encargos.opciones.tipos.dibujo": "Tipo de proyecto — dibujo",
  "encargos.opciones.tipos.diseno": "Tipo de proyecto — diseño",
  "encargos.opciones.tipos.mural": "Tipo de proyecto — mural",
  "encargos.opciones.tipos.exposicion": "Tipo de proyecto — exposición",
  "encargos.opciones.tipos.otro": "Tipo de proyecto — otro",
  "encargos.opciones.destinos.residencia": "Destino — residencia particular",
  "encargos.opciones.destinos.comercial": "Destino — espacio comercial",
  "encargos.opciones.destinos.institucion": "Destino — institución",
  "encargos.opciones.destinos.publico": "Destino — espacio público",
  "encargos.opciones.destinos.galeria": "Destino — galería",
  "encargos.opciones.destinos.otro": "Destino — otro",
  "encargos.enviar": "Botón de enviar",
  "encargos.enviando": "Mientras se envía",
  "encargos.exitoTitulo": "Título del mensaje de éxito",
  "encargos.exitoTexto": "Texto del mensaje de éxito",
  "encargos.cierre": "Aclaración del pie",
  "encargos.errorCorto": "Error — descripción demasiado corta",
  "encargos.errorMail": "Error — mail inválido",
  "encargos.errorEnvio": "Error — no se pudo enviar",

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
  "libro.volverObras": "Enlace a la galería al terminar",

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

  // 404 y buscadores
  "err.titulo": "Número grande",
  "err.texto": "Explicación",
  "err.volver": "Enlace al inicio (se le agrega la flecha)",
  "err.mientras": "Enlace a la galería (404, Sobre y Contacto)",
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
