import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { DeleteErrorResponse, DeleteResponse } from "@/types/api";

async function deletePost(slug: string) {
  const response = await axios.delete<DeleteResponse>(`/api/posts/${encodeURIComponent(slug)}`);
  return response.data;
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}
