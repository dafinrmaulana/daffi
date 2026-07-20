# Admin Simple CRUD UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add UI-only card indexes and modal create, edit, and delete flows for Users, Companies, Skills, Tags, and Project Highlights.

**Architecture:** A typed configuration module defines the five simple entity shapes and seed fixtures. One client-side `SimpleCrudPage` owns React Hook Form, local record state, modal state, and confirmation behavior; five thin route pages select the relevant configuration.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, React Hook Form, Vitest, React Testing Library

## Global Constraints

- All data is typed mock data and resets on refresh.
- React Hook Form is used without validation rules.
- Indexes use responsive cards: one column on mobile, two on medium screens, and three on wide screens.
- Create and edit use the shared modal.
- Delete always uses the shared confirmation dialog.
- Empty collections use the shared `CardGrid` empty state.
- No database, API, server action, authentication, search, pagination, sorting, or filtering is added.
- Tests live under `tests/components/admin` and `tests/app/admin`.

---

## File Structure

- `lib/admin/simple-entities.ts`: entity types, field definitions, presentation metadata, and mock fixtures.
- `components/admin/SimpleCrudPage.tsx`: reusable local-state CRUD UI for the five simple models.
- `tests/components/admin/SimpleCrudPage.test.tsx`: add, edit, delete, cancel, and empty-state behavior.
- `tests/lib/admin/SimpleEntities.test.ts`: configuration coverage for all models and Prisma-editable fields.
- `app/admin/users/page.tsx`: Users index.
- `app/admin/companies/page.tsx`: Companies index.
- `app/admin/skills/page.tsx`: Skills index.
- `app/admin/tags/page.tsx`: Tags index.
- `app/admin/project-highlights/page.tsx`: Project Highlights index.
- `tests/app/admin/SimpleCrudRoutes.test.tsx`: route composition for all five pages.

---

### Task 1: Typed Simple Entity Configuration

**Files:**
- Create: `tests/lib/admin/SimpleEntities.test.ts`
- Create: `lib/admin/simple-entities.ts`

**Interfaces:**
- Produces: `SimpleEntityKind`, `SimpleField`, `SimpleEntityRecord`, `SimpleEntityConfig`.
- Produces: `simpleEntityConfigs: Record<SimpleEntityKind, SimpleEntityConfig>`.

- [ ] **Step 1: Write the failing configuration test**

Create `tests/lib/admin/SimpleEntities.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { simpleEntityConfigs } from "@/lib/admin/simple-entities"

describe("simpleEntityConfigs", () => {
  it.each([
    ["users", ["name", "username", "email"]],
    ["companies", ["name", "description", "companyLogo"]],
    ["skills", ["name", "description"]],
    ["tags", ["name", "description"]],
    ["projectHighlights", ["name", "description"]],
  ] as const)("defines editable fields for %s", (kind, expectedFields) => {
    const config = simpleEntityConfigs[kind]

    expect(config.fields.map((field) => field.name)).toEqual(expectedFields)
    expect(config.records.length).toBeGreaterThan(0)
    expect(config.cardTitleField).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the configuration test and verify RED**

Run:

```bash
npm test -- tests/lib/admin/SimpleEntities.test.ts
```

Expected: FAIL because `simple-entities.ts` does not exist.

- [ ] **Step 3: Implement the typed configurations and fixtures**

Create `lib/admin/simple-entities.ts`:

```ts
export type SimpleEntityKind = "users" | "companies" | "skills" | "tags" | "projectHighlights"

export type SimpleField = {
  name: string
  label: string
  type: "text" | "email" | "url" | "textarea"
  placeholder: string
}

export type SimpleEntityRecord = {
  id: string
} & Record<string, string>

export type SimpleEntityConfig = {
  eyebrow: string
  title: string
  singular: string
  cardTitleField: string
  cardDescriptionField?: string
  cardMetaFields: Array<{ field: string; label: string }>
  fields: SimpleField[]
  records: SimpleEntityRecord[]
}

export const simpleEntityConfigs: Record<SimpleEntityKind, SimpleEntityConfig> = {
  users: {
    eyebrow: "Access",
    title: "Users",
    singular: "user",
    cardTitleField: "name",
    cardMetaFields: [
      { field: "username", label: "Username" },
      { field: "email", label: "Email" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Full name" },
      { name: "username", label: "Username", type: "text", placeholder: "username" },
      { name: "email", label: "Email", type: "email", placeholder: "name@example.com" },
    ],
    records: [
      { id: "user-1", name: "Dafi Nurrohman", username: "dafi", email: "dafi@example.com" },
      { id: "user-2", name: "Content Editor", username: "editor", email: "editor@example.com" },
    ],
  },
  companies: {
    eyebrow: "Directory",
    title: "Companies",
    singular: "company",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [{ field: "companyLogo", label: "Logo URL" }],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Company name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Short company description" },
      { name: "companyLogo", label: "Company logo URL", type: "url", placeholder: "https://example.com/logo.svg" },
    ],
    records: [
      { id: "company-1", name: "Northstar Studio", description: "Digital product studio.", companyLogo: "/images/project-northstar-site.svg" },
      { id: "company-2", name: "Ledgerflow", description: "Operations and finance platform.", companyLogo: "/images/project-ledgerflow.svg" },
    ],
  },
  skills: {
    eyebrow: "Profile",
    title: "Skills",
    singular: "skill",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Skill name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "How this skill is used" },
    ],
    records: [
      { id: "skill-1", name: "React", description: "Component architecture and product interfaces." },
      { id: "skill-2", name: "TypeScript", description: "Typed application design and maintainable systems." },
    ],
  },
  tags: {
    eyebrow: "Taxonomy",
    title: "Tags",
    singular: "tag",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Tag name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "What this tag represents" },
    ],
    records: [
      { id: "tag-1", name: "Frontend", description: "Frontend engineering work." },
      { id: "tag-2", name: "Product Design", description: "Interface and product design work." },
    ],
  },
  projectHighlights: {
    eyebrow: "Experience",
    title: "Project Highlights",
    singular: "project highlight",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Highlight name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Highlight description" },
    ],
    records: [
      { id: "highlight-1", name: "Design System", description: "Built and adopted a shared component system." },
      { id: "highlight-2", name: "Platform Migration", description: "Moved a legacy interface to a modern stack." },
    ],
  },
}
```

- [ ] **Step 4: Run the configuration test and verify GREEN**

Run:

```bash
npm test -- tests/lib/admin/SimpleEntities.test.ts
```

Expected: 5 cases pass.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/simple-entities.ts tests/lib/admin/SimpleEntities.test.ts
git commit -m "feat: add simple admin entity fixtures"
```

---

### Task 2: Reusable Simple CRUD Page

**Files:**
- Create: `tests/components/admin/SimpleCrudPage.test.tsx`
- Create: `components/admin/SimpleCrudPage.tsx`

**Interfaces:**
- Consumes: `SimpleEntityKind` and `simpleEntityConfigs`.
- Produces: `SimpleCrudPage({ kind }: { kind: SimpleEntityKind })`.

- [ ] **Step 1: Write the failing CRUD interaction tests**

Create `tests/components/admin/SimpleCrudPage.test.tsx` with four tests:

```tsx
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

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
    expect(screen.getByRole("button", { name: "Add skill" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the CRUD tests and verify RED**

Run:

```bash
npm test -- tests/components/admin/SimpleCrudPage.test.tsx
```

Expected: FAIL because `SimpleCrudPage` does not exist.

- [ ] **Step 3: Implement `SimpleCrudPage`**

Create `components/admin/SimpleCrudPage.tsx` as a client component. It must:

```tsx
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { CardGrid } from "@/components/admin/CardGrid"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { EntityCard } from "@/components/admin/EntityCard"
import { Modal } from "@/components/admin/Modal"
import {
  simpleEntityConfigs,
  type SimpleEntityKind,
  type SimpleEntityRecord,
} from "@/lib/admin/simple-entities"

type SimpleFormValues = Record<string, string>

export function SimpleCrudPage({ kind }: { kind: SimpleEntityKind }) {
  const config = simpleEntityConfigs[kind]
  const [records, setRecords] = useState(() => config.records.map((record) => ({ ...record })))
  const [editing, setEditing] = useState<SimpleEntityRecord | null>(null)
  const [deleting, setDeleting] = useState<SimpleEntityRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<SimpleFormValues>()

  const emptyValues = Object.fromEntries(config.fields.map((field) => [field.name, ""]))

  const openCreate = () => {
    setEditing(null)
    reset(emptyValues)
    setIsFormOpen(true)
  }

  const openEdit = (record: SimpleEntityRecord) => {
    setEditing(record)
    reset(Object.fromEntries(config.fields.map((field) => [field.name, record[field.name] ?? ""])))
    setIsFormOpen(true)
  }

  const saveRecord = (values: SimpleFormValues) => {
    if (editing) {
      setRecords((current) =>
        current.map((record) => (record.id === editing.id ? { ...record, ...values } : record)),
      )
    } else {
      setRecords((current) => [...current, { id: `local-${Date.now()}`, ...values }])
    }
    setIsFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (!deleting) return
    setRecords((current) => current.filter((record) => record.id !== deleting.id))
    setDeleting(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openCreate}
      className="inline-flex items-center gap-2 border border-fg bg-fg px-4 py-3 text-sm text-bg"
    >
      <Plus size={16} aria-hidden="true" />
      Add {config.singular}
    </button>
  )

  return (
    <>
      <AdminPageHeader eyebrow={config.eyebrow} title={config.title} count={records.length} action={addButton} />
      <CardGrid
        isEmpty={records.length === 0}
        emptyTitle={`No ${config.title.toLowerCase()} yet`}
        emptyDescription={`Create the first ${config.singular} to populate this index.`}
        emptyAction={addButton}
      >
        {records.map((record) => {
          const title = record[config.cardTitleField]
          return (
            <EntityCard
              key={record.id}
              eyebrow={config.singular}
              title={title}
              description={config.cardDescriptionField ? record[config.cardDescriptionField] : undefined}
              meta={config.cardMetaFields.map((item) => ({
                label: item.label,
                value: record[item.field] || "—",
              }))}
              actions={
                <>
                  <button
                    type="button"
                    aria-label={`Edit ${title}`}
                    onClick={() => openEdit(record)}
                    className="border border-border px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${title}`}
                    onClick={() => setDeleting(record)}
                    className="border border-border px-3 py-2 text-sm text-muted"
                  >
                    Delete
                  </button>
                </>
              }
            />
          )
        })}
      </CardGrid>

      <Modal
        open={isFormOpen}
        title={editing ? `Edit ${config.singular}` : `Create ${config.singular}`}
        onClose={() => setIsFormOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setIsFormOpen(false)} className="border border-border px-4 py-3 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="simple-crud-form"
              className="border border-fg bg-fg px-4 py-3 text-sm text-bg"
            >
              {editing ? "Save changes" : `Save ${config.singular}`}
            </button>
          </>
        }
      >
        <form id="simple-crud-form" className="space-y-4" noValidate onSubmit={handleSubmit(saveRecord)}>
          {config.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="font-mono text-[10px] uppercase tracking-[0.14em]">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  rows={4}
                  placeholder={field.placeholder}
                  className="mt-2 w-full border border-border bg-bg px-3 py-3 outline-none focus:border-fg"
                  {...register(field.name)}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="mt-2 min-h-12 w-full border border-border bg-bg px-3 outline-none focus:border-fg"
                  {...register(field.name)}
                />
              )}
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${config.singular}?`}
        description={deleting ? `Remove ${deleting[config.cardTitleField]} from the current list.` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
```

- [ ] **Step 4: Run the CRUD tests and verify GREEN**

Run:

```bash
npm test -- tests/components/admin/SimpleCrudPage.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/admin/SimpleCrudPage.tsx tests/components/admin/SimpleCrudPage.test.tsx
git commit -m "feat: add reusable simple CRUD interactions"
```

---

### Task 3: Five Simple CRUD Routes

**Files:**
- Create: `app/admin/users/page.tsx`
- Create: `app/admin/companies/page.tsx`
- Create: `app/admin/skills/page.tsx`
- Create: `app/admin/tags/page.tsx`
- Create: `app/admin/project-highlights/page.tsx`
- Create: `tests/app/admin/SimpleCrudRoutes.test.tsx`

**Interfaces:**
- Consumes: `SimpleCrudPage({ kind })`.
- Produces: five static admin index routes.

- [ ] **Step 1: Write the failing route composition test**

Create `tests/app/admin/SimpleCrudRoutes.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import CompaniesPage from "@/app/admin/companies/page"
import ProjectHighlightsPage from "@/app/admin/project-highlights/page"
import SkillsPage from "@/app/admin/skills/page"
import TagsPage from "@/app/admin/tags/page"
import UsersPage from "@/app/admin/users/page"

describe("simple CRUD routes", () => {
  it.each([
    ["Users", UsersPage],
    ["Companies", CompaniesPage],
    ["Skills", SkillsPage],
    ["Tags", TagsPage],
    ["Project Highlights", ProjectHighlightsPage],
  ] as const)("renders the %s index", (title, Page) => {
    render(<Page />)
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the route test and verify RED**

Run:

```bash
npm test -- tests/app/admin/SimpleCrudRoutes.test.tsx
```

Expected: FAIL because the five route pages do not exist.

- [ ] **Step 3: Create the five route pages**

Create `app/admin/users/page.tsx`:

```tsx
import type { Metadata } from "next"
import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Users" }

export default function UsersPage() {
  return <SimpleCrudPage kind="users" />
}
```

Create `app/admin/companies/page.tsx`:

```tsx
import type { Metadata } from "next"
import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Companies" }

export default function CompaniesPage() {
  return <SimpleCrudPage kind="companies" />
}
```

Create `app/admin/skills/page.tsx`:

```tsx
import type { Metadata } from "next"
import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Skills" }

export default function SkillsPage() {
  return <SimpleCrudPage kind="skills" />
}
```

Create `app/admin/tags/page.tsx`:

```tsx
import type { Metadata } from "next"
import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Tags" }

export default function TagsPage() {
  return <SimpleCrudPage kind="tags" />
}
```

Create `app/admin/project-highlights/page.tsx`:

```tsx
import type { Metadata } from "next"
import { SimpleCrudPage } from "@/components/admin/SimpleCrudPage"

export const metadata: Metadata = { title: "Project Highlights" }

export default function ProjectHighlightsPage() {
  return <SimpleCrudPage kind="projectHighlights" />
}
```

- [ ] **Step 4: Run route and simple CRUD tests**

Run:

```bash
npm test -- tests/app/admin/SimpleCrudRoutes.test.tsx tests/components/admin/SimpleCrudPage.test.tsx tests/lib/admin/SimpleEntities.test.ts
```

Expected: 3 test files and 14 cases pass.

- [ ] **Step 5: Commit**

```bash
git add app/admin/users/page.tsx app/admin/companies/page.tsx app/admin/skills/page.tsx app/admin/tags/page.tsx app/admin/project-highlights/page.tsx tests/app/admin/SimpleCrudRoutes.test.tsx
git commit -m "feat: add simple admin CRUD routes"
```

---

### Task 4: Simple CRUD Verification

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all existing and simple CRUD suites pass.

- [ ] **Step 2: Run ESLint**

Run:

```bash
npm run lint
```

Expected: exit code 0.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: all five simple CRUD routes appear in the route list.

- [ ] **Step 4: Inspect repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: a clean worktree after reverting generated-only `next-env.d.ts`.
