import { Section } from "@/components/layout/section";
import { SectionTitle } from "@/components/shared/section-title";
import { Badge } from "@/components/ui/badge";
import { experiences } from "@/lib/constants/main-contents";

export function ExperienceSection({ compact = false }: { compact?: boolean }) {
  const items = compact ? experiences.slice(0, 3) : experiences;

  return (
    <Section id="experience">
      <SectionTitle
        eyebrow="Experience"
        title="Experience building frontend applications across web, mobile, and enterprise systems."
      />
      <div className="border-t border-border">
        {items.map((item) => (
          <article
            key={`${item.company}-${item.period}`}
            className="grid gap-5 border-b border-border py-7 md:grid-cols-[180px_1fr]"
          >
            <div>
              <p className="font-mono text-xs uppercase text-muted">{item.period}</p>
              <p className="mt-2 text-sm text-muted">{item.location}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <h3 className="font-serif text-3xl leading-tight sm:text-4xl">{item.role}</h3>
                <p className="mt-2 font-mono text-xs uppercase text-muted">{item.company}</p>
                {Array.isArray(item.description) ? (
                  <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-muted">
                    {item.description.map((desc) => (
                      <li key={desc}>{desc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 max-w-2xl text-muted">{item.description}</p>
                )}
              </div>
              <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                {item.highlights.map((highlight) => (
                  <Badge key={highlight}>{highlight}</Badge>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
