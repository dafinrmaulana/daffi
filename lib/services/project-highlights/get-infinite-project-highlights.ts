import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

import type { ProjectHighlight } from "@/prisma/generated/prisma/client";
import type { MetaPagination, PaginatedResponse } from "@/types/api";

async function getProjectHighlightsPage(page: number, limit: number, search: string) {
  const response = await axios.get<PaginatedResponse<ProjectHighlight, MetaPagination>>("/api/project-highlights", {
    params: { page, limit, search: search || undefined },
  });
  return response.data;
}

export function useGetInfiniteProjectHighlights(search: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["project-highlights", "infinite", { search, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getProjectHighlightsPage(pageParam, limit, search),
    getNextPageParam: (lastPage) => (lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined),
    select: (data) => ({
      ...data,
      options: data.pages.flatMap((page) =>
        page.data.map((highlight) => ({ value: highlight.slug, label: highlight.name })),
      ),
    }),
  });
}
