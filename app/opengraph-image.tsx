import { ImageResponse } from "next/og"

// Imagen Open Graph por defecto (se ve al compartir el link en redes/WhatsApp).
// Recrea la paleta del sitio: descenso azul noche → tierra + acento dorado.
export const alt = "Santiago Azcuy — Artista plástico argentino"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #080a12 0%, #0a0e1c 55%, #12100a 100%)",
          color: "#e8e4dc",
        }}
      >
        <div style={{ display: "flex", width: 56, height: 2, background: "#c9a87c", marginBottom: 44 }} />
        <div style={{ fontSize: 96, fontWeight: 300, letterSpacing: -2 }}>
          Santiago Azcuy
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#86c5ca",
            marginTop: 24,
            letterSpacing: 10,
            textTransform: "uppercase",
          }}
        >
          Artista plástico argentino
        </div>
        <div style={{ display: "flex", width: 56, height: 2, background: "#232838", marginTop: 44 }} />
      </div>
    ),
    { ...size }
  )
}
