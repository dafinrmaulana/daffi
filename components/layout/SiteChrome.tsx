"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { SocialRail } from "@/components/layout/SocialRail"

export function SiteChrome() {
  const pathname = usePathname()

  if (pathname === "/login") {
    return null
  }

  return (
    <>
      <Header />
      <SocialRail />
      <Footer />
    </>
  )
}
