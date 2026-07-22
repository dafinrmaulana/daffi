import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type DeleteSkillResponse = {
  message: string;
};

export type DeleteSkillErrorResponse = {
  message: string;
  error?: string;
};

async function deleteSkill(slug: string): Promise<DeleteSkillResponse> {
  const response = await axios.delete<DeleteSkillResponse>(`/api/skills/${encodeURIComponent(slug)}`);

  return response.data;
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSkillResponse, AxiosError<DeleteSkillErrorResponse>, string>({
    mutationFn: deleteSkill,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["skills"],
      });
    },
  });
}
