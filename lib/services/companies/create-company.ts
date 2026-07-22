import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { CompanySchema } from "@/lib/form/company-schema";
import type { Company } from "@/prisma/generated/prisma/client";

export type CreateCompanyResponse = {
  message: string;
  data: Company;
};

export type CompanyValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof CompanySchema, string[]>>;
};

async function createCompany(payload: CompanySchema): Promise<CreateCompanyResponse> {
  const response = await axios.post<CreateCompanyResponse>("/api/companies", payload);

  return response.data;
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CreateCompanyResponse, AxiosError<CompanyValidationErrorResponse>, CompanySchema>({
    mutationFn: createCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}
