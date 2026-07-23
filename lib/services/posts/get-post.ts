import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { ApiResponse } from "@/types/api";
import type { PostWithRelations } from "@/types/post";

async function getPost(slug: string) {
  const response = await axios.get<ApiResponse<PostWithRelations>>(`/api/posts/${encodeURIComponent(slug)}`);
  return response.data;
}

export function useGetPost(slug: string) {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => getPost(slug),
    enabled: Boolean(slug),
  });
}
