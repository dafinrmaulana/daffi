import Link from "next/link"

import { Badge } from "@/components/ui/Badge"
import { formatIndex } from "@/lib/utils"
import type { Project } from "@/lib/content"

export function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid gap-5 border-t border-border py-7 transition-colors hover:border-fg md:grid-cols-[80px_1.2fr_1fr]"
    >
      <span className="font-mono text-sm text-muted">{formatIndex(index)}</span>
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-4xl leading-none sm:text-5xl">{project.title}</h3>
          {project.wip ? <Badge>WIP</Badge> : null}
        </div>
        <p className="max-w-xl text-muted">{project.excerpt}</p>
      </div>
      <div className="flex flex-col justify-between gap-6 md:items-end md:text-right">
        <div className="flex flex-wrap gap-2 md:justify-end">
          {project.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-muted">{project.company} · {project.year}</p>
          <p className="mt-2 text-lg">{project.metric}</p>
        </div>
      </div>
    </Link>
  )
}
