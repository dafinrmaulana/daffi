import { ProjectHighlightSchema } from "@/lib/form/project-highlight.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type CreateProjectHighlightResponse = {
  message: string;
  data: ProjectHighlightSchema;
};

export type ProjectHighlightValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof ProjectHighlightSchema, string[]>>;
};

async function createProjectHighlight(payload: ProjectHighlightSchema) {
  const response = await axios.post<CreateProjectHighlightResponse>("/api/project-highlights", payload);

  return response.data;
}

export function useCreateProjectHighlight() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof createProjectHighlight>>,
    AxiosError<ProjectHighlightValidationErrorResponse>,
    ProjectHighlightSchema
  >({
    mutationFn: createProjectHighlight,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-highlights"],
      });
    },
  });
}
