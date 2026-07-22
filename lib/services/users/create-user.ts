import { UserSchema } from "@/lib/form/user-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export type CreateUserResponse = {
  message: string;
  data: UserSchema;
};

export type ValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof UserSchema, string[]>>;
};

async function createUser(payload: UserSchema) {
  const response = await axios.post<CreateUserResponse>("/api/users", payload);
  return response.data;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof createUser>>, AxiosError<ValidationErrorResponse>, UserSchema>({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
