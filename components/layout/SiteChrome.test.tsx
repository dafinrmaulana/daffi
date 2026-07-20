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
