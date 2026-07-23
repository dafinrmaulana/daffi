import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { LoginInput, LoginResponse } from "@/types/auth";
import type { ValidationErrorResponse } from "@/types/api";

type LoginError = ValidationErrorResponse<keyof LoginInput>;

async function login(payload: LoginInput) {
  const response = await axios.post<LoginResponse>(
    "/api/auth/login",
    payload,
  );

  return response.data;
}

export function useLogin() {
  return useMutation<
    LoginResponse,
    AxiosError<LoginError>,
    LoginInput
  >({
    mutationFn: login,
  });
}
