import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { SkillSchema, UpdateSkillSchema } from "@/lib/form/skill-schema";
import type { Skill } from "@/prisma/generated/prisma/client";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";

async function updateSkill({
  slug,
  payload,
}: MutationVariables<UpdateSkillSchema, "slug">): Promise<ApiResponse<Skill>> {
  const response = await axios.patch<ApiResponse<Skill>>(`/api/skills/${encodeURIComponent(slug)}`, payload);

  return response.data;
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Skill>,
    AxiosError<ValidationErrorResponse<keyof SkillSchema>>,
    MutationVariables<UpdateSkillSchema, "slug">
  >({
    mutationFn: updateSkill,

    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["skills"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["skills", variables.slug],
        }),

        queryClient.invalidateQueries({
          queryKey: ["skills", data.data.slug],
        }),
      ]);
    },
  });
}
