import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SimpleCrudPage } from "@/components/layout/CrudLayout"

describe("SimpleCrudPage", () => {
  it("creates a user through the modal", async () => {
    const user = userEvent.setup()
    render(<SimpleCrudPage kind="users" />)

    await user.click(screen.getByRole("button", { name: "Add user" }))
    const dialog = screen.getByRole("dialog", { name: "Create user" })
    await user.type(within(dialog).getByLabelText("Name"), "New Editor")
    await user.type(within(dialog).getByLabelText("Username"), "new-editor")
    await user.type(within(dialog).getByLabelText("Email"), "new@example.com")
    await user.click(within(dialog).getByRole("button", { name: "Save user" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "New Editor" })).toBeInTheDocument()
    expect(screen.getByText("3 records")).toBeInTheDocument()
  })

  it("edits an existing user through the modal", async () => {
    const user = userEvent.setup()
    render(<SimpleCrudPage kind="users" />)

    await user.click(screen.getByRole("button", { name: "Edit Dafi Nurrohman" }))
    const dialog = screen.getByRole("dialog", { name: "Edit user" })
    const name = within(dialog).getByLabelText("Name")
    await user.clear(name)
    await user.type(name, "Dafi Updated")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))

    expect(screen.getByRole("heading", { name: "Dafi Updated" })).toBeInTheDocument()
  })

  it("cancels and confirms deletion", async () => {
    const user = userEvent.setup()
    render(<SimpleCrudPage kind="users" />)

    await user.click(screen.getByRole("button", { name: "Delete Dafi Nurrohman" }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByRole("heading", { name: "Dafi Nurrohman" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete Dafi Nurrohman" }))
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.queryByRole("heading", { name: "Dafi Nurrohman" })).not.toBeInTheDocument()
  })

  it("shows the empty state after all records are deleted", async () => {
    const user = userEvent.setup()
    render(<SimpleCrudPage kind="skills" />)

    for (const name of ["React", "TypeScript"]) {
      await user.click(screen.getByRole("button", { name: `Delete ${name}` }))
      await user.click(screen.getByRole("button", { name: "Delete" }))
    }

    expect(screen.getByText("No skills yet")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Add skill" }).length).toBeGreaterThan(0)
  })
})
