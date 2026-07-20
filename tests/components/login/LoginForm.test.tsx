import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LoginForm } from "@/components/login/LoginForm"

describe("LoginForm", () => {
  it("renders labeled login controls", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password")
    expect(screen.getByLabelText("Remember me")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument()
  })

  it("submits empty fields without validation feedback", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid")
    expect(screen.getByLabelText("Password")).not.toHaveAttribute("aria-invalid")
  })

  it("accepts arbitrary email text without validation feedback", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "not-an-email")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveValue("not-an-email")
  })

  it("toggles password visibility and accessible state", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const password = screen.getByLabelText("Password")
    const toggle = screen.getByRole("button", { name: "Show password" })

    expect(password).toHaveAttribute("type", "password")
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    await user.click(toggle)

    expect(password).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true")
  })

  it("keeps a valid submission on the login page", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "dafi@example.com")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveValue("dafi@example.com")
    expect(screen.getByLabelText("Password")).toHaveValue("secret")
  })
})
