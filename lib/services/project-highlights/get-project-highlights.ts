import type { ProjectHighlight } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse, QueryParams } from "@/types/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetProjectHighlights = ({ page = 1, limit = 10, search = "" }: QueryParams = {}) => {
  return useQuery({
    queryKey: ["project-highlights", { page, limit, search }],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<ProjectHighlight>>("/api/project-highlights", {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });

      return data;
    },
    placeholderData: keepPreviousData,
  });
};
