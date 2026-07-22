import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Company } from "@/prisma/generated/prisma/client";
import type { LegacyMetaPagination, PaginatedResponse } from "@/types/api";

async function getCompaniesPage(page: number, limit: number, search: string) {
  const response = await axios.get<PaginatedResponse<Company, LegacyMetaPagination>>("/api/companies", {
    params: { page, limit, search: search || undefined },
  });
  return response.data;
}

export function useGetInfiniteCompanies(search: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["companies", "infinite", { search, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getCompaniesPage(pageParam, limit, search),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
    select: (data) => ({
      ...data,
      options: data.pages.flatMap((page) =>
        page.data.map((company) => ({ value: company.slug, label: company.name })),
      ),
    }),
  });
}
