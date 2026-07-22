import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { DeleteErrorResponse, DeleteResponse } from "@/types/api";

async function deleteExperience(slug: string) {
  const response = await axios.delete<DeleteResponse>(`/api/experiences/${encodeURIComponent(slug)}`);
  return response.data;
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>({
    mutationFn: deleteExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiences"] }),
  });
}
