# UI Primitive Reuse Design

## Goal

Replace manually styled form inputs and visual buttons with the existing `Input` and `Button` primitives wherever their semantics match, while preserving the current appearance and behavior.

## Audit Findings

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

## Explicit Exclusions

- Do not replace the admin drawer or modal overlay buttons.
- Do not introduce a Checkbox component in this refactor.
- Do not convert ordinary navigation links to Button links.
- Do not change authentication behavior; the login submit handler remains as currently implemented.
- Do not refactor CRUD state, API routes, or React Query services.

## Verification

- Audit native buttons after migration: only the `Button` primitive, two overlay buttons, and intentional native controls may remain.
- Confirm the login form contains no native text or password input outside the `Input` primitive; its checkbox remains native.
- Run ESLint, TypeScript checking, and a production build.
- Do not create or run tests during the current refactor.
