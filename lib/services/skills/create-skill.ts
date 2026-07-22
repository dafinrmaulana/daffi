import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { SkillSchema } from "@/lib/form/skill-schema";
import type { Skill } from "@/prisma/generated/prisma/client";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";

async function createSkill(payload: SkillSchema): Promise<ApiResponse<Skill>> {
  const response = await axios.post<ApiResponse<Skill>>("/api/skills", payload);

  return response.data;
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Skill>, AxiosError<ValidationErrorResponse<keyof SkillSchema>>, SkillSchema>({
    mutationFn: createSkill,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["skills"],
      });
    },
  });
}
