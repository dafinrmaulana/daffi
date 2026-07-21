import { ProjectHighlight } from "@/prisma/generated/prisma/client";
import { MetaPagination } from "@/types/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export type GetProjectHighlightsResponse = {
  data: ProjectHighlight[];
  meta: MetaPagination;
};

export type GetProjectHighlightsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const useGetProjectHighlights = ({ page = 1, limit = 10, search = "" }: GetProjectHighlightsParams = {}) => {
  return useQuery({
    queryKey: ["project-highlights", { page, limit, search }],
    queryFn: async () => {
      const { data } = await axios.get<GetProjectHighlightsResponse>("/api/project-highlights", {
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
