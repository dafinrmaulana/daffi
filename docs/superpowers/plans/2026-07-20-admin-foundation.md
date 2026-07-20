# Admin Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the responsive admin shell, empty dashboard, and reusable presentation primitives required by later CRUD UI phases.

**Architecture:** A route-aware `SiteChrome` keeps portfolio chrome out of `/admin`, while `app/admin/layout.tsx` composes a client-side `AdminShell` around all admin pages. Shared admin primitives remain model-agnostic and accept React content through explicit props so later simple and complex CRUD pages can reuse them without database knowledge.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, Lucide React, next-themes, Vitest, React Testing Library

## Global Constraints

- `/admin` and all descendants are accessible without authentication.
- The admin uses the existing theme provider, design tokens, serif/sans/mono fonts, and square borders.
- Desktop uses a persistent approximately 260px sidebar.
- Below Tailwind `lg`, the sidebar becomes a hideable drawer with overlay.
- Sidebar identity copy is exactly `Admin Workspace`.
- The foundation must include navigation for all eight Prisma models plus Dashboard.
- The dashboard contains no statistics, charts, activity, or data widgets.
- Shared CRUD primitives are presentation-only and have no Prisma or database dependency.
- Tests live under `tests/components/admin` and `tests/app/admin`.

---

## File Structure

- `lib/admin/navigation.ts`: typed navigation metadata and active-label lookup.
- `components/admin/AdminSidebar.tsx`: sidebar identity, navigation, theme control, portfolio link, and mobile close control.
- `components/admin/AdminShell.tsx`: desktop/mobile layout, drawer state, overlay, and compact top bar.
- `components/admin/AdminPageHeader.tsx`: reusable eyebrow, title, count, and primary action region.
- `components/admin/EntityCard.tsx`: reusable bordered entity card with metadata and actions.
- `components/admin/CardGrid.tsx`: responsive card grid and shared empty state.
- `components/admin/Modal.tsx`: accessible controlled dialog presentation.
- `components/admin/ConfirmDialog.tsx`: delete confirmation specialization.
- `app/admin/layout.tsx`: admin metadata and shell composition.
- `app/admin/page.tsx`: empty dashboard route.
- `components/layout/SiteChrome.tsx`: excludes admin routes from portfolio chrome.
- `tests/components/admin/AdminShell.test.tsx`: navigation, active state, and drawer behavior.
- `tests/components/admin/AdminPrimitives.test.tsx`: page header, card grid, modal, and confirmation behavior.
- `tests/app/admin/AdminDashboard.test.tsx`: empty dashboard composition.
- `tests/components/layout/SiteChrome.test.tsx`: admin route portfolio-chrome regression.

---

### Task 1: Exclude Admin Routes from Portfolio Chrome

**Files:**
- Modify: `tests/components/layout/SiteChrome.test.tsx`
- Modify: `components/layout/SiteChrome.tsx`

**Interfaces:**
- Consumes: `usePathname(): string`.
- Produces: `SiteChrome({ children }: { children: React.ReactNode })`, which renders only `<main>` for `/login`, `/admin`, and `/admin/*`.

- [ ] **Step 1: Add the failing admin chrome regression test**

Add this case to `tests/components/layout/SiteChrome.test.tsx`:

```tsx
it.each(["/admin", "/admin/projects", "/admin/projects/create"])(
  "omits portfolio chrome on %s",
  (pathname) => {
    usePathname.mockReturnValue(pathname)

    render(
      <SiteChrome>
        <div>Admin content</div>
      </SiteChrome>,
    )

    expect(screen.queryByText("Portfolio header")).not.toBeInTheDocument()
    expect(screen.queryByText("Portfolio social rail")).not.toBeInTheDocument()
    expect(screen.queryByText("Portfolio footer")).not.toBeInTheDocument()
    expect(screen.getByRole("main")).toHaveTextContent("Admin content")
  },
)
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```bash
npm test -- tests/components/layout/SiteChrome.test.tsx
```

Expected: 3 new cases fail because admin paths still render portfolio chrome.

- [ ] **Step 3: Implement the admin route exclusion**

Replace the route condition in `components/layout/SiteChrome.tsx` with:

```tsx
const isStandaloneRoute = pathname === "/login" || pathname === "/admin" || pathname.startsWith("/admin/")

if (isStandaloneRoute) {
  return <main>{children}</main>
}
```

- [ ] **Step 4: Run the regression test and verify GREEN**

Run:

```bash
npm test -- tests/components/layout/SiteChrome.test.tsx
```

Expected: all 5 cases pass.

- [ ] **Step 5: Commit**

```bash
git add components/layout/SiteChrome.tsx tests/components/layout/SiteChrome.test.tsx
git commit -m "feat: reserve standalone admin routes"
```

---

### Task 2: Responsive Admin Shell and Navigation

**Files:**
- Create: `lib/admin/navigation.ts`
- Create: `components/admin/AdminSidebar.tsx`
- Create: `components/admin/AdminShell.tsx`
- Create: `tests/components/admin/AdminShell.test.tsx`

**Interfaces:**
- Produces: `AdminNavItem` with `href`, `label`, `icon`, and optional `exact`.
- Produces: `adminNavItems: AdminNavItem[]`.
- Produces: `getAdminPageLabel(pathname: string): string`.
- Produces: `AdminSidebar({ pathname, onNavigate }: { pathname: string; onNavigate: () => void })`.
- Produces: `AdminShell({ children }: { children: React.ReactNode })`.

- [ ] **Step 1: Write the failing shell tests**

Create `tests/components/admin/AdminShell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
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

    expect(screen.getByText("Admin Workspace")).toBeInTheDocument()
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

    await user.click(screen.getByRole("button", { name: "Close admin menu" }))
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
```

- [ ] **Step 2: Run the shell tests and verify RED**

Run:

```bash
npm test -- tests/components/admin/AdminShell.test.tsx
```

Expected: FAIL because `AdminShell` does not exist.

- [ ] **Step 3: Create typed admin navigation metadata**

Create `lib/admin/navigation.ts`:

```ts
import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react"

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/experiences", label: "Experiences", icon: BriefcaseBusiness },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/skills", label: "Skills", icon: BadgeCheck },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/project-highlights", label: "Project Highlights", icon: UsersRound },
  { href: "/admin/users", label: "Users", icon: UserRound },
]

export function isAdminNavItemActive(item: AdminNavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function getAdminPageLabel(pathname: string) {
  return adminNavItems.find((item) => isAdminNavItemActive(item, pathname))?.label ?? "Admin"
}
```

- [ ] **Step 4: Create the sidebar**

Create `components/admin/AdminSidebar.tsx`:

```tsx
import Link from "next/link"
import { ArrowUpRight, X } from "lucide-react"

import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { adminNavItems, isAdminNavItemActive } from "@/lib/admin/navigation"
import { cn } from "@/lib/utils"

export function AdminSidebar({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <span className="font-mono text-xs uppercase tracking-[0.16em]">Admin Workspace</span>
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={onNavigate}
          className="inline-flex h-9 w-9 items-center justify-center border border-border lg:hidden"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto py-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const active = isAdminNavItemActive(item, pathname)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "mx-3 flex items-center gap-3 border px-3 py-3 text-sm transition-colors",
                active
                  ? "border-fg bg-fg text-bg"
                  : "border-transparent text-muted hover:border-border hover:text-fg",
              )}
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Theme</span>
          <ThemeToggle />
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-between border border-border px-3 py-3 text-sm text-muted transition-colors hover:border-fg hover:text-fg"
        >
          Back to portfolio
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create the responsive shell**

Create `components/admin/AdminShell.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { getAdminPageLabel } from "@/lib/admin/navigation"
import { cn } from "@/lib/utils"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border lg:block">
        <AdminSidebar pathname={pathname} onNavigate={() => setIsOpen(false)} />
      </aside>

      <button
        type="button"
        data-testid="admin-drawer-overlay"
        aria-label="Close admin menu overlay"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        data-testid="admin-mobile-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[86vw] max-w-72 border-r border-border transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AdminSidebar pathname={pathname} onNavigate={() => setIsOpen(false)} />
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-bg/95 px-5 backdrop-blur sm:px-8">
          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center border border-border lg:hidden"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {getAdminPageLabel(pathname)}
          </p>
        </header>
        <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run the shell tests and verify GREEN**

Run:

```bash
npm test -- tests/components/admin/AdminShell.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/admin/navigation.ts components/admin/AdminSidebar.tsx components/admin/AdminShell.tsx tests/components/admin/AdminShell.test.tsx
git commit -m "feat: add responsive admin shell"
```

---

### Task 3: Shared CRUD Presentation Primitives

**Files:**
- Create: `components/admin/AdminPageHeader.tsx`
- Create: `components/admin/EntityCard.tsx`
- Create: `components/admin/CardGrid.tsx`
- Create: `components/admin/Modal.tsx`
- Create: `components/admin/ConfirmDialog.tsx`
- Create: `tests/components/admin/AdminPrimitives.test.tsx`

**Interfaces:**
- Produces: `AdminPageHeader({ eyebrow, title, count, action })`.
- Produces: `EntityCard({ eyebrow, title, description, meta, actions })`.
- Produces: `CardGrid({ children, isEmpty, emptyTitle, emptyDescription, emptyAction })`.
- Produces: controlled `Modal({ open, title, description, onClose, children, footer })`.
- Produces: `ConfirmDialog({ open, title, description, onClose, onConfirm })`.

- [ ] **Step 1: Write the failing primitive tests**

Create `tests/components/admin/AdminPrimitives.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the primitive tests and verify RED**

Run:

```bash
npm test -- tests/components/admin/AdminPrimitives.test.tsx
```

Expected: FAIL because the shared admin primitives do not exist.

- [ ] **Step 3: Implement the page header**

Create `components/admin/AdminPageHeader.tsx`:

```tsx
export function AdminPageHeader({
  eyebrow,
  title,
  count,
  action,
}: {
  eyebrow: string
  title: string
  count?: number
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <h1 className="font-serif text-5xl leading-none sm:text-6xl">{title}</h1>
          {typeof count === "number" && (
            <span className="pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {count} records
            </span>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
```

- [ ] **Step 4: Implement the entity card and card grid**

Create `components/admin/EntityCard.tsx`:

```tsx
export type EntityCardMeta = {
  label: string
  value: React.ReactNode
}

export function EntityCard({
  eyebrow,
  title,
  description,
  meta = [],
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  meta?: EntityCardMeta[]
  actions?: React.ReactNode
}) {
  return (
    <article className="flex min-h-64 flex-col border border-border bg-bg p-5">
      {eyebrow && (
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
      )}
      <h2 className="mt-4 font-serif text-3xl leading-tight">{title}</h2>
      {description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{description}</p>}
      {meta.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4">
          {meta.map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{item.label}</dt>
              <dd className="mt-1 text-sm">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="mt-auto flex gap-2 border-t border-border pt-4">{actions}</div>}
    </article>
  )
}
```

Create `components/admin/CardGrid.tsx`:

```tsx
export function CardGrid({
  children,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  children: React.ReactNode
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  emptyAction?: React.ReactNode
}) {
  if (isEmpty) {
    return (
      <div className="flex min-h-72 flex-col items-start justify-end border border-border p-6 sm:p-8">
        <p className="font-serif text-4xl">{emptyTitle}</p>
        <p className="mt-3 max-w-md text-muted">{emptyDescription}</p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    )
  }

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}
```

- [ ] **Step 5: Implement the controlled modal**

Create `components/admin/Modal.tsx`:

```tsx
"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        data-testid="modal-overlay"
        aria-label="Close dialog overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto border border-border bg-bg sm:max-w-xl"
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 id="admin-dialog-title" className="font-serif text-3xl">{title}</h2>
            {description && <p className="mt-2 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border p-5">{footer}</div>}
      </section>
    </div>
  )
}
```

- [ ] **Step 6: Implement the confirmation dialog**

Create `components/admin/ConfirmDialog.tsx`:

```tsx
"use client"

import { Modal } from "@/components/admin/Modal"

export function ConfirmDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="border border-border px-4 py-3 text-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="border border-fg bg-fg px-4 py-3 text-sm text-bg">
            Delete
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        This action only changes the current UI state during the admin prototype phase.
      </p>
    </Modal>
  )
}
```

- [ ] **Step 7: Run the primitive tests and verify GREEN**

Run:

```bash
npm test -- tests/components/admin/AdminPrimitives.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 8: Commit**

```bash
git add components/admin/AdminPageHeader.tsx components/admin/EntityCard.tsx components/admin/CardGrid.tsx components/admin/Modal.tsx components/admin/ConfirmDialog.tsx tests/components/admin/AdminPrimitives.test.tsx
git commit -m "feat: add admin CRUD presentation primitives"
```

---

### Task 4: Admin Layout and Empty Dashboard

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `tests/app/admin/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: `AdminShell({ children })` and `AdminPageHeader`.
- Produces: admin metadata `{ title: { default: "Admin", template: "%s - Admin" } }`.
- Produces: empty dashboard route with `data-testid="dashboard-empty"`.

- [ ] **Step 1: Write the failing dashboard test**

Create `tests/app/admin/AdminDashboard.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"

import AdminDashboardPage from "@/app/admin/page"

it("renders an intentionally empty dashboard", () => {
  render(<AdminDashboardPage />)

  expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument()
  expect(screen.getByTestId("dashboard-empty")).toBeEmptyDOMElement()
  expect(screen.queryByText(/statistic|revenue|activity/i)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the dashboard test and verify RED**

Run:

```bash
npm test -- tests/app/admin/AdminDashboard.test.tsx
```

Expected: FAIL because `app/admin/page.tsx` does not exist.

- [ ] **Step 3: Create the admin layout**

Create `app/admin/layout.tsx`:

```tsx
import type { Metadata } from "next"

import { AdminShell } from "@/components/admin/AdminShell"

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s - Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
```

- [ ] **Step 4: Create the empty dashboard**

Create `app/admin/page.tsx`:

```tsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Admin" title="Dashboard" />
      <div data-testid="dashboard-empty" className="min-h-[55vh] border border-border" />
    </>
  )
}
```

- [ ] **Step 5: Run the dashboard and admin tests**

Run:

```bash
npm test -- tests/app/admin/AdminDashboard.test.tsx tests/components/admin tests/components/layout/SiteChrome.test.tsx
```

Expected: 4 test files and 13 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/admin/layout.tsx app/admin/page.tsx tests/app/admin/AdminDashboard.test.tsx
git commit -m "feat: add empty admin dashboard"
```

---

### Task 5: Foundation Verification

**Files:**
- Modify only files required to address failures introduced by Tasks 1–4.

**Interfaces:**
- Consumes: all foundation routes and components.
- Produces: a test-passing, lint-valid, production-buildable admin foundation.

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all existing login tests and new admin tests pass.

- [ ] **Step 2: Run ESLint**

Run:

```bash
npm run lint
```

Expected: exit code 0 with no errors.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: the production build succeeds and lists `/admin` as a static route.

- [ ] **Step 4: Inspect the final repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` prints nothing and the worktree is clean after reverting any generated-only `next-env.d.ts` path change.
