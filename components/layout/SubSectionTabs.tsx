"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, type ReactNode } from "react"

type Tab = { anchor: string; node: ReactNode }

function Inner({ tabs }: { tabs: Tab[] }) {
  const searchParams = useSearchParams()
  const sub = searchParams.get("sub")
  const active = tabs.find((t) => t.anchor === sub)?.anchor ?? tabs[0]?.anchor
  const content = tabs.find((t) => t.anchor === active)?.node ?? tabs[0]?.node
  return <>{content}</>
}

export default function SubSectionTabs({ tabs }: { tabs: Tab[] }) {
  return (
    <Suspense fallback={null}>
      <Inner tabs={tabs} />
    </Suspense>
  )
}
