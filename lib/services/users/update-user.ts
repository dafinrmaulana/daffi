import type { UpdateUserInput } from "@/lib/form/user-schema";
import type { PublicUser } from "@/lib/auth/user-dto";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type UpdateUserResponse = ApiResponse<PublicUser> & {
  sessionRevoked?: true;
};

async function updateUser({ username, payload }: MutationVariables<UpdateUserInput, "username">) {
  const response = await axios.patch<UpdateUserResponse>(`/api/users/${encodeURIComponent(username)}`, payload);
  return response.data;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateUser>>,
    AxiosError<ValidationErrorResponse<keyof UpdateUserInput>>,
    MutationVariables<UpdateUserInput, "username">
  >({
    mutationFn: updateUser,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["users", variables.username] }),
        queryClient.invalidateQueries({ queryKey: ["users", data.data.username] }),
      ]);
    },
  });
}
