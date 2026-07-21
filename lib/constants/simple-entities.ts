export type SimpleEntityKind = "users" | "companies" | "skills" | "tags" | "projectHighlights"

export type SimpleField = {
  name: string
  label: string
  type: "text" | "email" | "url" | "textarea"
  placeholder: string
}

export type SimpleEntityRecord = {
  id: string
} & Record<string, string>

export type SimpleEntityConfig = {
  eyebrow: string
  title: string
  singular: string
  cardTitleField: string
  cardDescriptionField?: string
  cardMetaFields: Array<{ field: string; label: string }>
  fields: SimpleField[]
  records: SimpleEntityRecord[]
}

export const simpleEntityConfigs: Record<SimpleEntityKind, SimpleEntityConfig> = {
  users: {
    eyebrow: "Access",
    title: "Users",
    singular: "user",
    cardTitleField: "name",
    cardMetaFields: [
      { field: "username", label: "Username" },
      { field: "email", label: "Email" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Full name" },
      { name: "username", label: "Username", type: "text", placeholder: "username" },
      { name: "email", label: "Email", type: "email", placeholder: "name@example.com" },
    ],
    records: [
      { id: "user-1", name: "Dafi Nurrohman", username: "dafi", email: "dafi@example.com" },
      { id: "user-2", name: "Content Editor", username: "editor", email: "editor@example.com" },
    ],
  },
  companies: {
    eyebrow: "Directory",
    title: "Companies",
    singular: "company",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [{ field: "companyLogo", label: "Logo URL" }],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Company name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Short company description" },
      { name: "companyLogo", label: "Company logo URL", type: "url", placeholder: "https://example.com/logo.svg" },
    ],
    records: [
      { id: "company-1", name: "Northstar Studio", description: "Digital product studio.", companyLogo: "/images/project-northstar-site.svg" },
      { id: "company-2", name: "Ledgerflow", description: "Operations and finance platform.", companyLogo: "/images/project-ledgerflow.svg" },
    ],
  },
  skills: {
    eyebrow: "Profile",
    title: "Skills",
    singular: "skill",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Skill name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "How this skill is used" },
    ],
    records: [
      { id: "skill-1", name: "React", description: "Component architecture and product interfaces." },
      { id: "skill-2", name: "TypeScript", description: "Typed application design and maintainable systems." },
    ],
  },
  tags: {
    eyebrow: "Taxonomy",
    title: "Tags",
    singular: "tag",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Tag name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "What this tag represents" },
    ],
    records: [
      { id: "tag-1", name: "Frontend", description: "Frontend engineering work." },
      { id: "tag-2", name: "Product Design", description: "Interface and product design work." },
    ],
  },
  projectHighlights: {
    eyebrow: "Experience",
    title: "Project Highlights",
    singular: "project highlight",
    cardTitleField: "name",
    cardDescriptionField: "description",
    cardMetaFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Highlight name" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Highlight description" },
    ],
    records: [
      { id: "highlight-1", name: "Design System", description: "Built and adopted a shared component system." },
      { id: "highlight-2", name: "Platform Migration", description: "Moved a legacy interface to a modern stack." },
    ],
  },
}
