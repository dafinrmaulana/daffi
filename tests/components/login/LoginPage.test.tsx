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
  const editorialPanel = screen.getByTestId("login-editorial-panel")
  const year = new Date().getFullYear()

  expect(metadata).toMatchObject({ title: "Login" })
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/")
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
  expect(screen.getByText("Login form")).toBeInTheDocument()
  expect(container.firstChild).toHaveClass("lg:grid-cols-2")
  expect(container.firstChild).not.toHaveClass("lg:grid-cols-[45fr_55fr]")
  expect(editorialPanel).toHaveClass("hidden", "lg:flex")
  expect(screen.getByText(`© ${year} Dafi. Built with Passion.`)).toBeInTheDocument()
})
