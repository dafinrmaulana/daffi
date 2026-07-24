import { ContactCTA } from "@/components/home/contact-cta"
import { Hero } from "@/components/home/hero"
import { SkillsTicker } from "@/components/home/skills-ticker"
import { WorkPreview } from "@/components/home/work-preview"
import { Section } from "@/components/layout/section"
import { ExperienceSection } from "@/components/shared/experience-section"
import { SectionTitle } from "@/components/shared/section-title"
import { Button } from "@/components/ui/button"
import { getRecentPublicExperiences } from "@/lib/data/public-experiences"
import { getFeaturedPublicProjects } from "@/lib/data/public-projects"
import { getAllPublicSkills } from "@/lib/data/public-skills"

export default async function HomePage() {
  const [skills, projects, experiences] = await Promise.all([
    getAllPublicSkills(),
    getFeaturedPublicProjects(3),
    getRecentPublicExperiences(3),
  ])

  return (
    <>
      <Hero />
      <SkillsTicker skills={skills} />
      <WorkPreview projects={projects} />
      <ExperienceSection experiences={experiences} />
      <Section id="about">
        <SectionTitle eyebrow="About Dafi" title="Frontend developer who adapts across stacks and ships reliable interfaces." />
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <p className="text-lg leading-relaxed text-muted">
            I&apos;m a frontend developer who can work across legacy systems and modern stacks,
            building dashboards, internal tools, portfolio systems, and polished web interfaces.
            He also builds mobile apps with React Native when the product needs it.
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
