import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type DeleteCompanyResponse = {
  message: string;
};

export type DeleteCompanyErrorResponse = {
  message: string;
  error?: string;
};

async function deleteCompany(id: number): Promise<DeleteCompanyResponse> {
  const response = await axios.delete<DeleteCompanyResponse>(`/api/companies/${id}`);

  return response.data;
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<DeleteCompanyResponse, AxiosError<DeleteCompanyErrorResponse>, number>({
    mutationFn: deleteCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}
