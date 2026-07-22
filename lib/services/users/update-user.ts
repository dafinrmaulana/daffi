import { UserSchema } from "@/lib/form/user-schema";
import type { User } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type UpdateUserPayload = Partial<UserSchema>;

export type UpdateUserResponse = {
  message: string;
  data: User;
};

export type ValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof UserSchema, string[]>>;
};

type UpdateUserVariables = {
  username: string;
  payload: UpdateUserPayload;
};

async function updateUser({ username, payload }: UpdateUserVariables) {
  const response = await axios.patch<UpdateUserResponse>(`/api/users/${encodeURIComponent(username)}`, payload);
  return response.data;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateUser>>,
    AxiosError<ValidationErrorResponse>,
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
