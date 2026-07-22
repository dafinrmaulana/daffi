import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatExperiencePeriod } from "@/lib/experience";
import type { ExperienceListItem } from "@/types/experience";

export function ExperienceCard({ experience, onDelete }: { experience: ExperienceListItem; onDelete: () => void }) {
  return (
    <article className="flex min-h-64 flex-col border border-border bg-bg p-5 sm:p-6 lg:flex-row lg:gap-10">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{experience.company.name}</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{experience.role}</h2>
        <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-relaxed text-muted">
          {experience.descriptionText || "No description"}
        </p>
        {experience.skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {experience.skills.map((skill) => <Badge key={skill.slug}>{skill.name}</Badge>)}
          </div>
        )}
      </div>
      <div className="mt-6 flex w-full flex-col border-t border-border pt-5 lg:mt-0 lg:w-80 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Period</dt><dd className="mt-1 text-sm">{formatExperiencePeriod(experience.startDate, experience.endDate)}</dd></div>
          <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Location</dt><dd className="mt-1 text-sm">{experience.location}</dd></div>
          {experience.projectHighlight && <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Project Highlight</dt><dd className="mt-1 text-sm">{experience.projectHighlight.name}</dd></div>}
        </dl>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Button href={`/admin/experiences/${experience.slug}`} externalIcon={false} size="sm"><Eye size={14} />View</Button>
          <Button href={`/admin/experiences/${experience.slug}/edit`} externalIcon={false} size="sm"><Pencil size={14} />Edit</Button>
          <Button type="button" size="sm" variant="secondary" onClick={onDelete}><Trash2 size={14} />Delete</Button>
        </div>
      </div>
    </article>
  );
}
