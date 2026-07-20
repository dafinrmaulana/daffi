import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AdminShell } from "@/components/admin/AdminShell"

const usePathname = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}))

vi.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Toggle theme</button>,
}))

describe("AdminShell", () => {
  beforeEach(() => {
    usePathname.mockReset()
    usePathname.mockReturnValue("/admin")
  })

  it("renders the complete admin navigation and active route", () => {
    usePathname.mockReturnValue("/admin/projects")

    render(
      <AdminShell>
        <div>Projects content</div>
      </AdminShell>,
    )

    expect(screen.getAllByText("Admin Workspace").length).toBeGreaterThan(0)
    expect(screen.getAllByRole("link", { name: "Dashboard" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("link", { name: "Projects" })[0]).toHaveAttribute("aria-current", "page")
    expect(screen.getAllByRole("link", { name: "Users" }).length).toBeGreaterThan(0)
    expect(screen.getByText("Projects content")).toBeInTheDocument()
  })

  it("opens and closes the mobile sidebar drawer", async () => {
    const user = userEvent.setup()

    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>,
    )

    const drawer = screen.getByTestId("admin-mobile-drawer")
    expect(drawer).toHaveClass("-translate-x-full")

    await user.click(screen.getByRole("button", { name: "Open admin menu" }))
    expect(drawer).toHaveClass("translate-x-0")
    expect(screen.getByTestId("admin-drawer-overlay")).toHaveClass("opacity-100")

    await user.click(within(drawer).getByRole("button", { name: "Close admin menu" }))
    expect(drawer).toHaveClass("-translate-x-full")
  })

  it("closes the mobile drawer through the overlay", async () => {
    const user = userEvent.setup()
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>,
    )

    await user.click(screen.getByRole("button", { name: "Open admin menu" }))
    await user.click(screen.getByTestId("admin-drawer-overlay"))

    expect(screen.getByTestId("admin-mobile-drawer")).toHaveClass("-translate-x-full")
  })
})
