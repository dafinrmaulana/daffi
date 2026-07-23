import type { CreateUserInput } from "@/lib/form/user-schema";
import type { PublicUser } from "@/lib/auth/user-dto";
import type { ApiResponse, ValidationErrorResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

async function createUser(payload: CreateUserInput) {
  const response = await axios.post<ApiResponse<PublicUser>>("/api/users", payload);
  return response.data;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof createUser>>,
    AxiosError<ValidationErrorResponse<keyof CreateUserInput>>,
    CreateUserInput
  >({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
