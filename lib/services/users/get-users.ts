import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/prisma/generated/prisma/client";
import { MetaPagination } from "@/types/api";

export type GetUsersResponse = {
  data: User[];
  meta: MetaPagination;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const useGetUsers = ({ page = 1, limit = 10, search = "" }: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: async () => {
      const { data } = await axios.get<GetUsersResponse>("/api/users", {
        params: { page, limit, search: search || undefined },
      });

      return data;
    },
    placeholderData: keepPreviousData,
  });
};
