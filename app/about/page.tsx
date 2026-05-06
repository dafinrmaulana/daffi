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
          Frontend developer adapting to legacy and modern technologies across web and mobile.
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
              I build frontend products that stay maintainable whether the stack is legacy or modern.
              Most of my work lives on the web, and I can also build mobile apps with React Native
              when the product needs a native-feeling mobile surface.
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
