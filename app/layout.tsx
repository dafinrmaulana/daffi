import type { Metadata } from "next";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { ThemeProvider } from "@/components/theme-provider";
import { mono, sans, serif } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dafi - Frontend developer",
    template: "%s - Dafi",
  },
  description:
    "Experienced Front-End Developer with building responsive, maintainable web and mobile applications using React, React Native, JavaScript, and TypeScript. Passionate about creating intuitive user interfaces, writing clean code, and delivering high-quality solutions that provide a great user experience.",
  openGraph: {
    title: "Dafi - Frontend developer",
    description:
      "Experienced Front-End Developer with building responsive, maintainable web and mobile applications using React, React Native, JavaScript, and TypeScript. Passionate about creating intuitive user interfaces, writing clean code, and delivering high-quality solutions that provide a great user experience.",
    type: "website",
    images: [
      {
        url: "/profile.webp",
        width: 512,
        height: 512,
        alt: "Dafi",
      },
    ],
  },
  icons: {
    icon: "/profile.webp",
    shortcut: "/profile.webp",
    apple: "/profile.webp",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
