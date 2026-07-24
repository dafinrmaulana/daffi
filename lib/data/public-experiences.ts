import "server-only";

import { createPaginationMeta } from "@/lib/data/public-pagination";
import prisma from "@/lib/providers/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  PublicExperience,
  PublicListInput,
} from "@/types/public-content";

const publicExperienceSelect = {
  slug: true,
  role: true,
  startDate: true,
  endDate: true,
  location: true,
  description: true,
  company: {
    select: { slug: true, name: true, companyLogo: true },
  },
  projectHighlight: {
    select: { slug: true, name: true, description: true },
  },
  skills: {
    orderBy: { name: "asc" as const },
    select: { slug: true, name: true, description: true },
  },
} satisfies Prisma.ExperienceSelect;

const experienceOrder = [
  { startDate: "desc" as const },
  { createdAt: "desc" as const },
];

type SelectedExperience = Prisma.ExperienceGetPayload<{
  select: typeof publicExperienceSelect;
}>;

function serializePublicExperience(
  experience: SelectedExperience,
): PublicExperience {
  return {
    ...experience,
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate?.toISOString() ?? null,
  };
}

export async function listPublicExperiences({
  page = 1,
  limit = 10,
}: PublicListInput = {}): Promise<PaginatedResponse<PublicExperience>> {
  const [experiences, total] = await Promise.all([
    prisma.experience.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: experienceOrder,
      select: publicExperienceSelect,
    }),
    prisma.experience.count(),
  ]);

  return {
    data: experiences.map(serializePublicExperience),
    meta: createPaginationMeta(page, limit, total),
  };
}

export async function getAllPublicExperiences() {
  const experiences = await prisma.experience.findMany({
    orderBy: experienceOrder,
    select: publicExperienceSelect,
  });

  return experiences.map(serializePublicExperience);
}

export async function getRecentPublicExperiences(limit = 3) {
  const experiences = await prisma.experience.findMany({
    take: limit,
    orderBy: experienceOrder,
    select: publicExperienceSelect,
  });

  return experiences.map(serializePublicExperience);
}
