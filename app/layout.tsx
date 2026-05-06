import type { Metadata } from "next"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { SocialRail } from "@/components/layout/SocialRail"
import { ThemeProvider } from "@/components/theme-provider"
import { mono, sans, serif } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Dafi - Frontend developer",
    template: "%s - Dafi",
  },
  description:
    "Frontend developer who adapts across legacy and modern technologies, and also builds mobile apps with React Native.",
  openGraph: {
    title: "Dafi - Frontend developer",
    description:
      "Frontend developer who adapts across legacy and modern technologies, and also builds mobile apps with React Native.",
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
