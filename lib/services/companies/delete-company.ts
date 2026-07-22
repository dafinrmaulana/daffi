import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { DeleteErrorResponse, DeleteResponse } from "@/types/api";

async function deleteCompany(slug: string): Promise<DeleteResponse> {
  const response = await axios.delete<DeleteResponse>(`/api/companies/${encodeURIComponent(slug)}`);

  return response.data;
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>({
    mutationFn: deleteCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}
