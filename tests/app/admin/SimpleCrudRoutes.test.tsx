import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import CompaniesPage from "@/app/admin/companies/page"
import ProjectHighlightsPage from "@/app/admin/project-highlights/page"
import SkillsPage from "@/app/admin/skills/page"
import TagsPage from "@/app/admin/tags/page"
import UsersPage from "@/app/admin/users/page"

describe("simple CRUD routes", () => {
  it.each([
    ["Users", UsersPage],
    ["Companies", CompaniesPage],
    ["Skills", SkillsPage],
    ["Tags", TagsPage],
    ["Project Highlights", ProjectHighlightsPage],
  ] as const)("renders the %s index", (title, Page) => {
    render(<Page />)
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
  })
})
