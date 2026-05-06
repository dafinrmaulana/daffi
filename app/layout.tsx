import type { Metadata } from "next"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { SocialRail } from "@/components/layout/SocialRail"
import { ThemeProvider } from "@/components/theme-provider"
import { mono, sans, serif } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Dafi - Frontend developer with 3 years of experience",
    template: "%s - Dafi",
  },
  description:
    "Frontend developer with 3 years of experience building product interfaces, polished web systems, and fast user-facing experiences.",
  openGraph: {
    title: "Dafi - Frontend developer with 3 years of experience",
    description:
      "Frontend developer with 3 years of experience building product interfaces, polished web systems, and fast user-facing experiences.",
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
