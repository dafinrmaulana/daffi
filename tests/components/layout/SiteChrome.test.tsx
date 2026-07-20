import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SiteChrome } from "@/components/layout/SiteChrome"

const usePathname = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}))

vi.mock("@/components/layout/Header", () => ({
  Header: () => <div>Portfolio header</div>,
}))

vi.mock("@/components/layout/SocialRail", () => ({
  SocialRail: () => <div>Portfolio social rail</div>,
}))

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <div>Portfolio footer</div>,
}))

describe("SiteChrome", () => {
  beforeEach(() => {
    usePathname.mockReset()
  })

  it("omits portfolio chrome on the login route", () => {
    usePathname.mockReturnValue("/login")

    render(
      <SiteChrome>
        <div>Page content</div>
      </SiteChrome>,
    )

    expect(screen.queryByText("Portfolio header")).not.toBeInTheDocument()
    expect(screen.queryByText("Portfolio social rail")).not.toBeInTheDocument()
    expect(screen.queryByText("Portfolio footer")).not.toBeInTheDocument()
    expect(screen.getByRole("main")).toHaveTextContent("Page content")
  })

  it.each(["/admin", "/admin/projects", "/admin/projects/create"])(
    "omits portfolio chrome on %s",
    (pathname) => {
      usePathname.mockReturnValue(pathname)

      render(
        <SiteChrome>
          <div>Admin content</div>
        </SiteChrome>,
      )

      expect(screen.queryByText("Portfolio header")).not.toBeInTheDocument()
      expect(screen.queryByText("Portfolio social rail")).not.toBeInTheDocument()
      expect(screen.queryByText("Portfolio footer")).not.toBeInTheDocument()
      expect(screen.getByRole("main")).toHaveTextContent("Admin content")
    },
  )

  it("renders portfolio chrome around page content on regular routes", () => {
    usePathname.mockReturnValue("/")

    const { container } = render(
      <SiteChrome>
        <div>Page content</div>
      </SiteChrome>,
    )

    expect(screen.getByText("Portfolio header")).toBeInTheDocument()
    expect(screen.getByText("Portfolio social rail")).toBeInTheDocument()
    expect(screen.getByText("Portfolio footer")).toBeInTheDocument()
    expect(screen.getByRole("main")).toHaveTextContent("Page content")
    expect(container).toHaveTextContent(
      "Portfolio headerPortfolio social railPage contentPortfolio footer",
    )
  })
})
