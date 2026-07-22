# UI Component Reuse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace compatible manually styled UI with shared components and extract the two genuinely repeated visual structures found by the audit.

**Architecture:** Extend the existing `Button` and `Input` primitives with the smallest APIs required by current callers, then migrate compatible native controls without changing behavior. Add focused `PageIntro` and `AvailabilityStatus` components for exact repeated structures while leaving contextual layouts and application workflows local.

**Tech Stack:** Next.js 16, React 19, TypeScript, React Hook Form, Tailwind CSS, ESLint

## Global Constraints

- Preserve existing appearance, event handlers, responsive visibility, accessibility attributes, form registration, and CRUD behavior.
- Keep the admin drawer overlay and modal overlay as native buttons.
- Keep the login `Remember me` checkbox native.
- Do not convert ordinary navigation links to Button links.
- Do not change authentication behavior.
- Do not refactor CRUD state, API routes, or React Query services.
- Do not merge `PageIntro` with `SectionTitle`.
- Do not generalize the Hero, login editorial panel, Contact CTA, footer, or social navigation.
- Do not create or run tests during the current refactor.

---

### Task 1: Extend the Existing UI Primitives

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/form/input.tsx`

**Interfaces:**
- Consumes: Existing `ButtonProps`, `ButtonSize`, `Input` HTML props, and `cn()` class merging.
- Produces: `Button` with `size="icon"`; `Input` with `suffix?: React.ReactNode`, `controlClassName?: string`, and safely merged input classes.

- [ ] **Step 1: Add the icon button size**

Update the size types and records in `components/ui/button.tsx`:

```tsx
type ButtonSize = "sm" | "md" | "lg" | "icon";

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-14 px-6 text-base",
  icon: "h-9 min-h-9 w-9 p-0",
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
  icon: 16,
};
```

Keep all existing variants, link behavior, loading behavior, focus styles, and disabled behavior unchanged.

- [ ] **Step 2: Add the Input suffix slot and class merging**

Extend `components/form/input.tsx` so its props include:

```tsx
suffix?: React.ReactNode;
controlClassName?: string;
```

Destructure the native input `className` and merge it with the primitive styles:

```tsx
export default function Input({
  label,
  id,
  placeholder = "",
  type = "text",
  errorMessage,
  suffix,
  controlClassName,
  suffixIcon: SuffixIcon,
  prefixIcon: PrefixIcon,
  className,
  ...props
}: Props) {
```

Merge `controlClassName` into the existing bordered input container with `cn()`.

Render the input and suffix as:

```tsx
<input
  id={id}
  type={type}
  className={cn("min-w-0 flex-1 bg-transparent p-3 outline-none placeholder:text-muted", className)}
  placeholder={placeholder}
  {...props}
/>

{suffix}
```

Keep the current label, required marker, prefix icon, suffix icon, and error message behavior.

- [ ] **Step 3: Run static verification**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

- [ ] **Step 4: Commit the primitive API changes**

```bash
git add components/ui/button.tsx components/form/input.tsx
git diff --cached --check
git commit -m "refactor: extend shared form primitives"
```

---

### Task 2: Replace Compatible Native Form and Button Controls

**Files:**
- Modify: `components/login/login-form.tsx`
- Modify: `components/ui/theme-toggle.tsx`
- Modify: `components/ui/alert.tsx`
- Modify: `components/ui/create-button.tsx`
- Modify: `components/layout/header.tsx`
- Modify: `components/admin/admin-shell.tsx`
- Modify: `components/admin/admin-sidebar.tsx`
- Modify: `components/admin/modal.tsx`

**Interfaces:**
- Consumes: `Button` with `size="icon"`; `Input` with `suffix`; existing component event handlers and accessibility attributes.
- Produces: The same UI behavior with all compatible visual controls rendered through shared primitives.

- [ ] **Step 1: Refactor the login form**

Import `Input` and `Button`, then replace the manual email field with:

```tsx
<Input
  id="email"
  type="email"
  inputMode="email"
  autoComplete="email"
  label="Email"
  placeholder="you@example.com"
  prefixIcon={{ icon: Mail }}
  controlClassName="mt-2 min-h-14"
  className="py-4"
  {...register("email")}
/>
```

Replace the manual password field with:

```tsx
<Input
  id="password"
  type={showPassword ? "text" : "password"}
  autoComplete="current-password"
  label="Password"
  placeholder="Enter your password"
  prefixIcon={{ icon: LockKeyhole }}
  controlClassName="mt-2 min-h-14"
  className="py-4"
  suffix={
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className="mr-2 border-0"
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      onClick={() => setShowPassword((visible) => !visible)}
    >
      {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </Button>
  }
  {...register("password")}
/>
```

Keep the checkbox native. Replace the submit control with:

```tsx
<Button type="submit" variant="primary" size="lg" className="w-full justify-between px-5">
  Sign in
  <ArrowRight size={18} aria-hidden="true" />
</Button>
```

- [ ] **Step 2: Migrate icon and action buttons**

Use `Button size="icon" variant="secondary"` for the visible menu, close, theme, password visibility, modal close, and alert close controls. Preserve every current `type`, `aria-label`, `title`, `disabled`, `onClick`, responsive class, and icon.

Use `Button variant="primary"` inside `CreateButton`, preserving `onCreate`, label, and the Plus icon.

Do not replace these two overlay controls:

```tsx
<button data-testid="admin-drawer-overlay" ... />
<button data-testid="modal-overlay" ... />
```

- [ ] **Step 3: Audit remaining native controls**

Run:

```bash
rg -n '<button' app components --glob '*.tsx'
rg -n '<input' app components --glob '*.tsx'
```

Expected buttons: the internal native button in `components/ui/button.tsx` and the two explicit overlay buttons. Expected inputs: the internal native input in `components/form/input.tsx` and the login checkbox.

- [ ] **Step 4: Run static verification**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

- [ ] **Step 5: Commit the control migrations**

```bash
git add components/login/login-form.tsx components/ui/theme-toggle.tsx components/ui/alert.tsx components/ui/create-button.tsx components/layout/header.tsx components/admin/admin-shell.tsx components/admin/admin-sidebar.tsx components/admin/modal.tsx
git diff --cached --check
git commit -m "refactor: reuse shared UI controls"
```

---

### Task 3: Extract Repeated Visual Structures

**Files:**
- Create: `components/shared/page-intro.tsx`
- Create: `components/shared/availability-status.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/work/page.tsx`
- Modify: `components/layout/social-rail.tsx`

**Interfaces:**
- Consumes: `cn()` for optional class merging; existing About, Work, and SocialRail content.
- Produces: `PageIntro({ eyebrow, title, className })`; `AvailabilityStatus({ compact? })`.

- [ ] **Step 1: Create PageIntro**

Create `components/shared/page-intro.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-12 bg-fg" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      </div>
      <h1 className="max-w-5xl font-serif text-6xl leading-[0.92] sm:text-8xl">{title}</h1>
    </div>
  );
}
```

Replace the duplicated markup in About with `PageIntro eyebrow="Profile"` and its existing title. Replace the Work markup with `PageIntro className="mb-12" eyebrow="Project Archive"` and its existing title.

- [ ] **Step 2: Create AvailabilityStatus**

Create `components/shared/availability-status.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function AvailabilityStatus({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
      <span className={cn("relative flex", compact ? "h-2.5 w-2.5" : "h-3 w-3")}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
        <span className={cn("relative inline-flex rounded-full bg-green-500", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
      </span>
      <span className="font-mono text-xs uppercase text-muted">Online</span>
    </div>
  );
}
```

Use `<AvailabilityStatus />` in the desktop status panel and `<AvailabilityStatus compact />` in the mobile status bar. Leave social link rendering local.

- [ ] **Step 3: Audit the extractions**

Run:

```bash
rg -n 'Project Archive|Profile|AvailabilityStatus|animate-ping' app/about app/work components/layout/social-rail.tsx components/shared
```

Expected: About and Work provide content through `PageIntro`; `animate-ping` appears only in `AvailabilityStatus`; SocialRail uses it twice.

- [ ] **Step 4: Run static verification**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

- [ ] **Step 5: Commit the shared visual components**

```bash
git add components/shared/page-intro.tsx components/shared/availability-status.tsx app/about/page.tsx app/work/page.tsx components/layout/social-rail.tsx
git diff --cached --check
git commit -m "refactor: extract repeated visual components"
```

---

### Task 4: Verify the Complete Refactor

**Files:**
- Verify: `app/**/*.tsx`
- Verify: `components/**/*.tsx`

**Interfaces:**
- Consumes: All component APIs and migrations from Tasks 1–3.
- Produces: Evidence that the complete refactor is statically valid and production-buildable.

- [ ] **Step 1: Run final control and duplication audits**

Run:

```bash
rg -n '<button' app components --glob '*.tsx'
rg -n '<input' app components --glob '*.tsx'
rg -n 'animate-ping' app components --glob '*.tsx'
rg -n 'h-px w-12 bg-fg' app components --glob '*.tsx'
```

Expected: native controls are limited to the documented primitives, overlays, and checkbox; extracted visual markup has one implementation each.

- [ ] **Step 2: Run final static checks**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js completes the production build with exit code 0. If Next.js rewrites the generated route reference in `next-env.d.ts`, restore only that generated line before checking Git status.

- [ ] **Step 4: Confirm repository state**

Run:

```bash
git status --short
git log -4 --oneline
```

Expected: no uncommitted implementation changes remain, and the three refactor commits are present.
