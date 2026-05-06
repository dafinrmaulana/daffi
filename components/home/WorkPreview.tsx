import { Section } from "@/components/layout/Section"
import { AnimatedReveal } from "@/components/shared/AnimatedReveal"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { ProjectCard } from "@/components/work/ProjectCard"
import { Button } from "@/components/ui/Button"
import { projects } from "@/lib/content"

export function WorkPreview() {
  const featured = projects.filter((project) => project.featured).slice(0, 3)

  return (
    <Section id="work">
      <AnimatedReveal>
        <SectionTitle eyebrow="Selected Work" title="Projects shaped by product thinking and measurable outcomes." />
      </AnimatedReveal>
      <AnimatedReveal delay={0.06}>
        {featured.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </AnimatedReveal>
      <AnimatedReveal delay={0.1} className="mt-8">
        <Button href="/work">All projects</Button>
      </AnimatedReveal>
    </Section>
  )
}
