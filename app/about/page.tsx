import type { Metadata } from "next"

import { Section } from "@/components/layout/Section"
import { Badge } from "@/components/ui/Badge"

export const metadata: Metadata = {
  title: "About",
}

const skills = ["Next.js", "TypeScript", "React", "Tailwind", "Accessibility", "Performance", "Design Systems", "Content"]
const timeline = [
  ["2026", "Independent product interface work for SaaS and editorial teams."],
  ["2025", "Led frontend delivery for finance and reporting workflows."],
  ["2024", "Built brand sites, portfolio systems, and reusable page primitives."],
]

export default function AboutPage() {
  return (
    <Section>
      <p className="mb-4 font-mono text-xs uppercase text-muted">## About</p>
      <h1 className="max-w-5xl font-serif text-6xl leading-none sm:text-8xl">
        Frontend engineer with a typography-first design instinct.
      </h1>
      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr]">
        <p className="text-lg leading-relaxed text-muted">
          I build focused web surfaces for teams that need clarity, speed, and
          maintainable implementation. My work usually sits between product
          thinking, visual systems, and production frontend engineering.
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </div>
      <div className="mt-16">
        {timeline.map(([year, text]) => (
          <div key={year} className="grid gap-4 border-t border-border py-6 md:grid-cols-[120px_1fr]">
            <p className="font-mono text-xs uppercase text-muted">{year}</p>
            <p className="text-lg">{text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
