import { Section } from "@/components/layout/section";
import { RichTextContent } from "@/components/shared/rich-text-content";
import { SectionTitle } from "@/components/shared/section-title";
import { Badge } from "@/components/ui/badge";
import { formatExperiencePeriod } from "@/lib/experience";
import type { PublicExperience } from "@/types/public-content";

export function ExperienceSection({ experiences }: { experiences: PublicExperience[] }) {
  if (experiences.length === 0) return null;

  return (
    <Section id="experience">
      <SectionTitle
        eyebrow="Experience"
        title="Experience building frontend applications across web, mobile, and enterprise systems."
      />
      <div className="border-t border-border">
        {experiences.map((experience) => (
          <article
            key={experience.slug}
            className="grid gap-5 border-b border-border py-7 md:grid-cols-[180px_1fr]"
          >
            <div>
              <p className="font-mono text-xs uppercase text-muted">
                {formatExperiencePeriod(experience.startDate, experience.endDate)}
              </p>
              <p className="mt-2 text-sm text-muted">{experience.location}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <h3 className="font-serif text-3xl leading-tight sm:text-4xl">{experience.role}</h3>
                <p className="mt-2 font-mono text-xs uppercase text-muted">{experience.company.name}</p>
                <RichTextContent html={experience.description} className="mt-4 max-w-2xl" />
              </div>
              <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                {experience.projectHighlight && (
                  <Badge>{experience.projectHighlight.name}</Badge>
                )}
                {experience.skills.map((skill) => (
                  <Badge key={skill.slug}>{skill.name}</Badge>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
