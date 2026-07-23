import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function logout() {
  const response = await axios.post<{ message: string }>(
    "/api/auth/logout",
    {},
  );

  return response.data;
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
