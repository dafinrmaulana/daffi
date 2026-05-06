import type { Metadata } from "next"
import Image from "next/image"

import { Section } from "@/components/layout/Section"
import { ExperienceSection } from "@/components/shared/ExperienceSection"
import { Badge } from "@/components/ui/Badge"

export const metadata: Metadata = {
  title: "About",
}

const skills = ["Next.js", "TypeScript", "React", "Tailwind", "Accessibility", "Performance", "Design Systems", "Content"]

export default function AboutPage() {
  return (
    <>
      <Section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-12 bg-fg" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Profile
          </p>
        </div>
        <h1 className="max-w-5xl font-serif text-6xl leading-[0.92] sm:text-8xl">
          Frontend engineer with a typography-first design instinct.
        </h1>
        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr]">
          <div className="flex items-start gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-border bg-muted/10">
              <Image
                src="/images/profile-dafi.svg"
                alt="Dafi profile"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted">
              I build focused web surfaces for teams that need clarity, speed, and
              maintainable implementation. My work usually sits between product
              thinking, visual systems, and production frontend engineering.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </div>
      </Section>
      <ExperienceSection />
    </>
  )
}
