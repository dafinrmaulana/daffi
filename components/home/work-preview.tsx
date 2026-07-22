import { Section } from "@/components/layout/section";
import { SectionTitle } from "@/components/shared/section-title";
import { ProjectCard } from "@/components/work/project-card";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/constants/main-contents";

export function WorkPreview() {
  const featured = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <Section id="work">
      <SectionTitle eyebrow="Selected Work" title="Projects built through collaboration, and real-world business requirements." />
      <div>
        {featured.map((project, index) => (
          <ProjectCard key={project.demo_url} project={project} index={index} />
        ))}
      </div>
      <div className="mt-8">
        <Button href="/work">All projects</Button>
      </div>
    </Section>
  );
}
