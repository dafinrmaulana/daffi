import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatIndex } from "@/lib/utils";
import type { PublicProject } from "@/types/public-content";

export function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid gap-5 border-t border-border py-7 transition-colors hover:border-fg lg:grid-cols-[80px_320px_1fr]"
      aria-label={`Open project ${project.title}`}
    >
      <span className="font-mono text-sm text-muted">{formatIndex(index)}</span>
      <div className="relative aspect-[5/3] overflow-hidden border border-border bg-muted/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-h-full flex-col justify-between gap-8">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-4xl leading-none sm:text-5xl">{project.title}</h3>
          </div>
          <p className="max-w-2xl text-muted">{project.excerpt}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag.slug}>{tag.name}</Badge>
          ))}
        </div>
        <div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="font-mono text-xs uppercase text-muted">
            {project.company.name} · {project.year}
          </p>
          {project.metric && <p className="text-lg">{project.metric}</p>}
        </div>
      </div>
    </Link>
  );
}
