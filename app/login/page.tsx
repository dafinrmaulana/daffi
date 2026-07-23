import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login/login-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { getSafeRedirectPath } from "@/lib/auth/request"
import { getSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Dafi's portfolio workspace.",
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser()

  if (user) {
    redirect("/admin")
  }

  const params = await searchParams
  const safeNext = getSafeRedirectPath(
    Array.isArray(params.next) ? params.next[0] : params.next,
  )
  const year = new Date().getFullYear()

  return (
    <section className="grid min-h-screen bg-bg lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
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
          <LoginForm next={safeNext} />
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          © {year} Dafi. Built with Passion.
        </p>
      </div>

      <aside
        data-testid="login-editorial-panel"
        className="hidden min-h-screen flex-col justify-between border-l border-border bg-fg px-12 py-10 text-bg lg:flex xl:px-16"
      >
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
