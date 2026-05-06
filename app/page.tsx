import { ContactCTA } from "@/components/home/ContactCTA"
import { Hero } from "@/components/home/Hero"
import { SkillsTicker } from "@/components/home/SkillsTicker"
import { WorkPreview } from "@/components/home/WorkPreview"
import { Section } from "@/components/layout/Section"
import { AnimatedReveal } from "@/components/shared/AnimatedReveal"
import { ExperienceSection } from "@/components/shared/ExperienceSection"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { Button } from "@/components/ui/Button"

export default function HomePage() {
  return (
    <>
      <Hero />
      <SkillsTicker />
      <WorkPreview />
      <ExperienceSection compact />
      <Section id="about">
        <AnimatedReveal>
          <SectionTitle eyebrow="About Dafi" title="Frontend developer who adapts across stacks and ships reliable interfaces." />
        </AnimatedReveal>
        <AnimatedReveal delay={0.06} className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <p className="text-lg leading-relaxed text-muted">
            Dafi is a frontend developer who can work across legacy systems and modern stacks,
            building dashboards, internal tools, portfolio systems, and polished web interfaces.
            He also builds mobile apps with React Native when the product needs it.
          </p>
          <div className="md:text-right">
            <Button href="/about">Read about</Button>
          </div>
        </AnimatedReveal>
      </Section>
      <ContactCTA />
    </>
  )
}
