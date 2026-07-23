import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { PostSchema, UpdatePostSchema } from "@/lib/form/post-schema";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import type { PostWithRelations } from "@/types/post";

async function updatePost({ slug, payload }: MutationVariables<UpdatePostSchema, "slug">) {
  const response = await axios.patch<ApiResponse<PostWithRelations>>(
    `/api/posts/${encodeURIComponent(slug)}`,
    payload,
  );
  return response.data;
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PostWithRelations>,
    AxiosError<ValidationErrorResponse<keyof PostSchema>>,
    MutationVariables<UpdatePostSchema, "slug">
  >({
    mutationFn: updatePost,
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: ["posts", variables.slug] }),
        queryClient.invalidateQueries({ queryKey: ["posts", response.data.slug] }),
      ]);
    },
  });
}
