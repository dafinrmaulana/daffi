import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/prisma/generated/prisma/client";

export type UsersMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type GetUsersResponse = {
  data: User[];
  meta: UsersMeta;
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
