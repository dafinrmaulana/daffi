import type { TagSchema } from "@/lib/form/tag-schema";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

async function createTag(payload: TagSchema) {
  const response = await axios.post<ApiResponse<TagSchema>>("/api/tags", payload);

  return response.data;
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof createTag>>,
    AxiosError<ValidationErrorResponse<keyof TagSchema>>,
    TagSchema
  >({
    mutationFn: createTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },
  });
}
