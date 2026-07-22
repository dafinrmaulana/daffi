import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type DeleteUserResponse = {
  message: string;
};

async function deleteUser(username: string) {
  const response = await axios.delete<DeleteUserResponse>(`/api/users/${encodeURIComponent(username)}`);
  return response.data;
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
