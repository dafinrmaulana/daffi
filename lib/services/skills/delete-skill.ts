import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { DeleteErrorResponse, DeleteResponse } from "@/types/api";

async function deleteSkill(slug: string): Promise<DeleteResponse> {
  const response = await axios.delete<DeleteResponse>(`/api/skills/${encodeURIComponent(slug)}`);

  return response.data;
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>({
    mutationFn: deleteSkill,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["skills"],
      });
    },
  });
}
