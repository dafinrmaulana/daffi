import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Company } from "@/prisma/generated/prisma/client";

export type CompaniesPaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type GetCompaniesResponse = {
  data: Company[];
  meta: CompaniesPaginationMeta;
};

export type GetCompaniesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

async function getCompanies({ page = 1, limit = 10, search = "" }: GetCompaniesParams): Promise<GetCompaniesResponse> {
  const response = await axios.get<GetCompaniesResponse>("/api/companies", {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return response.data;
}

export function useGetCompanies(params: GetCompaniesParams = {}) {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: [
      "companies",
      {
        page,
        limit,
        search,
      },
    ],
    queryFn: () =>
      getCompanies({
        page,
        limit,
        search,
      }),
    placeholderData: keepPreviousData,
  });
}
