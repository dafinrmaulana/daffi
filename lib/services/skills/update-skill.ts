import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import type { SkillSchema, UpdateSkillSchema } from "@/lib/form/skill-schema";
import type { Skill } from "@/prisma/generated/prisma/client";

export type UpdateSkillPayload = {
  slug: string;
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

async function updateSkill({ slug, payload }: UpdateSkillPayload): Promise<UpdateSkillResponse> {
  const response = await axios.patch<UpdateSkillResponse>(`/api/skills/${encodeURIComponent(slug)}`, payload);

  return response.data;
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation<UpdateSkillResponse, AxiosError<SkillValidationErrorResponse>, UpdateSkillPayload>({
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
