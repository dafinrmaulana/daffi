import type { ProjectHighlightSchema, UpdateProjectHighlightSchema } from "@/lib/form/project-highlight-schema";
import type { ProjectHighlight } from "@/prisma/generated/prisma/client";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

async function updateProjectHighlight({
  slug,
  payload,
}: MutationVariables<UpdateProjectHighlightSchema, "slug">) {
  const response = await axios.patch<ApiResponse<ProjectHighlight>>(
    `/api/project-highlights/${encodeURIComponent(slug)}`,
    payload,
  );

  return response.data;
}

export function useUpdateProjectHighlight() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateProjectHighlight>>,
    AxiosError<ValidationErrorResponse<keyof ProjectHighlightSchema>>,
    MutationVariables<UpdateProjectHighlightSchema, "slug">
  >({
    mutationFn: updateProjectHighlight,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project-highlights"] }),
        queryClient.invalidateQueries({ queryKey: ["project-highlights", variables.slug] }),
        queryClient.invalidateQueries({ queryKey: ["project-highlights", data.data.slug] }),
      ]);
    },
  });
}
