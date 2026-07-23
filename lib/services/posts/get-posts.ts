import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { PaginatedResponse, QueryParams } from "@/types/api";
import type { PostWithRelations } from "@/types/post";

async function getPosts(params: Required<QueryParams>) {
  const response = await axios.get<PaginatedResponse<PostWithRelations>>("/api/posts", {
    params: { ...params, search: params.search || undefined },
  });
  return response.data;
}

export function useGetPosts(params: QueryParams = {}) {
  const query = { page: params.page ?? 1, limit: params.limit ?? 10, search: params.search ?? "" };
  return useQuery({
    queryKey: ["posts", query],
    queryFn: () => getPosts(query),
    placeholderData: keepPreviousData,
  });
}
