import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"

import AdminDashboardPage from "@/app/admin/page"

it("renders an intentionally empty dashboard", () => {
  render(<AdminDashboardPage />)

  expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument()
  expect(screen.getByTestId("dashboard-empty")).toBeEmptyDOMElement()
  expect(screen.queryByText(/statistic|revenue|activity/i)).not.toBeInTheDocument()
})
