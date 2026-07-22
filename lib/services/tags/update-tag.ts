import { TagSchema, UpdateTagSchema } from "@/lib/form/tag-schema";
import type { Tag } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type UpdateTagPayload = UpdateTagSchema;

export type UpdateTagResponse = {
  message: string;
  data: Tag;
};

export type TagValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof TagSchema, string[]>>;
};

type UpdateTagVariables = {
  slug: string;
  payload: UpdateTagPayload;
};

async function updateTag({ slug, payload }: UpdateTagVariables) {
  const response = await axios.patch<UpdateTagResponse>(`/api/tags/${encodeURIComponent(slug)}`, payload);

  return response.data;
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateTag>>,
    AxiosError<TagValidationErrorResponse>,
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
