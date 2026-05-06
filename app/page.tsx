import { ContactCTA } from "@/components/home/ContactCTA"
import { Hero } from "@/components/home/Hero"
import { SkillsTicker } from "@/components/home/SkillsTicker"
import { WorkPreview } from "@/components/home/WorkPreview"
import { Section } from "@/components/layout/Section"
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
        <SectionTitle eyebrow="## About" title="I care about interfaces that stay useful after the launch day." />
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <p className="text-lg leading-relaxed text-muted">
            Daffi is a frontend-focused builder working across product dashboards,
            portfolio systems, and content-heavy websites. The work blends careful
            interaction design with production-grade implementation.
          </p>
          <div className="md:text-right">
            <Button href="/about">Read about</Button>
          </div>
        </div>
      </Section>
      <ContactCTA />
    </>
  )
}
