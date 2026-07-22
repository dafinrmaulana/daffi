import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type DeleteCompanyResponse = {
  message: string;
};

export type DeleteCompanyErrorResponse = {
  message: string;
  error?: string;
};

async function deleteCompany(slug: string): Promise<DeleteCompanyResponse> {
  const response = await axios.delete<DeleteCompanyResponse>(`/api/companies/${encodeURIComponent(slug)}`);

  return response.data;
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<DeleteCompanyResponse, AxiosError<DeleteCompanyErrorResponse>, string>({
    mutationFn: deleteCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}
