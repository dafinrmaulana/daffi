import { Section } from "@/components/layout/Section"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { ProjectCard } from "@/components/work/ProjectCard"
import { Button } from "@/components/ui/Button"
import { projects } from "@/lib/content"

export function WorkPreview() {
  const featured = projects.filter((project) => project.featured).slice(0, 3)

  return (
    <Section id="work">
      <SectionTitle eyebrow="## Work" title="Selected projects with measurable product outcomes." />
      <div>
        {featured.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
      <div className="mt-8">
        <Button href="/work">All projects</Button>
      </div>
    </Section>
  )
}
