import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { DeleteErrorResponse, DeleteResponse } from "@/types/api";

async function deleteProject(slug: string) {
  const response = await axios.delete<DeleteResponse>(`/api/projects/${encodeURIComponent(slug)}`);
  return response.data;
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
