import type { UserSchema } from "@/lib/form/user-schema";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

async function createUser(payload: UserSchema) {
  const response = await axios.post<ApiResponse<UserSchema>>("/api/users", payload);
  return response.data;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof createUser>>,
    AxiosError<ValidationErrorResponse<keyof UserSchema>>,
    UserSchema
  >({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
