import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { LegacyMetaPagination, PaginatedResponse, QueryParams } from "@/types/api";
import type { ProjectWithRelations } from "@/types/project";

async function getProjects(params: Required<QueryParams>) {
  const response = await axios.get<PaginatedResponse<ProjectWithRelations, LegacyMetaPagination>>("/api/projects", {
    params: { ...params, search: params.search || undefined },
  });
  return response.data;
}

export function useGetProjects(params: QueryParams = {}) {
  const query = { page: params.page ?? 1, limit: params.limit ?? 10, search: params.search ?? "" };
  return useQuery({
    queryKey: ["projects", query],
    queryFn: () => getProjects(query),
    placeholderData: keepPreviousData,
  });
}
