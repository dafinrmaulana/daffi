import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border pb-10 sm:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© 2026 Dafi. Built with Passion.</p>
        <div className="flex gap-4">
          <Link href="/work" className="hover:text-fg">Work</Link>
          <a href="mailto:dafinmaulana18@gmail.com" className="hover:text-fg">Email</a>
        </div>
      </div>
    </footer>
  )
}
