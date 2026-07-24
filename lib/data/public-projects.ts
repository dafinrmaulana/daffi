import "server-only";

import { createPaginationMeta } from "@/lib/data/public-pagination";
import { parseProjectMetrics } from "@/lib/project";
import prisma from "@/lib/providers/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  PublicListInput,
  PublicProject,
} from "@/types/public-content";

const publicProjectSelect = {
  slug: true,
  title: true,
  role: true,
  year: true,
  demoUrl: true,
  thumbnail: true,
  metric: true,
  excerpt: true,
  featured: true,
  body: true,
  metrics: true,
  company: {
    select: { slug: true, name: true, companyLogo: true },
  },
  tags: {
    orderBy: { name: "asc" as const },
    select: { slug: true, name: true },
  },
} satisfies Prisma.ProjectSelect;

const projectOrder = [
  { featured: "desc" as const },
  { year: "desc" as const },
  { createdAt: "desc" as const },
];

type SelectedProject = Prisma.ProjectGetPayload<{
  select: typeof publicProjectSelect;
}>;

function serializePublicProject(project: SelectedProject): PublicProject {
  return {
    ...project,
    metrics: parseProjectMetrics(project.metrics),
  };
}

export async function listPublicProjects({
  page = 1,
  limit = 10,
}: PublicListInput = {}): Promise<PaginatedResponse<PublicProject>> {
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: projectOrder,
      select: publicProjectSelect,
    }),
    prisma.project.count(),
  ]);

  return {
    data: projects.map(serializePublicProject),
    meta: createPaginationMeta(page, limit, total),
  };
}

export async function getAllPublicProjects() {
  const projects = await prisma.project.findMany({
    orderBy: projectOrder,
    select: publicProjectSelect,
  });

  return projects.map(serializePublicProject);
}

export async function getFeaturedPublicProjects(limit = 3) {
  const projects = await prisma.project.findMany({
    where: { featured: true },
    take: limit,
    orderBy: projectOrder,
    select: publicProjectSelect,
  });

  return projects.map(serializePublicProject);
}

export async function getPublicProject(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    select: publicProjectSelect,
  });

  return project ? serializePublicProject(project) : null;
}
