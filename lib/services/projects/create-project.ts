import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { ProjectSchema } from "@/lib/form/project-schema";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import type { ProjectWithRelations } from "@/types/project";

async function createProject(payload: ProjectSchema) {
  const response = await axios.post<ApiResponse<ProjectWithRelations>>("/api/projects", payload);
  return response.data;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ProjectWithRelations>,
    AxiosError<ValidationErrorResponse<keyof ProjectSchema>>,
    ProjectSchema
  >({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
