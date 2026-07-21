import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ComplexEntityForm } from "@/components/admin/ComplexEntityForm"
import { ComplexIndexPage } from "@/components/admin/ComplexIndexPage"

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("complex admin CRUD", () => {
  beforeEach(() => push.mockReset())

  it("renders slug routes and deletes project cards", async () => {
    const user = userEvent.setup()
    render(<ComplexIndexPage kind="projects" />)

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Add project" })).toHaveAttribute("href", "/admin/projects/create")
    expect(screen.getByRole("link", { name: "Edit Northstar Commerce" })).toHaveAttribute(
      "href",
      "/admin/projects/northstar-commerce/edit",
    )

    await user.click(screen.getByRole("button", { name: "Delete Northstar Commerce" }))
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.queryByRole("heading", { name: "Northstar Commerce" })).not.toBeInTheDocument()
  })

  it("renders and submits every project field", async () => {
    const user = userEvent.setup()
    render(<ComplexEntityForm kind="projects" />)

    expect(screen.getByRole("heading", { name: "Create project" })).toBeInTheDocument()
    for (const label of [
      "Slug", "Title", "Company", "Role", "Year", "Demo URL", "Thumbnail",
      "Metric", "Excerpt", "Featured", "Tags", "Body", "Metrics JSON",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }

    await user.click(screen.getByRole("button", { name: "Save project" }))
    expect(push).toHaveBeenCalledWith("/admin/projects")
  })

  it("populates a post by slug", () => {
    render(<ComplexEntityForm kind="posts" slug="dense-interfaces" />)

    expect(screen.getByRole("heading", { name: "Edit post" })).toBeInTheDocument()
    expect(screen.getByLabelText("Slug")).toHaveValue("dense-interfaces")
    expect(screen.getByLabelText("Published")).toBeChecked()
  })

  it("renders a missing-slug state", () => {
    render(<ComplexEntityForm kind="experiences" slug="missing" />)

    expect(screen.getByText("Experience not found")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back to experiences" })).toHaveAttribute(
      "href",
      "/admin/experiences",
    )
  })
})
