import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { PaginatedResponse, QueryParams } from "@/types/api";
import type { ExperienceListItem } from "@/types/experience";

async function getExperiences(params: Required<QueryParams>) {
  const response = await axios.get<PaginatedResponse<ExperienceListItem>>("/api/experiences", {
    params: { ...params, search: params.search || undefined },
  });
  return response.data;
}

export function useGetExperiences(params: QueryParams = {}) {
  const query = { page: params.page ?? 1, limit: params.limit ?? 10, search: params.search ?? "" };
  return useQuery({
    queryKey: ["experiences", query],
    queryFn: () => getExperiences(query),
    placeholderData: keepPreviousData,
  });
}
