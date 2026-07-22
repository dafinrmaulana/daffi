import type { ProjectHighlightSchema } from "@/lib/form/project-highlight-schema";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

async function createProjectHighlight(payload: ProjectHighlightSchema) {
  const response = await axios.post<ApiResponse<ProjectHighlightSchema>>("/api/project-highlights", payload);

  return response.data;
}

export function useCreateProjectHighlight() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof createProjectHighlight>>,
    AxiosError<ValidationErrorResponse<keyof ProjectHighlightSchema>>,
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
