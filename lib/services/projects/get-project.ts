import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { ApiResponse } from "@/types/api";
import type { ProjectWithRelations } from "@/types/project";

async function getProject(slug: string) {
  const response = await axios.get<ApiResponse<ProjectWithRelations>>(`/api/projects/${encodeURIComponent(slug)}`);
  return response.data;
}

export function useGetProject(slug: string) {
  return useQuery({
    queryKey: ["projects", slug],
    queryFn: () => getProject(slug),
    enabled: Boolean(slug),
  });
}
