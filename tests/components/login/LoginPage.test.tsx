import { render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import LoginPage, { metadata } from "@/app/login/page"

vi.mock("@/components/login/LoginForm", () => ({
  LoginForm: () => <div>Login form</div>,
}))

vi.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Toggle theme</button>,
}))

it("composes the responsive editorial login page", () => {
  const { container } = render(<LoginPage />)

  expect(metadata).toMatchObject({ title: "Login" })
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/")
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
  expect(screen.getByText("Build. Ship. Repeat.")).toBeInTheDocument()
  expect(screen.getByText("Dafi — Frontend Developer")).toBeInTheDocument()
  expect(screen.getByText("Login form")).toBeInTheDocument()
  expect(container.firstChild).toHaveClass("lg:grid-cols-[45fr_55fr]")
})
