import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { SkillSchema } from "@/lib/form/skill-schema";
import type { Skill } from "@/prisma/generated/prisma/client";

export type CreateSkillResponse = {
  message: string;
  data: Skill;
};

export type SkillValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof SkillSchema, string[]>>;
};

async function createSkill(payload: SkillSchema): Promise<CreateSkillResponse> {
  const response = await axios.post<CreateSkillResponse>("/api/skills", payload);

  return response.data;
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation<CreateSkillResponse, AxiosError<SkillValidationErrorResponse>, SkillSchema>({
    mutationFn: createSkill,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["skills"],
      });
    },
  });
}
