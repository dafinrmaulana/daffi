import { Tag } from "@/prisma/generated/prisma/client";
import { MetaPagination } from "@/types/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export type GetTagsResponse = {
  data: Tag[];
  meta: MetaPagination;
};

export type GetTagsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const useGetTags = ({ page = 1, limit = 10, search = "" }: GetTagsParams = {}) => {
  return useQuery({
    queryKey: ["tags", { page, limit, search }],

    queryFn: async () => {
      const { data } = await axios.get<GetTagsResponse>("/api/tags", {
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
