import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { ExperienceSchema, UpdateExperienceSchema } from "@/lib/form/experience-schema";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import type { ExperienceWithRelations } from "@/types/experience";

async function updateExperience({ slug, payload }: MutationVariables<UpdateExperienceSchema, "slug">) {
  const response = await axios.patch<ApiResponse<ExperienceWithRelations>>(
    `/api/experiences/${encodeURIComponent(slug)}`,
    payload,
  );
  return response.data;
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ExperienceWithRelations>,
    AxiosError<ValidationErrorResponse<keyof ExperienceSchema>>,
    MutationVariables<UpdateExperienceSchema, "slug">
  >({
    mutationFn: updateExperience,
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["experiences"] }),
        queryClient.invalidateQueries({ queryKey: ["experiences", variables.slug] }),
        queryClient.invalidateQueries({ queryKey: ["experiences", response.data.slug] }),
      ]);
    },
  });
}
