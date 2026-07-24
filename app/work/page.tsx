import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { PageIntro } from "@/components/shared/page-intro";
import { ProjectCard } from "@/components/work/project-card";
import { getAllPublicProjects } from "@/lib/data/public-projects";

export const metadata: Metadata = {
  title: "Work",
};

export default async function WorkPage() {
  const projects = await getAllPublicProjects();

  return (
    <Section>
      <PageIntro
        className="mb-12"
        eyebrow="Project Archive"
        title="Project archive and selected case studies."
      />
      {projects.length > 0 ? (
        projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))
      ) : (
        <div className="border border-border p-8 sm:p-10">
          <p className="font-serif text-3xl">No Projects yet.</p>
          <p className="mt-3 text-muted">
            New work will appear here once it is ready.
          </p>
        </div>
      )}
    </Section>
  );
}
