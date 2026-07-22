import { UserSchema } from "@/lib/form/user-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type UpdateUserPayload = Partial<UserSchema>;

export type UpdateUserResponse = {
  message: string;
  data: UserSchema;
};

export type ValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof UserSchema, string[]>>;
};

async function updateUser({ id, payload }: { id: string; payload: UpdateUserPayload }) {
  const response = await axios.patch<UpdateUserResponse>(`/api/users/${id}`, payload);
  return response.data;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof updateUser>>,
    AxiosError<ValidationErrorResponse>,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: updateUser,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
      });
    },
  });
}
