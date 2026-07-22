import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Skill } from "@/prisma/generated/prisma/client";

export type SkillsPaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type GetSkillsResponse = {
  data: Skill[];
  meta: SkillsPaginationMeta;
};

export type GetSkillsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

async function getSkills({ page = 1, limit = 10, search = "" }: GetSkillsParams): Promise<GetSkillsResponse> {
  const response = await axios.get<GetSkillsResponse>("/api/skills", {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return response.data;
}

export function useGetSkills(params: GetSkillsParams = {}) {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: [
      "skills",
      {
        page,
        limit,
        search,
      },
    ],

    queryFn: () =>
      getSkills({
        page,
        limit,
        search,
      }),

    placeholderData: keepPreviousData,
  });
}
