import type { Metadata } from "next";
import Image from "next/image";

import { Section } from "@/components/layout/section";
import { ExperienceSection } from "@/components/shared/experience-section";
import { PageIntro } from "@/components/shared/page-intro";
import { Badge } from "@/components/ui/badge";
import { skills } from "@/lib/constants/main-contents";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
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
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </div>
      </Section>
      <ExperienceSection />
    </>
  );
}
