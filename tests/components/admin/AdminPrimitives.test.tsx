import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { CardGrid } from "@/components/admin/CardGrid"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { EntityCard } from "@/components/admin/EntityCard"
import { Modal } from "@/components/admin/Modal"

describe("admin presentation primitives", () => {
  it("renders a page header and entity card", () => {
    render(
      <>
        <AdminPageHeader eyebrow="Content" title="Projects" count={3} action={<button>Add project</button>} />
        <EntityCard
          eyebrow="Featured"
          title="Northstar"
          description="Portfolio project"
          meta={[{ label: "Year", value: "2026" }]}
          actions={<button>Edit project</button>}
        />
      </>,
    )

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument()
    expect(screen.getByText("3 records")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Northstar" })).toBeInTheDocument()
    expect(screen.getByText("Year")).toBeInTheDocument()
    expect(screen.getByText("2026")).toBeInTheDocument()
  })

  it("renders the shared empty state", () => {
    render(
      <CardGrid
        isEmpty
        emptyTitle="No projects yet"
        emptyDescription="Create the first project."
        emptyAction={<button>Create project</button>}
      >
        {null}
      </CardGrid>,
    )

    expect(screen.getByText("No projects yet")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument()
  })

  it("closes a modal from its overlay and close button", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal open title="Edit project" onClose={onClose}>
        Modal content
      </Modal>,
    )

    expect(screen.getByRole("dialog", { name: "Edit project" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close dialog" }))
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(
      <Modal open title="Edit project" onClose={onClose}>
        Modal content
      </Modal>,
    )
    await user.click(screen.getByTestId("modal-overlay"))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it("confirms a destructive action", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Delete project?"
        description="This removes the project from the current list."
        onClose={() => undefined}
        onConfirm={onConfirm}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
