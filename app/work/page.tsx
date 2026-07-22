import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { PageIntro } from "@/components/shared/page-intro";
import { ProjectCard } from "@/components/work/project-card";
import { projects } from "@/lib/constants/main-contents";

export const metadata: Metadata = {
  title: "Work",
};

export default function WorkPage() {
  return (
    <Section>
      <PageIntro
        className="mb-12"
        eyebrow="Project Archive"
        title="Project archive and selected case studies."
      />
      {projects.map((project, index) => (
        <ProjectCard key={project.demo_url} project={project} index={index} />
      ))}
    </Section>
  );
}
