import type { UserSchema } from "@/lib/form/user-schema";
import type { User } from "@/prisma/generated/prisma/client";
import type { ApiResponse, MutationVariables, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type UpdateUserVariables = MutationVariables<Partial<UserSchema>, "username">;

async function updateUser({ username, payload }: UpdateUserVariables) {
  const response = await axios.patch<ApiResponse<User>>(`/api/users/${encodeURIComponent(username)}`, payload);
  return response.data;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateUser>>,
    AxiosError<ValidationErrorResponse<keyof UserSchema>>,
    UpdateUserVariables
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
