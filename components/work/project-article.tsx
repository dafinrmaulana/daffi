import { ArrowLeft, ExternalLink } from "lucide-react";

import { RichTextContent } from "@/components/shared/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PublicProject } from "@/types/public-content";

export function ProjectArticle({ project }: { project: PublicProject }) {
  return (
    <article>
      <Button href="/work" externalIcon={false} size="sm" variant="secondary">
        <ArrowLeft size={14} />
        Back to Work
      </Button>

      <div className="mt-8 overflow-hidden border border-border">
        <div className="aspect-[16/7] bg-muted/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <header className="border-b border-border py-8 sm:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {project.company.name} · {project.role} · {project.year}
        </p>
        <h1 className="mt-4 max-w-5xl font-serif text-5xl leading-[0.95] sm:text-7xl">
          {project.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
          {project.excerpt}
        </p>

        {project.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag.slug}>{tag.name}</Badge>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {project.demoUrl && (
            <Button
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              variant="primary"
              externalIcon={false}
            >
              View Live Project
              <ExternalLink aria-hidden="true" size={15} />
            </Button>
          )}
          {project.metric && (
            <p className="text-lg text-muted">{project.metric}</p>
          )}
        </div>
      </header>

      {project.metrics.length > 0 && (
        <section className="grid gap-px border-b border-border bg-border py-px sm:grid-cols-2 lg:grid-cols-3">
          {project.metrics.map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className="bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {metric.label}
              </p>
              <p className="mt-3 font-serif text-3xl">{metric.value}</p>
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-8 py-10 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Case Study
        </p>
        <RichTextContent html={project.body} className="max-w-3xl" />
      </div>
    </article>
  );
}
