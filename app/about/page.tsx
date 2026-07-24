import type { Metadata } from "next";
import Image from "next/image";

import { Section } from "@/components/layout/section";
import { ExperienceSection } from "@/components/shared/experience-section";
import { PageIntro } from "@/components/shared/page-intro";
import { Badge } from "@/components/ui/badge";
import { getAllPublicExperiences } from "@/lib/data/public-experiences";
import { getAllPublicSkills } from "@/lib/data/public-skills";

export const metadata: Metadata = {
  title: "About",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [experiences, skills] = await Promise.all([
    getAllPublicExperiences(),
    getAllPublicSkills(),
  ]);

  return (
    <>
      <Section>
        <PageIntro
          eyebrow="Profile"
          title="Working on web and mobile applications with experience across modern and legacy systems."
        />
        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr]">
          <div className="flex items-start gap-5">
            <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border border-border bg-muted/10">
              <Image src="/images/dafi.webp" alt="Dafi" fill sizes="80px" className="object-cover" />
            </div>
            <p className="text-lg leading-relaxed text-muted">
              I build maintainable web and mobile applications across both legacy and modern technology stacks. Most of
              my work focuses on web development, while also creating mobile apps with React Native when a native
              experience is needed.
            </p>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.slug}>{skill.name}</Badge>
              ))}
            </div>
          ) : (
            <div className="border border-border p-6 text-muted">
              No Skills have been published yet.
            </div>
          )}
        </div>
      </Section>
      {experiences.length > 0 ? (
        <ExperienceSection experiences={experiences} />
      ) : (
        <Section>
          <div className="border border-border p-8 sm:p-10">
            <p className="font-serif text-3xl">No Experiences yet.</p>
            <p className="mt-3 text-muted">
              Work history will appear here once it is ready.
            </p>
          </div>
        </Section>
      )}
    </>
  );
}
