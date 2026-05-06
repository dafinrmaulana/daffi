import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© 2026 Daffi. Built with Next.js.</p>
        <div className="flex gap-4">
          <Link href="/work" className="hover:text-fg">Work</Link>
          <Link href="/blog" className="hover:text-fg">Writing</Link>
          <a href="mailto:hello@daffi.dev" className="hover:text-fg">Email</a>
        </div>
      </div>
    </footer>
  )
}
