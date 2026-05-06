import type { Metadata } from "next"

import { Section } from "@/components/layout/Section"
import { ProjectCard } from "@/components/work/ProjectCard"
import { projects } from "@/lib/content"

export const metadata: Metadata = {
  title: "Work",
}

export default function WorkPage() {
  return (
    <Section>
      <div className="mb-12">
        <p className="mb-4 font-mono text-xs uppercase text-muted">## Work</p>
        <h1 className="max-w-5xl font-serif text-6xl leading-none sm:text-8xl">
          Project archive and selected case studies.
        </h1>
      </div>
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </Section>
  )
}
