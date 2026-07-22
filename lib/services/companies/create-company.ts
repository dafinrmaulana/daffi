import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { CompanySchema } from "@/lib/form/company-schema";
import type { Company } from "@/prisma/generated/prisma/client";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";

async function createCompany(payload: CompanySchema): Promise<ApiResponse<Company>> {
  const response = await axios.post<ApiResponse<Company>>("/api/companies", payload);

  return response.data;
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Company>, AxiosError<ValidationErrorResponse<keyof CompanySchema>>, CompanySchema>({
    mutationFn: createCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}
