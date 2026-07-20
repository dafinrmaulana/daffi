# Admin UI Design

## Goal

Build a responsive, UI-only administration area for every model in `prisma/schema.prisma`. The admin should use a traditional sidebar layout while preserving the portfolio's editorial monochrome design language.

The admin is intentionally accessible without authentication for this phase. It does not read from or write to PostgreSQL.

## Delivery Boundaries

The work is divided into three independently testable subprojects:

1. Admin foundation
2. Simple CRUD UI
3. Complex CRUD UI and Prisma slug fields

Each subproject should leave the application in a working state and reuse the foundation created before it.

## Routes

### Foundation

- `/admin` — empty dashboard

### Simple CRUD

- `/admin/users`
- `/admin/companies`
- `/admin/skills`
- `/admin/tags`
- `/admin/project-highlights`

Create and edit actions for these models open modal forms on their index routes.

### Complex CRUD

- `/admin/projects`
- `/admin/projects/create`
- `/admin/projects/[slug]/edit`
- `/admin/posts`
- `/admin/posts/create`
- `/admin/posts/[slug]/edit`
- `/admin/experiences`
- `/admin/experiences/create`
- `/admin/experiences/[slug]/edit`

Projects and experiences use synthetic slug values in mock data. Posts use their existing Prisma slug field.

## Admin Shell

The admin has a traditional two-region layout:

- A persistent sidebar on desktop.
- A content region with a compact top bar and scrollable page content.

The sidebar is approximately 260px wide and contains:

- The identity text `Admin Workspace`
- Dashboard
- Projects
- Posts
- Experiences
- Companies
- Skills
- Tags
- Project Highlights
- Users
- Theme toggle
- A link back to the portfolio

The active navigation item uses an inverted foreground/background treatment. Labels use the existing monospace font and page headings use the existing serif font. Borders remain square and use the current design tokens.

Below the Tailwind `lg` breakpoint, the same sidebar becomes a hidden drawer. The mobile top bar exposes a menu button. Opening the drawer displays an overlay; the menu button, overlay, close button, and navigation actions can all close it.

The portfolio header, social rail, and footer are not rendered on `/admin` or its descendants. The existing root theme provider remains active.

## Dashboard

`/admin` displays only:

- The admin page eyebrow
- The `Dashboard` heading
- A bordered empty content region

It does not contain statistics, charts, recent activity, or mock dashboard widgets.

## Shared CRUD Presentation

Every model index uses:

- A page header with eyebrow, serif title, mock record count, and add button
- A responsive card grid with one column on mobile, two on medium screens, and three on wide screens
- Entity cards with model-specific primary content, supporting metadata, and edit/delete actions
- A bordered empty state with an add action when local records are empty

All data comes from typed mock fixtures. Simple CRUD interactions update component-local state and reset on refresh.

Delete always opens a confirmation modal. Confirming removes the card from local state. Canceling or closing leaves the card unchanged.

## Modal Behavior

The shared modal:

- Uses an overlay and centered desktop dialog
- Becomes a near-full-width bottom-aligned or centered dialog on mobile
- Traps the visual focus within a clearly bounded panel
- Closes through its close button, cancel action, or overlay
- Restores the page when closed

Keyboard-visible focus styles use the project's existing foreground and background tokens. Full keyboard focus trapping is not required for this UI-only phase, but dialog semantics and accessible labels are required.

## Simple CRUD Forms

Simple forms use React Hook Form without validation rules.

### User

- Name
- Username
- Email

### Company

- Name
- Description
- Company logo URL

### Skill

- Name
- Description

### Tag

- Name
- Description

### Project Highlight

- Name
- Description

Add opens an empty form modal. Edit opens the same modal populated from the selected mock record. Submit updates local card state and closes the modal.

## Complex CRUD Forms

Complex forms use dedicated pages and React Hook Form without validation rules. IDs, `createdAt`, and `updatedAt` are not editable inputs.

### Project

- Slug
- Title
- Company
- Role
- Year
- Demo URL
- Thumbnail
- Metric
- Excerpt
- Featured
- Tags
- Body
- Metrics JSON text

### Post

- Slug
- Title
- Date
- Read time
- Thumbnail
- Excerpt
- Published
- Tags
- Body

### Experience

- Slug
- Company
- Role
- Start date
- End date
- Location
- Description
- Project highlight
- Skills

Mock relations use selects or checkbox groups populated from company, tag, skill, and project-highlight fixtures.

Create pages use empty default values. Edit pages resolve the fixture by slug and populate the form. If the slug is not found, the page displays a bordered not-found state with a link back to the index.

Submitting a complex form does not persist data. It returns to the related index route to demonstrate the intended flow.

## Prisma Schema Change

Add the following required unique fields:

```prisma
model Project {
  slug String @unique
}

model Experience {
  slug String @unique
}
```

The fields are added to `schema.prisma` only. No migration is created or applied in this phase.

## Component Boundaries

- `AdminShell` owns desktop/mobile layout and drawer state.
- `AdminSidebar` owns navigation rendering and close callbacks.
- `AdminPageHeader` owns consistent page titles, counts, and primary actions.
- `EntityCard` owns shared card framing and action placement.
- `CardGrid` owns responsive card layout and empty state.
- `Modal` owns dialog presentation and close interactions.
- `ConfirmDialog` specializes `Modal` for delete confirmation.
- Each simple model page owns its fixture state and React Hook Form field definitions.
- Each complex form owns its model-specific fields and mock relation mapping.
- Typed fixtures and admin navigation metadata live outside React components.

The shared primitives remain presentation-focused. They do not know about Prisma or database operations.

## Error and Empty States

Because the admin is UI-only:

- There are no API loading or server-error states.
- There are no optimistic updates or retry controls.
- There is no form validation feedback.
- Missing edit slugs show a local not-found state.
- Empty local collections show the shared card empty state.

## Testing

All tests live under the existing separate test tree:

- `tests/components/admin`
- `tests/app/admin`

Foundation tests cover:

- Admin routes omit portfolio chrome
- Desktop sidebar navigation content
- Mobile drawer open and close behavior
- Active navigation styling
- Empty dashboard composition

Simple CRUD tests cover:

- Responsive card index composition
- Add modal open, submit, and card creation
- Edit modal population, submit, and card update
- Delete confirmation cancel and confirm behavior
- Empty state after deleting all local records

Complex CRUD tests cover:

- Index cards and route links use slugs
- Create routes render all editable fields
- Edit routes populate fixture values by slug
- Missing slugs render the not-found state
- Project and Experience Prisma models contain unique slug fields

Repository verification includes the full Vitest suite, ESLint, Prisma schema formatting or validation, and the Next.js production build.

## Out of Scope

- Authentication or route protection
- PostgreSQL reads and writes
- Server actions, route handlers, or API endpoints
- Prisma migration creation or execution
- Form validation
- File uploads or rich-text editors
- Search, sorting, filtering, and pagination
- Dashboard statistics and widgets
