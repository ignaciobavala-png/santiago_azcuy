/**
 * Inyecta un bloque JSON-LD (datos estructurados schema.org).
 * Es un Server Component: el <script> se renderiza en el HTML inicial,
 * que es lo que leen los crawlers.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
