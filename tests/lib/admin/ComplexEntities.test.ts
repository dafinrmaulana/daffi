import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { complexEntityConfigs } from "@/lib/admin/complex-entities"

describe("complexEntityConfigs", () => {
  it.each([
    ["projects", ["slug", "title", "company", "role", "year", "demoUrl", "thumbnail", "metric", "excerpt", "featured", "tags", "body", "metrics"]],
    ["posts", ["slug", "title", "date", "readTime", "thumbnail", "excerpt", "published", "tags", "body"]],
    ["experiences", ["slug", "company", "role", "startDate", "endDate", "location", "description", "projectHighlight", "skills"]],
  ] as const)("defines editable fields for %s", (kind, fields) => {
    expect(complexEntityConfigs[kind].fields.map((field) => field.name)).toEqual(fields)
    expect(complexEntityConfigs[kind].records).toHaveLength(2)
  })

  it("defines unique slugs for Project and Experience in Prisma", () => {
    const schema = fs.readFileSync(path.resolve(process.cwd(), "prisma/schema.prisma"), "utf8")
    const project = schema.match(/model Project \{([\s\S]*?)\n\}/)?.[1]
    const experience = schema.match(/model Experience \{([\s\S]*?)\n\}/)?.[1]

    expect(project).toMatch(/slug\s+String\s+@unique/)
    expect(experience).toMatch(/slug\s+String\s+@unique/)
  })
})
