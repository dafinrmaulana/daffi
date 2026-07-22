import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { ExperienceSchema } from "@/lib/form/experience-schema";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import type { ExperienceWithRelations } from "@/types/experience";

async function createExperience(payload: ExperienceSchema) {
  const response = await axios.post<ApiResponse<ExperienceWithRelations>>("/api/experiences", payload);
  return response.data;
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<ExperienceWithRelations>,
    AxiosError<ValidationErrorResponse<keyof ExperienceSchema>>,
    ExperienceSchema
  >({
    mutationFn: createExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiences"] }),
  });
}
