import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { DeleteResponse } from "@/types/api";

async function deleteProjectHighlight(slug: string) {
  const response = await axios.delete<DeleteResponse>(
    `/api/project-highlights/${encodeURIComponent(slug)}`,
  );

  return response.data;
}

export function useDeleteProjectHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectHighlight,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-highlights"],
      });
    },
  });
}
