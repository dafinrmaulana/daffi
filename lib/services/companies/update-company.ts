import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { CompanySchema, UpdateCompanySchema } from "@/lib/form/company-schema";
import type { Company } from "@/prisma/generated/prisma/client";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";

async function updateCompany({
  slug,
  payload,
}: MutationVariables<UpdateCompanySchema, "slug">): Promise<ApiResponse<Company>> {
  const response = await axios.patch<ApiResponse<Company>>(`/api/companies/${encodeURIComponent(slug)}`, payload);

  return response.data;
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Company>,
    AxiosError<ValidationErrorResponse<keyof CompanySchema>>,
    MutationVariables<UpdateCompanySchema, "slug">
  >({
    mutationFn: updateCompany,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["companies"],
        }),
        queryClient.invalidateQueries({ queryKey: ["companies", variables.slug] }),
        queryClient.invalidateQueries({ queryKey: ["companies", data.data.slug] }),
      ]);
    },
  });
}
