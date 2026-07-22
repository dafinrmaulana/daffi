import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { DeleteResponse } from "@/types/api";

async function deleteTag(slug: string) {
  const response = await axios.delete<DeleteResponse>(`/api/tags/${encodeURIComponent(slug)}`);

  return response.data;
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },
  });
}
