import type { TagSchema, UpdateTagSchema } from "@/lib/form/tag-schema";
import type { Tag } from "@/prisma/generated/prisma/client";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type UpdateTagVariables = MutationVariables<UpdateTagSchema, "slug">;

async function updateTag({ slug, payload }: UpdateTagVariables) {
  const response = await axios.patch<ApiResponse<Tag>>(`/api/tags/${encodeURIComponent(slug)}`, payload);

  return response.data;
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateTag>>,
    AxiosError<ValidationErrorResponse<keyof TagSchema>>,
    UpdateTagVariables
  >({
    mutationFn: updateTag,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tags"] }),
        queryClient.invalidateQueries({ queryKey: ["tags", variables.slug] }),
        queryClient.invalidateQueries({ queryKey: ["tags", data.data.slug] }),
      ]);
    },
  });
}
