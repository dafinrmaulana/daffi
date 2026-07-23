import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatProjectYear } from "@/lib/project";
import { getAdminPaginationUrl } from "@/lib/pagination/admin-pagination";
import type { ProjectWithRelations } from "@/types/project";

export function ProjectCard({ project, page, limit, onDelete }: { project: ProjectWithRelations; page: number; limit: number; onDelete: () => void }) {
  return (
    <article className="grid overflow-hidden border border-border bg-bg lg:grid-cols-[22rem_minmax(0,1fr)_18rem]">
      <div className="aspect-video bg-muted/10 lg:aspect-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{project.company.name}</p>
          {project.featured && <Badge className="border-fg text-fg">Featured</Badge>}
        </div>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{project.title}</h2>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {project.role} · {formatProjectYear(project.year)}
        </p>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{project.excerpt}</p>
        {project.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{project.tags.map((tag) => <Badge key={tag.slug}>{tag.name}</Badge>)}</div>}
      </div>
      <div className="flex flex-col border-t border-border p-5 lg:border-l lg:border-t-0">
        {project.metric && <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Headline Metric</p><p className="mt-2 font-serif text-2xl">{project.metric}</p></div>}
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Button href={getAdminPaginationUrl(`/admin/projects/${project.slug}`, page, limit)} externalIcon={false} size="sm"><Eye size={14} />View</Button>
          <Button href={getAdminPaginationUrl(`/admin/projects/${project.slug}/edit`, page, limit)} externalIcon={false} size="sm"><Pencil size={14} />Edit</Button>
          <Button type="button" size="sm" variant="secondary" onClick={onDelete}><Trash2 size={14} />Delete</Button>
        </div>
      </div>
    </article>
  );
}
