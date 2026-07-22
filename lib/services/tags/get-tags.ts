import type { Tag } from "@/prisma/generated/prisma/client";
import type { LegacyMetaPagination, PaginatedResponse, QueryParams } from "@/types/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetTags = ({ page = 1, limit = 10, search = "" }: QueryParams = {}) => {
  return useQuery({
    queryKey: ["tags", { page, limit, search }],

    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Tag, LegacyMetaPagination>>("/api/tags", {
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
