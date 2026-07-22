import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { CompanySchema, UpdateCompanySchema } from "@/lib/form/company-schema";
import type { Company } from "@/prisma/generated/prisma/client";

export type UpdateCompanyPayload = {
  slug: string;
  payload: UpdateCompanySchema;
};

export type UpdateCompanyResponse = {
  message: string;
  data: Company;
};

export type CompanyValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof CompanySchema, string[]>>;
};

async function updateCompany({ slug, payload }: UpdateCompanyPayload): Promise<UpdateCompanyResponse> {
  const response = await axios.patch<UpdateCompanyResponse>(`/api/companies/${encodeURIComponent(slug)}`, payload);

  return response.data;
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<UpdateCompanyResponse, AxiosError<CompanyValidationErrorResponse>, UpdateCompanyPayload>({
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
