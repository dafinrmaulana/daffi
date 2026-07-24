import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { Section } from "@/components/layout/section";
import { ProjectArticle } from "@/components/work/project-article";
import { getPublicProject } from "@/lib/data/public-projects";

const getProject = cache((slug: string) => getPublicProject(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return {
    title: project.title,
    description: project.excerpt,
    alternates: { canonical: `/work/${project.slug}` },
    keywords: project.tags.map((tag) => tag.name),
    openGraph: {
      title: project.title,
      description: project.excerpt,
      images: [{ url: project.thumbnail, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt,
      images: [project.thumbnail],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <Section>
      <ProjectArticle project={project} />
    </Section>
  );
}
