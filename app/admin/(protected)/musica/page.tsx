import { createAdminClient } from "@/lib/supabase/server"
import VideosPanel from "./VideosPanel"
import AlbumesPanel from "./AlbumesPanel"
import PlataformasPanel from "./PlataformasPanel"

export const dynamic = "force-dynamic"

export default async function MusicaAdminPage() {
  const supabase = await createAdminClient()

  const [{ data: videos }, { data: albumes }, { data: plataformas }] = await Promise.all([
    supabase
      .from("videos_musica")
      .select("*")
      .order("orden", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("albumes")
      .select("*")
      .order("orden", { ascending: true, nullsFirst: false })
      .order("año", { ascending: false, nullsFirst: false }),
    supabase
      .from("plataformas")
      .select("*")
      .order("orden", { ascending: true, nullsFirst: false }),
  ])

  const videoclips = (videos ?? []).filter((v) => v.seccion === "videoclip")
  const envivo = (videos ?? []).filter((v) => v.seccion === "vivo")

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Música
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Videoclips · Álbumes · Plataformas · En vivo
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <VideosPanel
          seccion="videoclip"
          titulo="Videoclips"
          descripcion="Videos de YouTube que aparecen primero en la sección Música."
          videos={videoclips}
        />

        <AlbumesPanel albumes={albumes ?? []} />

        <PlataformasPanel plataformas={plataformas ?? []} />

        <VideosPanel
          seccion="vivo"
          titulo="En vivo"
          descripcion="Presentaciones en vivo (videos de YouTube). Se muestran al final de la sección."
          videos={envivo}
        />
      </div>
    </div>
  )
}
