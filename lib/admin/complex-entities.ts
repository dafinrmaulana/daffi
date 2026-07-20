export type ComplexEntityKind = "projects" | "posts" | "experiences"

export type ComplexFieldType =
  | "text"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "checkbox"
  | "select"
  | "checkboxGroup"

export type ComplexField = {
  name: string
  label: string
  type: ComplexFieldType
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

export type ComplexRecord = {
  id: string
  slug: string
  title: string
  description: string
  meta: Array<{ label: string; value: string }>
  values: Record<string, string | boolean | string[]>
}

export type ComplexEntityConfig = {
  title: string
  singular: string
  eyebrow: string
  indexHref: string
  fields: ComplexField[]
  records: ComplexRecord[]
}

const companies = [
  { label: "Northstar Studio", value: "northstar" },
  { label: "Ledgerflow", value: "ledgerflow" },
]
const tags = [
  { label: "Frontend", value: "frontend" },
  { label: "Product Design", value: "product-design" },
]
const skills = [
  { label: "React", value: "react" },
  { label: "TypeScript", value: "typescript" },
]
const projectHighlights = [
  { label: "Design System", value: "design-system" },
  { label: "Platform Migration", value: "platform-migration" },
]

export const complexEntityConfigs: Record<ComplexEntityKind, ComplexEntityConfig> = {
  projects: {
    title: "Projects",
    singular: "project",
    eyebrow: "Portfolio",
    indexHref: "/admin/projects",
    fields: [
      { name: "slug", label: "Slug", type: "text", placeholder: "project-slug" },
      { name: "title", label: "Title", type: "text", placeholder: "Project title" },
      { name: "company", label: "Company", type: "select", options: companies },
      { name: "role", label: "Role", type: "text", placeholder: "Frontend Developer" },
      { name: "year", label: "Year", type: "number", placeholder: "2026" },
      { name: "demoUrl", label: "Demo URL", type: "url", placeholder: "https://example.com" },
      { name: "thumbnail", label: "Thumbnail", type: "text", placeholder: "/images/project.png" },
      { name: "metric", label: "Metric", type: "text", placeholder: "Primary outcome" },
      { name: "excerpt", label: "Excerpt", type: "textarea", placeholder: "Short project summary" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "tags", label: "Tags", type: "checkboxGroup", options: tags },
      { name: "body", label: "Body", type: "textarea", placeholder: "Project case study" },
      { name: "metrics", label: "Metrics JSON", type: "textarea", placeholder: "{\"impact\":\"40%\"}" },
    ],
    records: [
      {
        id: "project-1",
        slug: "northstar-commerce",
        title: "Northstar Commerce",
        description: "Calm commerce operations dashboard.",
        meta: [{ label: "Year", value: "2026" }, { label: "Company", value: "Northstar Studio" }],
        values: { slug: "northstar-commerce", title: "Northstar Commerce", company: "northstar", role: "Frontend Developer", year: "2026", demoUrl: "https://example.com/northstar", thumbnail: "/images/project-northstar-site.svg", metric: "40% faster workflow", excerpt: "A calm commerce operations dashboard.", featured: true, tags: ["frontend", "product-design"], body: "Northstar case study.", metrics: "{\"impact\":\"40%\"}" },
      },
      {
        id: "project-2",
        slug: "ledgerflow-operations",
        title: "Ledgerflow Operations",
        description: "Finance and operations workspace.",
        meta: [{ label: "Year", value: "2025" }, { label: "Company", value: "Ledgerflow" }],
        values: { slug: "ledgerflow-operations", title: "Ledgerflow Operations", company: "ledgerflow", role: "Product Engineer", year: "2025", demoUrl: "", thumbnail: "/images/project-ledgerflow.svg", metric: "Unified reporting", excerpt: "Finance and operations workspace.", featured: false, tags: ["frontend"], body: "Ledgerflow case study.", metrics: "{}" },
      },
    ],
  },
  posts: {
    title: "Posts",
    singular: "post",
    eyebrow: "Writing",
    indexHref: "/admin/posts",
    fields: [
      { name: "slug", label: "Slug", type: "text", placeholder: "post-slug" },
      { name: "title", label: "Title", type: "text", placeholder: "Post title" },
      { name: "date", label: "Date", type: "date" },
      { name: "readTime", label: "Read time", type: "number", placeholder: "8" },
      { name: "thumbnail", label: "Thumbnail", type: "text", placeholder: "/images/post.svg" },
      { name: "excerpt", label: "Excerpt", type: "textarea", placeholder: "Post summary" },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "tags", label: "Tags", type: "checkboxGroup", options: tags },
      { name: "body", label: "Body", type: "textarea", placeholder: "Post content" },
    ],
    records: [
      {
        id: "post-1",
        slug: "dense-interfaces",
        title: "Designing Dense Interfaces",
        description: "How to reduce noise in information-rich products.",
        meta: [{ label: "Status", value: "Published" }, { label: "Read", value: "8 min" }],
        values: { slug: "dense-interfaces", title: "Designing Dense Interfaces", date: "2026-05-01", readTime: "8", thumbnail: "/images/blog-dense-interfaces.svg", excerpt: "How to reduce noise in information-rich products.", published: true, tags: ["product-design"], body: "Dense interface article." },
      },
      {
        id: "post-2",
        slug: "portfolio-as-product",
        title: "Portfolio as Product",
        description: "Treating a personal site as a maintained product.",
        meta: [{ label: "Status", value: "Draft" }, { label: "Read", value: "6 min" }],
        values: { slug: "portfolio-as-product", title: "Portfolio as Product", date: "2026-06-01", readTime: "6", thumbnail: "/images/blog-portfolio-product.svg", excerpt: "Treating a personal site as a maintained product.", published: false, tags: ["frontend"], body: "Portfolio product article." },
      },
    ],
  },
  experiences: {
    title: "Experiences",
    singular: "experience",
    eyebrow: "Career",
    indexHref: "/admin/experiences",
    fields: [
      { name: "slug", label: "Slug", type: "text", placeholder: "company-role" },
      { name: "company", label: "Company", type: "select", options: companies },
      { name: "role", label: "Role", type: "text", placeholder: "Frontend Developer" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "location", label: "Location", type: "text", placeholder: "Jakarta, Indonesia" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Experience summary" },
      { name: "projectHighlight", label: "Project highlight", type: "select", options: projectHighlights },
      { name: "skills", label: "Skills", type: "checkboxGroup", options: skills },
    ],
    records: [
      {
        id: "experience-1",
        slug: "northstar-frontend-developer",
        title: "Frontend Developer · Northstar",
        description: "Built product interfaces and a design system.",
        meta: [{ label: "Period", value: "2024 — Present" }, { label: "Location", value: "Jakarta" }],
        values: { slug: "northstar-frontend-developer", company: "northstar", role: "Frontend Developer", startDate: "2024-01-01", endDate: "", location: "Jakarta", description: "Built product interfaces and a design system.", projectHighlight: "design-system", skills: ["react", "typescript"] },
      },
      {
        id: "experience-2",
        slug: "ledgerflow-product-engineer",
        title: "Product Engineer · Ledgerflow",
        description: "Migrated legacy operations interfaces.",
        meta: [{ label: "Period", value: "2022 — 2024" }, { label: "Location", value: "Remote" }],
        values: { slug: "ledgerflow-product-engineer", company: "ledgerflow", role: "Product Engineer", startDate: "2022-01-01", endDate: "2024-01-01", location: "Remote", description: "Migrated legacy operations interfaces.", projectHighlight: "platform-migration", skills: ["typescript"] },
      },
    ],
  },
}
