import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Tag } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse } from "@/types/api";

async function getTagsPage(page: number, limit: number, search: string) {
  const response = await axios.get<PaginatedResponse<Tag>>("/api/tags", {
    params: { page, limit, search: search || undefined },
  });
  return response.data;
}

export function useGetInfiniteTags(search: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["tags", "infinite", { search, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getTagsPage(pageParam, limit, search),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    select: (data) => ({
      ...data,
      options: data.pages.flatMap((page) => page.data.map((tag) => ({ value: tag.slug, label: tag.name }))),
    }),
  });
}
