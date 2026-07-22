# Responsive Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, fullscreen `/login` UI with an editorial split-screen design, React Hook Form validation, and an accessible password visibility interaction.

**Architecture:** Keep the route page as a server component for metadata and layout composition, and isolate form state in a focused client component. Add one route-aware client wrapper around the existing global chrome so `/login` can remain fullscreen while all portfolio routes continue rendering their current header, social rail, and footer.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, React Hook Form, Vitest, React Testing Library, next-themes, Lucide React

## Global Constraints

- `/login` is presentation-only and must not call an authentication API, create a session, or navigate after submit.
- Use React Hook Form directly for email, password, and remember-me state and validation; do not add a schema validation library.
- Reuse the project's existing color tokens, serif/sans/mono fonts, theme provider, theme toggle, and square-border visual language.
- Do not render the global header, social rail, or footer on `/login`.
- Preserve light and dark mode.
- Desktop uses an approximately 45/55 split; mobile uses a single column with a compact editorial header.
- Do not add forgot-password, registration, social-login, or post-login flows.

---

## File Structure

- `app/layout.tsx`: keeps the theme provider and delegates global portfolio chrome to `SiteChrome`.
- `app/login/page.tsx`: server-rendered route metadata and responsive split-screen composition.
- `components/layout/site-chrome.tsx`: route-aware owner of the existing header, social rail, and footer.
- `components/layout/site-chrome.test.tsx`: verifies route-specific chrome rendering.
- `components/login/login-form.tsx`: React Hook Form fields, validation, and password visibility state.
- `components/login/login-form.test.tsx`: verifies form rendering, validation, visibility interaction, and inert valid submission.
- `components/login/login-page.test.tsx`: verifies the route's editorial content and responsive layout classes.
- `vitest.config.ts`: jsdom test environment and `@/` path alias.
- `vitest.setup.ts`: Testing Library DOM matchers and test cleanup.
- `package.json` and `package-lock.json`: React Hook Form and test dependencies plus a `test` script.

---

### Task 1: Test Harness and Route-Aware Site Chrome

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `components/layout/site-chrome.test.tsx`
- Create: `components/layout/site-chrome.tsx`
- Modify: `app/layout.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `Header`, `SocialRail`, and `Footer`, each without props; `usePathname(): string`.
- Produces: `SiteChrome(): React.JSX.Element | null`, used once by `app/layout.tsx`.

- [ ] **Step 1: Install the test harness required for behavior-first tests**

Run:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: npm completes successfully and updates `package.json` and `package-lock.json`.

- [ ] **Step 2: Add the test script and Vitest configuration**

Add this script to `package.json`:

```json
"test": "vitest run"
```

Create `vitest.config.ts`:

```ts
import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
})
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Write the failing site chrome tests**

Create `components/layout/site-chrome.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SiteChrome } from "@/components/layout/site-chrome"

const usePathname = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}))

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Portfolio header</div>,
}))

vi.mock("@/components/layout/social-rail", () => ({
  SocialRail: () => <div>Portfolio social rail</div>,
}))

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Portfolio footer</div>,
}))

describe("SiteChrome", () => {
  beforeEach(() => {
    usePathname.mockReset()
  })

  it("omits portfolio chrome on the login route", () => {
    usePathname.mockReturnValue("/login")

    const { container } = render(<SiteChrome />)

    expect(container).toBeEmptyDOMElement()
  })

  it("renders portfolio chrome on regular routes", () => {
    usePathname.mockReturnValue("/")

    render(<SiteChrome />)

    expect(screen.getByText("Portfolio header")).toBeInTheDocument()
    expect(screen.getByText("Portfolio social rail")).toBeInTheDocument()
    expect(screen.getByText("Portfolio footer")).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run the site chrome tests and verify RED**

Run:

```bash
npm test -- components/layout/site-chrome.test.tsx
```

Expected: FAIL because `@/components/layout/site-chrome` does not exist.

- [ ] **Step 5: Implement the route-aware site chrome**

Create `components/layout/site-chrome.tsx`:

```tsx
"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SocialRail } from "@/components/layout/social-rail"

export function SiteChrome() {
  const pathname = usePathname()

  if (pathname === "/login") {
    return null
  }

  return (
    <>
      <Header />
      <SocialRail />
      <Footer />
    </>
  )
}
```

Update the theme-provider body in `app/layout.tsx`:

```tsx
<ThemeProvider>
  <SiteChrome />
  <main>{children}</main>
</ThemeProvider>
```

Replace the direct `Header`, `SocialRail`, and `Footer` imports with:

```ts
import { SiteChrome } from "@/components/layout/site-chrome"
```

- [ ] **Step 6: Run the site chrome tests and verify GREEN**

Run:

```bash
npm test -- components/layout/site-chrome.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 7: Commit the route-aware chrome**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts app/layout.tsx components/layout/site-chrome.tsx components/layout/site-chrome.test.tsx
git commit -m "test: add login page test harness"
```

---

### Task 2: React Hook Form Login Behavior

**Files:**
- Create: `components/login/login-form.test.tsx`
- Create: `components/login/login-form.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: React Hook Form's `useForm<LoginFormValues>()`; Lucide `Eye`, `EyeOff`, `LockKeyhole`, `Mail`, and `ArrowRight`.
- Produces: `LoginForm(): React.JSX.Element`; internal `LoginFormValues` with `email: string`, `password: string`, and `remember: boolean`.

- [ ] **Step 1: Install React Hook Form**

Run:

```bash
npm install react-hook-form
```

Expected: npm completes successfully and records `react-hook-form` in dependencies.

- [ ] **Step 2: Write the failing form behavior tests**

Create `components/login/login-form.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LoginForm } from "@/components/login/login-form"

describe("LoginForm", () => {
  it("renders labeled login controls", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password")
    expect(screen.getByLabelText("Remember me")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument()
  })

  it("shows validation feedback for empty required fields", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Email is required.")).toBeInTheDocument()
    expect(screen.getByText("Password is required.")).toBeInTheDocument()
  })

  it("rejects an invalid email address", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "not-an-email")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument()
  })

  it("toggles password visibility and accessible state", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const password = screen.getByLabelText("Password")
    const toggle = screen.getByRole("button", { name: "Show password" })

    expect(password).toHaveAttribute("type", "password")
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    await user.click(toggle)

    expect(password).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true")
  })

  it("keeps a valid submission on the login page", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "dafi@example.com")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveValue("dafi@example.com")
    expect(screen.getByLabelText("Password")).toHaveValue("secret")
  })
})
```

- [ ] **Step 3: Run the form tests and verify RED**

Run:

```bash
npm test -- components/login/login-form.test.tsx
```

Expected: FAIL because `@/components/login/login-form` does not exist.

- [ ] **Step 4: Implement the React Hook Form login component**

Create `components/login/login-form.tsx`:

```tsx
"use client"

import { useState } from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = () => undefined

  return (
    <form className="mt-10 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-[0.14em]">
          Email
        </label>
        <div className="mt-2 flex min-h-14 items-center border border-border bg-bg transition-colors focus-within:border-fg">
          <Mail className="ml-4 shrink-0 text-muted" size={18} aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-muted"
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address.",
              },
            })}
          />
        </div>
        {errors.email && (
          <p id="email-error" role="alert" className="mt-2 text-sm text-muted">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-[0.14em]">
          Password
        </label>
        <div className="mt-2 flex min-h-14 items-center border border-border bg-bg transition-colors focus-within:border-fg">
          <LockKeyhole className="ml-4 shrink-0 text-muted" size={18} aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-muted"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required.",
            })}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
            className="mr-2 inline-flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-fg"
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="mt-2 text-sm text-muted">
            {errors.password.message}
          </p>
        )}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          className="h-4 w-4 accent-current"
          {...register("remember")}
        />
        Remember me
      </label>

      <button
        type="submit"
        className="flex min-h-14 w-full items-center justify-between border border-fg bg-fg px-5 text-sm font-medium text-bg transition-colors hover:bg-bg hover:text-fg focus:outline-none focus:ring-2 focus:ring-fg focus:ring-offset-2 focus:ring-offset-bg"
      >
        Sign in
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Run the form tests and verify GREEN**

Run:

```bash
npm test -- components/login/login-form.test.tsx
```

Expected: 5 tests pass with no warnings.

- [ ] **Step 6: Commit the form behavior**

```bash
git add package.json package-lock.json components/login/login-form.tsx components/login/login-form.test.tsx
git commit -m "feat: add login form interactions"
```

---

### Task 3: Responsive Editorial Login Route

**Files:**
- Create: `components/login/login-page.test.tsx`
- Modify: `app/login/page.tsx`

**Interfaces:**
- Consumes: `LoginForm(): React.JSX.Element`, `ThemeToggle(): React.JSX.Element`, and Next.js `Link`.
- Produces: default `LoginPage(): React.JSX.Element` and route metadata `{ title: "Login" }`.

- [ ] **Step 1: Write the failing route composition test**

Create `components/login/login-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import LoginPage, { metadata } from "@/app/login/page"

vi.mock("@/components/login/login-form", () => ({
  LoginForm: () => <div>Login form</div>,
}))

vi.mock("@/components/ui/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Toggle theme</button>,
}))

it("composes the responsive editorial login page", () => {
  const { container } = render(<LoginPage />)

  expect(metadata).toMatchObject({ title: "Login" })
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/")
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
  expect(screen.getByText("Build. Ship. Repeat.")).toBeInTheDocument()
  expect(screen.getByText("Dafi — Frontend Developer")).toBeInTheDocument()
  expect(screen.getByText("Login form")).toBeInTheDocument()
  expect(container.firstChild).toHaveClass("lg:grid-cols-[45fr_55fr]")
})
```

- [ ] **Step 2: Run the route test and verify RED**

Run:

```bash
npm test -- components/login/login-page.test.tsx
```

Expected: FAIL because `app/login/page.tsx` is empty and exports no page or metadata.

- [ ] **Step 3: Implement the responsive split-screen route**

Replace `app/login/page.tsx` with:

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { LoginForm } from "@/components/login/login-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Dafi's portfolio workspace.",
}

export default function LoginPage() {
  return (
    <section className="grid min-h-screen bg-bg lg:grid-cols-[45fr_55fr]">
      <div className="order-2 flex min-h-[70vh] flex-col px-5 py-6 sm:px-10 lg:order-1 lg:min-h-screen lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-fg"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="my-auto w-full max-w-md py-12 lg:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Private workspace</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.92] sm:text-6xl">Welcome back</h1>
          <p className="mt-5 max-w-sm leading-relaxed text-muted">
            Enter your details to continue to your workspace.
          </p>
          <LoginForm />
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          © 2026 Dafi
        </p>
      </div>

      <aside className="order-1 flex min-h-64 flex-col justify-between border-b border-border bg-fg p-5 text-bg sm:p-10 lg:order-2 lg:min-h-screen lg:border-b-0 lg:border-l lg:px-12 lg:py-10 xl:px-16">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.16em]">
          <span>Dafi — Frontend Developer</span>
          <span>Jakarta · ID</span>
        </div>
        <div className="py-12 lg:py-0">
          <h2 className="max-w-3xl font-serif text-[clamp(3.5rem,8vw,8rem)] leading-[0.84] tracking-[-0.03em]">
            Build. Ship. Repeat.
          </h2>
          <p className="mt-8 max-w-xl text-base leading-relaxed opacity-65 sm:text-lg">
            Thoughtful interfaces, reliable systems, and details that make digital products feel effortless.
          </p>
        </div>
        <p className="hidden max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] opacity-60 lg:block">
          Web interfaces · Mobile applications · Product systems
        </p>
      </aside>
    </section>
  )
}
```

- [ ] **Step 4: Run the route and focused login tests**

Run:

```bash
npm test -- components/login
```

Expected: the route test and all login form tests pass.

- [ ] **Step 5: Commit the responsive route**

```bash
git add app/login/page.tsx components/login/login-page.test.tsx
git commit -m "feat: build responsive editorial login page"
```

---

### Task 4: Repository Verification

**Files:**
- Modify only files required to address verification failures introduced by Tasks 1–3.

**Interfaces:**
- Consumes: all login page and site chrome behavior created in Tasks 1–3.
- Produces: a lint-clean, test-passing, production-buildable login page.

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all Vitest suites pass with no warnings.

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

Expected: Next.js completes the production build and lists `/login` as a generated route.

- [ ] **Step 4: Check formatting and the final diff**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` prints nothing; status contains no uncommitted implementation files.

