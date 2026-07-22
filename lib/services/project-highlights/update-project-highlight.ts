import { ProjectHighlightSchema } from "@/lib/form/project-highlight-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type UpdateProjectHighlightPayload = Partial<ProjectHighlightSchema>;

export type UpdateProjectHighlightResponse = {
  message: string;
  data: ProjectHighlightSchema;
};

export type ProjectHighlightValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof ProjectHighlightSchema, string[]>>;
};

async function updateProjectHighlight({ id, payload }: { id: string; payload: UpdateProjectHighlightPayload }) {
  const response = await axios.patch<UpdateProjectHighlightResponse>(`/api/project-highlights/${id}`, payload);

  return response.data;
}

export function useUpdateProjectHighlight() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateProjectHighlight>>,
    AxiosError<ProjectHighlightValidationErrorResponse>,
    {
      id: string;
      payload: UpdateProjectHighlightPayload;
    }
  >({
    mutationFn: updateProjectHighlight,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["project-highlights"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["project-highlights", variables.id],
      });
    },
  });
}
