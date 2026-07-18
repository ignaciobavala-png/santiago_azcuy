"use client"

import { usePathname } from "next/navigation"
import Footer from "./Footer"

/** El home es una landing full-screen: el footer solo aparece en las secciones. */
export default function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname === "/") return null
  return <Footer />
}
