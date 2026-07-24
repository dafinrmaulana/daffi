import { Section } from "@/components/layout/section";
import { SectionTitle } from "@/components/shared/section-title";
import { ProjectCard } from "@/components/work/project-card";
import { Button } from "@/components/ui/button";
import type { PublicProject } from "@/types/public-content";

export function WorkPreview({ projects }: { projects: PublicProject[] }) {
  if (projects.length === 0) return null;

  return (
    <Section id="work">
      <SectionTitle eyebrow="Selected Work" title="Projects built through collaboration, and real-world business requirements." />
      <div>
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
      <div className="mt-8">
        <Button href="/work">All projects</Button>
      </div>
    </Section>
  );
}
