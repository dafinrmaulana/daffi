import type { Metadata } from "next"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { SocialRail } from "@/components/layout/SocialRail"
import { ThemeProvider } from "@/components/theme-provider"
import { mono, sans, serif } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Dafi - Product-minded frontend portfolio",
    template: "%s - Dafi",
  },
  description:
    "Minimal typography-first portfolio for frontend engineering, product UI, and editorial web work.",
  openGraph: {
    title: "Dafi - Product-minded frontend portfolio",
    description:
      "Minimal typography-first portfolio for frontend engineering, product UI, and editorial web work.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        <ThemeProvider>
          <Header />
          <SocialRail />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
