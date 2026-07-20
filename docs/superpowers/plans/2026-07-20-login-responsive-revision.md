# Login Responsive Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the login page to use equal desktop panels, hide the editorial panel below 1024px, remove form validation, add a dynamic copyright line, and move component tests into a separate test tree.

**Architecture:** Keep the login page server-rendered and use Tailwind responsive utilities for all viewport behavior. Keep React Hook Form for registration and submission while removing validation concerns, and organize tests under `tests/components` without changing their `@/` imports.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 3, React Hook Form, Vitest, React Testing Library

## Global Constraints

- Desktop layout begins at Tailwind `lg` (1024px) and uses two equal-width columns.
- Below `lg`, the editorial panel is hidden and the form panel fills the viewport width.
- React Hook Form remains installed and manages email, password, remember-me, and submission.
- The form has no required rules, email-pattern rule, validation messages, or validation-specific ARIA attributes.
- Password visibility behavior remains unchanged.
- Footer copy is exactly `© {current year} Dafi. Built with Passion.`.
- Submission remains presentational with no API call or navigation.
- Component tests live under `tests/components/...`, not beside production components.

---

## File Structure

- `components/login/LoginForm.tsx`: retains form state and password behavior without validation.
- `app/login/page.tsx`: owns the 50/50 desktop layout, desktop-only editorial panel, and dynamic year.
- `tests/components/layout/SiteChrome.test.tsx`: moved site chrome behavior tests.
- `tests/components/login/LoginForm.test.tsx`: moved and revised form behavior tests.
- `tests/components/login/LoginPage.test.tsx`: moved and revised responsive composition tests.

---

### Task 1: Move Existing Tests and Remove Form Validation

**Files:**
- Move: `components/layout/SiteChrome.test.tsx` → `tests/components/layout/SiteChrome.test.tsx`
- Move: `components/login/LoginForm.test.tsx` → `tests/components/login/LoginForm.test.tsx`
- Move: `components/login/LoginPage.test.tsx` → `tests/components/login/LoginPage.test.tsx`
- Modify: `components/login/LoginForm.tsx`

**Interfaces:**
- Consumes: React Hook Form `register` and `handleSubmit`.
- Produces: `LoginForm(): React.JSX.Element` with no client-side validation feedback.

- [ ] **Step 1: Move the three existing test files**

Use repository-aware file moves so Git retains their history:

```bash
mkdir -p tests/components/layout tests/components/login
git mv components/layout/SiteChrome.test.tsx tests/components/layout/SiteChrome.test.tsx
git mv components/login/LoginForm.test.tsx tests/components/login/LoginForm.test.tsx
git mv components/login/LoginPage.test.tsx tests/components/login/LoginPage.test.tsx
```

- [ ] **Step 2: Replace validation tests with the desired no-validation behavior**

In `tests/components/login/LoginForm.test.tsx`, remove the tests named `shows validation feedback for empty required fields` and `rejects an invalid email address`. Add:

```tsx
it("submits empty fields without validation feedback", async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.click(screen.getByRole("button", { name: "Sign in" }))

  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid")
  expect(screen.getByLabelText("Password")).not.toHaveAttribute("aria-invalid")
})

it("accepts arbitrary email text without validation feedback", async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText("Email"), "not-an-email")
  await user.click(screen.getByRole("button", { name: "Sign in" }))

  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  expect(screen.getByLabelText("Email")).toHaveValue("not-an-email")
})
```

- [ ] **Step 3: Run the revised form test and verify RED**

Run:

```bash
npm test -- tests/components/login/LoginForm.test.tsx
```

Expected: FAIL because the existing inputs still expose validation ARIA state and invalid email submission still renders an alert.

- [ ] **Step 4: Remove validation from the production form**

Change the `useForm` destructuring in `components/login/LoginForm.tsx` to:

```tsx
const {
  register,
  handleSubmit,
} = useForm<LoginFormValues>({
  defaultValues: {
    email: "",
    password: "",
    remember: false,
  },
})
```

Change the email input registration to:

```tsx
<input
  id="email"
  type="text"
  inputMode="email"
  autoComplete="email"
  className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-muted"
  placeholder="you@example.com"
  {...register("email")}
/>
```

Change the password input registration to:

```tsx
<input
  id="password"
  type={showPassword ? "text" : "password"}
  autoComplete="current-password"
  className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-muted"
  placeholder="Enter your password"
  {...register("password")}
/>
```

Delete both conditional error paragraphs. Leave the remember-me registration, submit handler, and password toggle unchanged.

- [ ] **Step 5: Run all moved tests and verify GREEN**

Run:

```bash
npm test -- tests/components
```

Expected: 3 test files pass and the form suite contains 5 passing tests.

- [ ] **Step 6: Commit the test organization and form behavior**

```bash
git add components/login/LoginForm.tsx tests/components components/layout/SiteChrome.test.tsx components/login/LoginForm.test.tsx components/login/LoginPage.test.tsx
git commit -m "refactor: separate component tests and remove login validation"
```

---

### Task 2: Equal Desktop Panels, Mobile Form-Only Layout, and Dynamic Footer

**Files:**
- Modify: `tests/components/login/LoginPage.test.tsx`
- Modify: `app/login/page.tsx`

**Interfaces:**
- Consumes: server runtime `new Date().getFullYear()`.
- Produces: `LoginPage(): React.JSX.Element` with `lg:grid-cols-2`, a `hidden lg:flex` aside, and current-year footer copy.

- [ ] **Step 1: Update the route composition test**

Replace `tests/components/login/LoginPage.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import LoginPage, { metadata } from "@/app/login/page"

vi.mock("@/components/login/LoginForm", () => ({
  LoginForm: () => <div>Login form</div>,
}))

vi.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Toggle theme</button>,
}))

it("composes the responsive editorial login page", () => {
  const { container } = render(<LoginPage />)
  const editorialPanel = screen.getByTestId("login-editorial-panel")
  const year = new Date().getFullYear()

  expect(metadata).toMatchObject({ title: "Login" })
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/")
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
  expect(screen.getByText("Login form")).toBeInTheDocument()
  expect(container.firstChild).toHaveClass("lg:grid-cols-2")
  expect(container.firstChild).not.toHaveClass("lg:grid-cols-[45fr_55fr]")
  expect(editorialPanel).toHaveClass("hidden", "lg:flex")
  expect(screen.getByText(`© ${year} Dafi. Built with Passion.`)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the route test and verify RED**

Run:

```bash
npm test -- tests/components/login/LoginPage.test.tsx
```

Expected: FAIL because the page still uses `lg:grid-cols-[45fr_55fr]`, the aside is visible below `lg`, and the footer is hard-coded.

- [ ] **Step 3: Implement the responsive layout and dynamic footer**

At the beginning of `LoginPage` in `app/login/page.tsx`, add:

```tsx
const year = new Date().getFullYear()
```

Change the root section class to:

```tsx
className="grid min-h-screen bg-bg lg:grid-cols-2"
```

Change the form panel class to:

```tsx
className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20"
```

Replace the footer paragraph content with:

```tsx
© {year} Dafi. Built with Passion.
```

Change the editorial aside opening tag to:

```tsx
<aside
  data-testid="login-editorial-panel"
  className="hidden min-h-screen flex-col justify-between border-l border-border bg-fg px-12 py-10 text-bg lg:flex xl:px-16"
>
```

- [ ] **Step 4: Run the route and full component tests**

Run:

```bash
npm test -- tests/components/login/LoginPage.test.tsx
npm test -- tests/components
```

Expected: the route test passes, followed by all 3 component test files passing.

- [ ] **Step 5: Commit the responsive revision**

```bash
git add app/login/page.tsx tests/components/login/LoginPage.test.tsx
git commit -m "feat: refine responsive login layout"
```

---

### Task 3: Full Verification

**Files:**
- Modify only files required to address failures introduced by Tasks 1–2.

**Interfaces:**
- Consumes: all revised login behavior and moved component tests.
- Produces: a clean, tested, lint-valid, production-buildable revision.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: 3 test files and 8 tests pass.

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

Expected: the build completes and lists `/login` as a static route.

- [ ] **Step 4: Inspect repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` prints nothing and the worktree is clean after reverting any generated-only `next-env.d.ts` path change.
