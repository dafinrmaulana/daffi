import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { RichTextContent } from "@/components/shared/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatExperiencePeriod } from "@/lib/experience";
import type { ExperienceWithRelations } from "@/types/experience";

export function ExperienceDetail({ experience, listUrl, editUrl, onDelete }: { experience: ExperienceWithRelations; listUrl: string; editUrl: string; onDelete: () => void }) {
  return (
    <article>
      <div className="border-b border-border pb-8">
        <Button href={listUrl} externalIcon={false} size="sm" variant="secondary"><ArrowLeft size={14} />Back</Button>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{experience.company.name}</p>
        <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-none sm:text-6xl">{experience.role}</h1>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-muted">
          <span>{formatExperiencePeriod(experience.startDate, experience.endDate)}</span>
          <span>{experience.location}</span>
          {experience.projectHighlight && <span>{experience.projectHighlight.name}</span>}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {experience.skills.map((skill) => <Badge key={skill.slug}>{skill.name}</Badge>)}
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <Button href={editUrl} externalIcon={false} variant="primary"><Pencil size={15} />Edit Experience</Button>
          <Button type="button" variant="secondary" onClick={onDelete}><Trash2 size={15} />Delete</Button>
        </div>
      </div>
      <div className="grid gap-8 py-9 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Description</p>
        <RichTextContent html={experience.description} className="max-w-3xl" />
      </div>
    </article>
  );
}
