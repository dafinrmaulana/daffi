"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { SocialRail } from "@/components/layout/SocialRail"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/login") {
    return <main>{children}</main>
  }

  return (
    <>
      <Header />
      <SocialRail />
      <main>{children}</main>
      <Footer />
    </>
  )
}
