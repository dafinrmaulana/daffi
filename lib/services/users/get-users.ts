import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { PublicUser } from "@/lib/auth/user-dto";
import type { PaginatedResponse, QueryParams } from "@/types/api";

export const useGetUsers = ({ page = 1, limit = 10, search = "" }: QueryParams = {}) => {
  return useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<PublicUser>>("/api/users", {
        params: { page, limit, search: search || undefined },
      });

      return data;
    },
    placeholderData: keepPreviousData,
  });
};
