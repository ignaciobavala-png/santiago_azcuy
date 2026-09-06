/**
 * De un titulo a un slug. NFD separa la vocal del acento, el borrado quita el
 * acento, y lo que no es alfanumerico pasa a guion. La coleccion del sitio se
 * genero igual (scripts/ingest-obras.mjs), asi que el resultado coincide con
 * los slugs ya cargados: "Acampando en las Sierras de Córdoba" -> el mismo.
 */
export function slugDesde(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
