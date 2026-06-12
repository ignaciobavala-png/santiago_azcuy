import { getHeroBanner } from "./actions"
import HeroAdminClient from "./HeroAdminClient"

export const metadata = { title: "Hero Banner — Admin" }

export default async function HeroBannerPage() {
  const hero = await getHeroBanner()
  return <HeroAdminClient currentVideoUrl={hero?.video_url ?? null} />
}
