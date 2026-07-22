import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { ApiResponse } from "@/types/api";
import type { ExperienceWithRelations } from "@/types/experience";

async function getExperience(slug: string) {
  const response = await axios.get<ApiResponse<ExperienceWithRelations>>(
    `/api/experiences/${encodeURIComponent(slug)}`,
  );
  return response.data;
}

export function useGetExperience(slug: string) {
  return useQuery({
    queryKey: ["experiences", slug],
    queryFn: () => getExperience(slug),
    enabled: Boolean(slug),
  });
}
