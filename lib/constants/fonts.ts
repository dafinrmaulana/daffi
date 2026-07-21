import { DM_Serif_Display, Inter, Roboto_Mono } from "next/font/google"

export const serif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
})

export const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
