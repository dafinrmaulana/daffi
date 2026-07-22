import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { SkillSchema, UpdateSkillSchema } from "@/lib/form/skill.schema";
import type { Skill } from "@/prisma/generated/prisma/client";

export type UpdateSkillPayload = {
  id: number;
  payload: UpdateSkillSchema;
};

export type UpdateSkillResponse = {
  message: string;
  data: Skill;
};

export type SkillValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof SkillSchema, string[]>>;
};

async function updateSkill({ id, payload }: UpdateSkillPayload): Promise<UpdateSkillResponse> {
  const response = await axios.patch<UpdateSkillResponse>(`/api/skills/${id}`, payload);

  return response.data;
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation<UpdateSkillResponse, AxiosError<SkillValidationErrorResponse>, UpdateSkillPayload>({
    mutationFn: updateSkill,

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["skills"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["skills", variables.id],
        }),
      ]);
    },
  });
}
