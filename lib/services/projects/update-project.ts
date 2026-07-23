import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { ProjectSchema, UpdateProjectSchema } from "@/lib/form/project-schema";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import type { ProjectWithRelations } from "@/types/project";

async function updateProject({ slug, payload }: MutationVariables<UpdateProjectSchema, "slug">) {
  const response = await axios.patch<ApiResponse<ProjectWithRelations>>(
    `/api/projects/${encodeURIComponent(slug)}`,
    payload,
  );
  return response.data;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ProjectWithRelations>,
    AxiosError<ValidationErrorResponse<keyof ProjectSchema>>,
    MutationVariables<UpdateProjectSchema, "slug">
  >({
    mutationFn: updateProject,
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["projects", variables.slug] }),
        queryClient.invalidateQueries({ queryKey: ["projects", response.data.slug] }),
      ]);
    },
  });
}
