import "server-only";

import { createPaginationMeta } from "@/lib/data/public-pagination";
import prisma from "@/lib/providers/prisma";
import type { PaginatedResponse } from "@/types/api";
import type {
  PublicListInput,
  PublicSkill,
} from "@/types/public-content";

const publicSkillSelect = {
  slug: true,
  name: true,
  description: true,
};

export async function listPublicSkills({
  page = 1,
  limit = 10,
}: PublicListInput = {}): Promise<PaginatedResponse<PublicSkill>> {
  const [skills, total] = await Promise.all([
    prisma.skill.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
      select: publicSkillSelect,
    }),
    prisma.skill.count(),
  ]);

  return {
    data: skills,
    meta: createPaginationMeta(page, limit, total),
  };
}

export function getAllPublicSkills() {
  return prisma.skill.findMany({
    orderBy: { name: "asc" },
    select: publicSkillSelect,
  });
}
