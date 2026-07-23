"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import Input from "@/components/form/input";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/lib/services/auth/login";

type LoginFormValues = {
  username: string;
  password: string;
  remember: boolean;
};

type LoginFormProps = {
  next: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setSubmitError("");
    loginMutation.mutate(
      { ...values, next },
      {
        onSuccess: (response) => {
          router.replace(response.data.redirectTo);
          router.refresh();
        },
        onError: (error) => {
          const fieldErrors = error.response?.data.errors;

          if (fieldErrors) {
            for (const [field, messages] of Object.entries(
              fieldErrors,
            )) {
              const message = messages?.[0];

              if (
                message &&
                (field === "username" || field === "password")
              ) {
                setError(field, { type: "server", message });
              }
            }
          }

          setSubmitError(
            error.response?.data.message ??
              "Unable to sign in. Please try again.",
          );
        },
      },
    );
  };

  return (
    <form className="mt-10 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      {submitError && (
        <Alert
          color="error"
          message={submitError}
          onClose={() => setSubmitError("")}
        />
      )}

      <Input
        id="username"
        type="text"
        autoComplete="username"
        label="Username"
        placeholder="Enter your username"
        prefixIcon={{ icon: UserRound }}
        controlClassName="mt-2 min-h-14"
        className="py-4"
        errorMessage={errors.username?.message}
        {...register("username", {
          required: "Username is required.",
        })}
      />

      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        label="Password"
        placeholder="Enter your password"
        prefixIcon={{ icon: LockKeyhole }}
        controlClassName="mt-2 min-h-14"
        className="py-4"
        errorMessage={errors.password?.message}
        suffix={
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="mr-2 h-10 min-h-10 w-10 border-0 text-muted hover:bg-transparent hover:text-fg"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </Button>
        }
        {...register("password", {
          required: "Password is required.",
        })}
      />

      <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-current" {...register("remember")} />
        Remember me
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="flex w-full items-center justify-between"
        loading={loginMutation.isPending}
        loadingText="Signing in..."
      >
        Sign in
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
