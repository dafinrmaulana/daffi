import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Skill } from "@/prisma/generated/prisma/client";
import type { LegacyMetaPagination, PaginatedResponse, QueryParams } from "@/types/api";

async function getSkills({
  page = 1,
  limit = 10,
  search = "",
}: QueryParams): Promise<PaginatedResponse<Skill, LegacyMetaPagination>> {
  const response = await axios.get<PaginatedResponse<Skill, LegacyMetaPagination>>("/api/skills", {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return response.data;
}

export function useGetSkills(params: QueryParams = {}) {
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
