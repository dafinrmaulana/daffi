"use client"

import { useState } from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"

import Input from "@/components/form/input"
import { Button } from "@/components/ui/button"

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
      <Input
        id="email"
        type="text"
        inputMode="email"
        autoComplete="email"
        label="Email"
        placeholder="you@example.com"
        prefixIcon={{ icon: Mail }}
        controlClassName="mt-2 min-h-14"
        className="py-4"
        {...register("email")}
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
        {...register("password")}
      />

      <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          className="h-4 w-4 accent-current"
          {...register("remember")}
        />
        Remember me
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full justify-between px-5 text-sm font-medium hover:bg-bg hover:text-fg hover:opacity-100"
      >
        Sign in
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </form>
  )
}
