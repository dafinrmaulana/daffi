import { ArrowDown } from "lucide-react"

import { AnimatedReveal } from "@/components/shared/AnimatedReveal"
import { Button } from "@/components/ui/Button"

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-between px-5 py-10 sm:px-8">
      <AnimatedReveal className="pt-10">
        <p className="mb-5 font-mono text-xs uppercase text-muted">
          Jakarta · Available for work · Frontend Developer · 3 Years Experience
        </p>
        <h1 className="max-w-6xl font-serif text-[clamp(4.5rem,16vw,13rem)] leading-[0.85] text-balance">
          Dafi N. Maulana
        </h1>
      </AnimatedReveal>
      <AnimatedReveal delay={0.08} className="grid gap-8 border-t border-border pt-6 md:grid-cols-[1fr_auto] md:items-end">
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Frontend developer with 3 years of experience building clean product interfaces, performant web apps, and thoughtful design systems.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/work">View work</Button>
          <a href="#contact" className="inline-flex items-center gap-2 px-4 py-3 text-sm text-muted hover:text-fg">
            Scroll <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </AnimatedReveal>
    </section>
  )
}
