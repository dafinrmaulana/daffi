import { describe, expect, it } from "vitest"

import { simpleEntityConfigs } from "@/lib/admin/simple-entities"

describe("simpleEntityConfigs", () => {
  it.each([
    ["users", ["name", "username", "email"]],
    ["companies", ["name", "description", "companyLogo"]],
    ["skills", ["name", "description"]],
    ["tags", ["name", "description"]],
    ["projectHighlights", ["name", "description"]],
  ] as const)("defines editable fields for %s", (kind, expectedFields) => {
    const config = simpleEntityConfigs[kind]

    expect(config.fields.map((field) => field.name)).toEqual(expectedFields)
    expect(config.records.length).toBeGreaterThan(0)
    expect(config.cardTitleField).toBeTruthy()
  })
})
