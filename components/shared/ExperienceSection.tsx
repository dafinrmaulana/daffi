import { Section } from "@/components/layout/Section"
import { AnimatedReveal } from "@/components/shared/AnimatedReveal"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { Badge } from "@/components/ui/Badge"
import { experiences } from "@/lib/content"

export function ExperienceSection({ compact = false }: { compact?: boolean }) {
  const items = compact ? experiences.slice(0, 3) : experiences

  return (
    <Section id="experience">
      <AnimatedReveal>
        <SectionTitle
          eyebrow="Experience"
          title="Frontend work across product UI, internal tools, and web systems."
        />
      </AnimatedReveal>
      <div className="border-t border-border">
        {items.map((item) => (
          <AnimatedReveal
            key={`${item.company}-${item.period}`}
            delay={0.04}
            className="grid gap-5 border-b border-border py-7 md:grid-cols-[180px_1fr]"
          >
            <div>
              <p className="font-mono text-xs uppercase text-muted">{item.period}</p>
              <p className="mt-2 text-sm text-muted">{item.location}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <h3 className="font-serif text-3xl leading-tight sm:text-4xl">
                  {item.role}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase text-muted">{item.company}</p>
                <p className="mt-4 max-w-2xl text-muted">{item.description}</p>
              </div>
              <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                {item.highlights.map((highlight) => (
                  <Badge key={highlight}>{highlight}</Badge>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </Section>
  )
}
