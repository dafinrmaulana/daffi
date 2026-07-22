import { TagSchema } from "@/lib/form/tag-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type UpdateTagPayload = Partial<TagSchema>;

export type UpdateTagResponse = {
  message: string;
  data: TagSchema;
};

export type TagValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof TagSchema, string[]>>;
};

async function updateTag({ id, payload }: { id: string; payload: UpdateTagPayload }) {
  const response = await axios.patch<UpdateTagResponse>(`/api/tags/${id}`, payload);

  return response.data;
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateTag>>,
    AxiosError<TagValidationErrorResponse>,
    {
      id: string;
      payload: UpdateTagPayload;
    }
  >({
    mutationFn: updateTag,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["tags"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["tags", variables.id],
      });
    },
  });
}
