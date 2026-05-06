import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/Badge"
import { getProject, projects } from "@/lib/content"

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getProject(params.slug)
  return { title: project?.title ?? "Project" }
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)

  if (!project) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <p className="mb-5 font-mono text-xs uppercase text-muted">
        {project.company} · {project.year} · {project.role}
      </p>
      <h1 className="max-w-6xl font-serif text-6xl leading-none sm:text-8xl">
        {project.title}
      </h1>
      <div className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="mt-12 grid gap-4 border-y border-border py-6 sm:grid-cols-2">
        {project.metrics.map((metric) => (
          <div key={metric.label}>
            <p className="font-mono text-xs uppercase text-muted">{metric.label}</p>
            <p className="mt-2 font-serif text-5xl">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="prose prose-neutral mt-12 max-w-[65ch] dark:prose-invert">
        {project.body.map((paragraph) => (
          <p key={paragraph} className="mb-6 text-lg leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  )
}
