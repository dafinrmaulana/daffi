import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { PostSchema } from "@/lib/form/post-schema";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import type { PostWithRelations } from "@/types/post";

async function createPost(payload: PostSchema) {
  const response = await axios.post<ApiResponse<PostWithRelations>>("/api/posts", payload);
  return response.data;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PostWithRelations>,
    AxiosError<ValidationErrorResponse<keyof PostSchema>>,
    PostSchema
  >({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}
