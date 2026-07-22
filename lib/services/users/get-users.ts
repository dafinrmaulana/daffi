import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse, QueryParams } from "@/types/api";

export const useGetUsers = ({ page = 1, limit = 10, search = "" }: QueryParams = {}) => {
  return useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<User>>("/api/users", {
        params: { page, limit, search: search || undefined },
      });

      return data;
    },
    placeholderData: keepPreviousData,
  });
};
