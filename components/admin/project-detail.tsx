import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { RichTextContent } from "@/components/shared/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatProjectYear } from "@/lib/project";
import type { ProjectWithRelations } from "@/types/project";

export function ProjectDetail({ project, listUrl, editUrl, onDelete }: { project: ProjectWithRelations; listUrl: string; editUrl: string; onDelete: () => void }) {
  return (
    <article>
      <Button href={listUrl} externalIcon={false} size="sm" variant="secondary"><ArrowLeft size={14} />Back</Button>
      <div className="mt-8 overflow-hidden border border-border">
        <div className="aspect-[16/7] bg-muted/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="border-b border-border py-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{project.company.name}</p>
          {project.featured && <Badge className="border-fg text-fg">Featured</Badge>}
        </div>
        <h1 className="mt-3 max-w-5xl font-serif text-5xl leading-none sm:text-6xl">{project.title}</h1>
        <p className="mt-5 text-sm text-muted">{project.role} · {formatProjectYear(project.year)}</p>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">{project.excerpt}</p>
        {project.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{project.tags.map((tag) => <Badge key={tag.slug}>{tag.name}</Badge>)}</div>}
        <div className="mt-7 flex flex-wrap gap-2">
          {project.demoUrl && <Button href={project.demoUrl} target="_blank" rel="noopener noreferrer" variant="primary">View Demo</Button>}
          <Button href={editUrl} externalIcon={false}><Pencil size={15} />Edit Project</Button>
          <Button type="button" variant="secondary" onClick={onDelete}><Trash2 size={15} />Delete</Button>
        </div>
      </div>
      {(project.metric || project.metrics.length > 0) && (
        <section className="border-b border-border py-9">
          {project.metric && <div className="mb-7"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Headline Metric</p><p className="mt-2 font-serif text-4xl">{project.metric}</p></div>}
          {project.metrics.length > 0 && <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{project.metrics.map((metric) => <div key={metric.label} className="bg-bg p-5"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{metric.label}</dt><dd className="mt-2 font-serif text-2xl">{metric.value}</dd></div>)}</dl>}
        </section>
      )}
      <div className="grid gap-8 py-9 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Case Study</p>
        <RichTextContent html={project.body} className="max-w-3xl" />
      </div>
    </article>
  );
}
