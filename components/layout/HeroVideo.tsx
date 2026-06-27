"use client"

export default function HeroVideo({ src }: { src: string }) {
  return (
    <video
      key={src}
      src={src}
      autoPlay
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}
