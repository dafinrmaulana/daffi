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
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-12 bg-fg" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Project Archive
          </p>
        </div>
        <h1 className="max-w-5xl font-serif text-6xl leading-[0.92] sm:text-8xl">
          Project archive and selected case studies.
        </h1>
      </div>
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </Section>
  )
}
