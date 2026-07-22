"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SocialRail } from "@/components/layout/social-rail"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandaloneRoute = pathname === "/login" || pathname === "/admin" || pathname.startsWith("/admin/")

  if (isStandaloneRoute) {
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
