import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type DeleteSkillResponse = {
  message: string;
};

export type DeleteSkillErrorResponse = {
  message: string;
  error?: string;
};

async function deleteSkill(id: number): Promise<DeleteSkillResponse> {
  const response = await axios.delete<DeleteSkillResponse>(`/api/skills/${id}`);

  return response.data;
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSkillResponse, AxiosError<DeleteSkillErrorResponse>, number>({
    mutationFn: deleteSkill,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["skills"],
      });
    },
  });
}
