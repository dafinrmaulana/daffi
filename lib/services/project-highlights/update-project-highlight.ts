import { ProjectHighlightSchema, UpdateProjectHighlightSchema } from "@/lib/form/project-highlight-schema";
import type { ProjectHighlight } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type UpdateProjectHighlightPayload = UpdateProjectHighlightSchema;

export type UpdateProjectHighlightResponse = {
  message: string;
  data: ProjectHighlight;
};

export type ProjectHighlightValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof ProjectHighlightSchema, string[]>>;
};

type UpdateProjectHighlightVariables = {
  slug: string;
  payload: UpdateProjectHighlightPayload;
};

async function updateProjectHighlight({ slug, payload }: UpdateProjectHighlightVariables) {
  const response = await axios.patch<UpdateProjectHighlightResponse>(
    `/api/project-highlights/${encodeURIComponent(slug)}`,
    payload,
  );

  return response.data;
}

export function useUpdateProjectHighlight() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateProjectHighlight>>,
    AxiosError<ProjectHighlightValidationErrorResponse>,
    UpdateProjectHighlightVariables
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
