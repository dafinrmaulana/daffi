import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Company } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse, QueryParams } from "@/types/api";

async function getCompanies({
  page = 1,
  limit = 10,
  search = "",
}: QueryParams): Promise<PaginatedResponse<Company>> {
  const response = await axios.get<PaginatedResponse<Company>>("/api/companies", {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return response.data;
}

export function useGetCompanies(params: QueryParams = {}) {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: [
      "companies",
      {
        page,
        limit,
        search,
      },
    ],
    queryFn: () =>
      getCompanies({
        page,
        limit,
        search,
      }),
    placeholderData: keepPreviousData,
  });
}
