"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCompressed, setIsCompressed] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsCompressed(window.scrollY > 24)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <header className="sticky top-0 z-40 pt-2 sm:pt-3">
        <div
          className={cn(
            "mx-auto flex h-16 items-center justify-between border border-border bg-bg/92 px-5 backdrop-blur transition-all duration-300 ease-out sm:px-6",
            isCompressed
              ? "max-w-[calc(100%-28px)] sm:max-w-[calc(100%-72px)]"
              : "max-w-7xl",
          )}
        >
          <Link href="/" className="font-mono text-sm uppercase" onClick={() => setIsOpen(false)}>
            Dafi
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center border border-border transition-colors hover:border-fg focus:outline-none focus:ring-2 focus:ring-fg focus:ring-offset-2 focus:ring-offset-bg sm:hidden"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 sm:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[84vw] max-w-sm flex-col border-l border-border bg-bg p-5 transition-transform duration-300 ease-out sm:hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm uppercase">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center border border-border"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="mt-10 flex flex-col border-t border-border">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="border-b border-border py-4 text-2xl font-serif"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
