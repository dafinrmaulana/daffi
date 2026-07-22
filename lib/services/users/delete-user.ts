import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { DeleteResponse } from "@/types/api";

async function deleteUser(username: string) {
  const response = await axios.delete<DeleteResponse>(`/api/users/${encodeURIComponent(username)}`);
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
