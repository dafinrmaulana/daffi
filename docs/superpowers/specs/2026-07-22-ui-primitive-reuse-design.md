# UI Component Reuse Design

## Goal

Replace manually styled UI with existing components wherever semantics and appearance match, and extract small components for genuinely repeated visual patterns. Preserve the current appearance and behavior without generalizing unrelated application workflows.

## Audit Findings

The audit covers all files under `app/` and `components/`. It found both primitive-level reuse opportunities and repeated visual structures.

### Primitive Controls

The UI currently contains twelve native `<button>` elements outside the `Button` primitive and three native `<input>` elements in the login form.

Ten visual buttons are compatible with the shared `Button` primitive:

- Login password visibility and submit controls
- Header menu open and close controls
- Admin menu open and close controls
- Modal close control
- Theme toggle
- Alert close control
- `CreateButton`'s internal control

Two full-screen overlay controls remain native buttons because they provide an invisible click target rather than a visual button:

- Admin drawer overlay
- Modal overlay

The login email and password fields are compatible with the shared `Input` primitive. The `Remember me` checkbox remains native because the project has no checkbox primitive.

### Repeated Visual Structures

The About and Work pages contain nearly identical page-introduction markup: an eyebrow with a horizontal rule followed by a large `h1`. This becomes a shared `PageIntro` component.

`SocialRail` repeats the animated Online indicator in its desktop and mobile layouts. This becomes a small `AvailabilityStatus` component used by both layouts.

### Existing Components Already Used Correctly

The following components are already reused in the appropriate places and do not require further abstraction:

- `Section`
- `SectionTitle`
- `ProjectCard`
- `Badge`
- `AdminPageHeader`
- `EntityCard`
- `EmptyContent`
- `Modal`
- `Alert`
- `CrudLayout`

The refactor will not replace these with broader configurable components.

## Primitive Changes

### Button

Extend `components/ui/button.tsx` with an `icon` size. It produces a square button suitable for menu, close, theme, and password visibility controls while retaining the primitive's focus, disabled, and variant behavior.

The existing `sm`, `md`, and `lg` sizes remain unchanged. Existing callers do not require migration unless they currently render a compatible native visual button.

### Input

Extend `components/form/input.tsx` with an optional `suffix: React.ReactNode` slot. This slot renders inside the input container after the native input.

The login password field uses this slot to render an accessible icon-sized `Button`. The existing `suffixIcon` API remains available for current callers, avoiding unrelated migration work.

## Component Migrations

### Login

`components/login/login-form.tsx` will:

- Use `Input` for email and password.
- Preserve React Hook Form registration, autocomplete values, placeholders, and password visibility state.
- Use an icon-sized `Button` in the password suffix with the existing `aria-label` and `aria-pressed` attributes.
- Use a large primary `Button` for form submission while preserving the arrow icon and full-width layout.
- Keep the checkbox native.

### Shared and Navigation Controls

The following components will replace compatible native visual buttons with `Button`:

- `components/ui/theme-toggle.tsx`
- `components/ui/alert.tsx`
- `components/ui/create-button.tsx`
- `components/layout/header.tsx`
- `components/admin/admin-shell.tsx`
- `components/admin/admin-sidebar.tsx`
- `components/admin/modal.tsx`

Existing click handlers, accessibility attributes, responsive visibility, icons, and visual dimensions remain unchanged. Component-specific classes may be supplied through `className`, which is already merged by the Button primitive.

### Page Introductions

Create `components/shared/page-intro.tsx` with these responsibilities:

- Render the horizontal rule and eyebrow label.
- Render the page title as an `h1` using the existing About and Work typography.
- Accept optional wrapper and title classes only where needed to preserve existing spacing.

Use `PageIntro` in:

- `app/about/page.tsx`
- `app/work/page.tsx`

This component remains distinct from `SectionTitle`, whose section-level `h2`, top border, typography, and spacing have different semantics.

### Availability Status

Create `components/shared/availability-status.tsx` to render the animated green status dot and label. It accepts a compact visual mode so the existing desktop and mobile dot dimensions can be preserved without duplicating markup.

Use `AvailabilityStatus` for both status displays in `components/layout/social-rail.tsx`. Social link rendering remains local because its desktop and mobile structures differ materially.

## Explicit Exclusions

- Do not replace the admin drawer or modal overlay buttons.
- Do not introduce a Checkbox component in this refactor.
- Do not convert ordinary navigation links to Button links.
- Do not change authentication behavior; the login submit handler remains as currently implemented.
- Do not refactor CRUD state, API routes, or React Query services.
- Do not merge `PageIntro` with `SectionTitle`; their heading semantics and layouts differ.
- Do not generalize the Hero, login editorial panel, Contact CTA, footer, or social navigation solely because they share individual utility classes.

## Verification

- Audit native buttons after migration: only the `Button` primitive, two overlay buttons, and intentional native controls may remain.
- Confirm the login form contains no native text or password input outside the `Input` primitive; its checkbox remains native.
- Confirm About and Work use `PageIntro` without changing heading levels or visible layout.
- Confirm both SocialRail status displays use `AvailabilityStatus` and preserve their desktop/mobile dimensions.
- Run ESLint, TypeScript checking, and a production build.
- Do not create or run tests during the current refactor.
