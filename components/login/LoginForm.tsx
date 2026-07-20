"use client"

import { useState } from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = () => undefined

  return (
    <form className="mt-10 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-[0.14em]">
          Email
        </label>
        <div className="mt-2 flex min-h-14 items-center border border-border bg-bg transition-colors focus-within:border-fg">
          <Mail className="ml-4 shrink-0 text-muted" size={18} aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-muted"
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address.",
              },
            })}
          />
        </div>
        {errors.email && (
          <p id="email-error" role="alert" className="mt-2 text-sm text-muted">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-[0.14em]">
          Password
        </label>
        <div className="mt-2 flex min-h-14 items-center border border-border bg-bg transition-colors focus-within:border-fg">
          <LockKeyhole className="ml-4 shrink-0 text-muted" size={18} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-muted"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required.",
            })}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
            className="mr-2 inline-flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-fg"
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="mt-2 text-sm text-muted">
            {errors.password.message}
          </p>
        )}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          className="h-4 w-4 accent-current"
          {...register("remember")}
        />
        Remember me
      </label>

      <button
        type="submit"
        className="flex min-h-14 w-full items-center justify-between border border-fg bg-fg px-5 text-sm font-medium text-bg transition-colors hover:bg-bg hover:text-fg focus:outline-none focus:ring-2 focus:ring-fg focus:ring-offset-2 focus:ring-offset-bg"
      >
        Sign in
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  )
}
