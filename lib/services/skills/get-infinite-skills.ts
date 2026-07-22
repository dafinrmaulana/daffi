import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Skill } from "@/prisma/generated/prisma/client";
import type { LegacyMetaPagination, PaginatedResponse } from "@/types/api";

async function getSkillsPage(page: number, limit: number, search: string) {
  const response = await axios.get<PaginatedResponse<Skill, LegacyMetaPagination>>("/api/skills", {
    params: { page, limit, search: search || undefined },
  });
  return response.data;
}

export function useGetInfiniteSkills(search: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["skills", "infinite", { search, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getSkillsPage(pageParam, limit, search),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
    select: (data) => ({
      ...data,
      options: data.pages.flatMap((page) => page.data.map((skill) => ({ value: skill.slug, label: skill.name }))),
    }),
  });
}
