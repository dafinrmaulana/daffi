import Link from "next/link"

const socialLinks = [
  { href: "https://github.com/dafinrmaulana", label: "GitHub" },
  { href: "https://linkedin.com/in/dafinmaulana", label: "LinkedIn" },
  { href: "https://instagram.com/dafi.nrm", label: "Instagram" },
]

export function SocialRail() {
  return (
    <>
      <div className="fixed bottom-5 left-5 z-30 hidden sm:block">
        <div className="flex items-center gap-3 border border-border bg-bg/92 px-4 py-3 backdrop-blur">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-xs uppercase text-muted">Online</span>
        </div>
      </div>
      <div className="fixed bottom-5 right-5 z-30 hidden sm:block">
        <div className="flex flex-col border border-border bg-bg/92 backdrop-blur">
          {socialLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="border-b border-border px-4 py-3 text-sm text-muted transition-colors last:border-b-0 hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg/96 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="font-mono text-xs uppercase text-muted">Online</span>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
