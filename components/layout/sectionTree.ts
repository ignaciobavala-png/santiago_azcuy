export type SubLink = { label: string; anchor: string }
export type SectionNode = { label: string; href: string; subs: SubLink[] }

/**
 * Árbol del "file explorer": cada sección y sus subsecciones.
 * Las subsecciones son anclas (`id` / `data-subsection`) dentro del contenido
 * de la página — alimentan el breadcrumb, la barra de subsecciones y el scroll-spy.
 * Fuente única para la navegación (cards del escritorio, breadcrumb, chips).
 */
export const SECTION_TREE: SectionNode[] = [
  { label: "Pinturas", href: "/obras", subs: [] },
  {
    label: "El Aprendiz",
    href: "/el-aprendiz",
    subs: [
      { label: "Novela", anchor: "novela" },
      { label: "Audiolibro", anchor: "audiolibro" },
    ],
  },
  {
    label: "Música",
    href: "/musica",
    subs: [
      { label: "Videoclips", anchor: "videoclips" },
      { label: "Álbumes", anchor: "albumes" },
      { label: "Plataformas", anchor: "plataformas" },
      { label: "En vivo", anchor: "envivo" },
    ],
  },
  {
    label: "Institucional",
    href: "/institucional",
    subs: [
      { label: "Trayectoria", anchor: "trayectoria" },
      { label: "Formación", anchor: "formacion" },
      { label: "Distinciones", anchor: "distinciones" },
      { label: "Obra", anchor: "obra" },
    ],
  },
  { label: "Dossier", href: "/dossier", subs: [] },
  { label: "Sobre", href: "/sobre", subs: [] },
  { label: "Contacto", href: "/contacto", subs: [] },
]

/** Devuelve el nodo de sección al que pertenece un pathname (o null en el home). */
export function findSection(pathname: string): SectionNode | null {
  if (pathname === "/") return null
  return (
    SECTION_TREE.find((s) => pathname === s.href || pathname.startsWith(s.href + "/")) ?? null
  )
}
