import { TagSchema } from "@/lib/form/tag-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type CreateTagResponse = {
  message: string;
  data: TagSchema;
};

export type TagValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof TagSchema, string[]>>;
};

async function createTag(payload: TagSchema) {
  const response = await axios.post<CreateTagResponse>("/api/tags", payload);

  return response.data;
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof createTag>>, AxiosError<TagValidationErrorResponse>, TagSchema>({
    mutationFn: createTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },
  });
}
