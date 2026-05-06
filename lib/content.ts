export type Project = {
  slug: string
  title: string
  company: string
  year: string
  role: string
  tags: string[]
  metric: string
  metrics: Array<{ label: string; value: string }>
  excerpt: string
  featured: boolean
  wip?: boolean
  body: string[]
}

export type Post = {
  slug: string
  title: string
  date: string
  readTime: string
  tags: string[]
  excerpt: string
  body: string[]
}

export const projects: Project[] = [
  {
    slug: "ops-command",
    title: "Ops Command",
    company: "Internal SaaS",
    year: "2026",
    role: "Product Engineer",
    tags: ["Next.js", "Dashboard", "Design System"],
    metric: "42% faster triage",
    metrics: [
      { label: "Workflow speed", value: "+42%" },
      { label: "Active teams", value: "8" },
    ],
    excerpt:
      "A dense operations dashboard for monitoring tickets, ownership, and SLA pressure in one glance.",
    featured: true,
    body: [
      "Ops Command was designed for teams that repeatedly scan the same operational signals throughout the day. The interface keeps priority, ownership, and next action visible without turning the screen into a wall of controls.",
      "The project focused on tight information hierarchy, clear status language, and predictable navigation between queue, detail, and reporting views.",
    ],
  },
  {
    slug: "ledgerflow",
    title: "Ledgerflow",
    company: "Fintech Studio",
    year: "2025",
    role: "Frontend Lead",
    tags: ["TypeScript", "Charts", "Automation"],
    metric: "3.1x report output",
    metrics: [
      { label: "Report output", value: "3.1x" },
      { label: "Manual steps", value: "-64%" },
    ],
    excerpt:
      "A reporting workspace that turns fragmented finance activity into review-ready monthly summaries.",
    featured: true,
    body: [
      "Ledgerflow combines transaction review, exception handling, and reporting into one focused workspace. The work centered on reducing context switches while preserving audit confidence.",
      "Reusable chart and table primitives made the product easier to extend across account, category, and period-level views.",
    ],
  },
  {
    slug: "northstar-site",
    title: "Northstar Site",
    company: "Creative Partner",
    year: "2024",
    role: "Designer Developer",
    tags: ["Brand", "CMS", "Performance"],
    metric: "98 Lighthouse score",
    metrics: [
      { label: "Performance", value: "98" },
      { label: "Pages shipped", value: "24" },
    ],
    excerpt:
      "A typographic marketing site with fast editorial pages and a maintainable content model.",
    featured: true,
    wip: true,
    body: [
      "Northstar Site translates a restrained visual identity into a flexible web system. The main challenge was keeping pages expressive while maintaining a simple authoring workflow.",
      "The result is a fast, accessible site with reusable page sections and strong first-viewport brand recognition.",
    ],
  },
]

export const posts: Post[] = [
  {
    slug: "designing-dense-interfaces",
    title: "Designing dense interfaces without visual noise",
    date: "2026-04-18",
    readTime: "4 min",
    tags: ["Design", "Frontend"],
    excerpt:
      "Notes on hierarchy, rhythm, and restraint for tools that users keep open all day.",
    body: [
      "Dense interfaces work when every visible element earns its place. The goal is not to remove information, but to make scanning cheaper.",
      "Start with the user rhythm: what they check first, what changes often, and what decisions the page should accelerate.",
    ],
  },
  {
    slug: "portfolio-as-product",
    title: "Treating a portfolio like a product surface",
    date: "2026-03-02",
    readTime: "3 min",
    tags: ["Portfolio", "Writing"],
    excerpt:
      "A portfolio can do more than display work; it can demonstrate judgment in the way it is structured.",
    body: [
      "A strong portfolio does not need to explain every capability at once. It should give readers enough signal to understand taste, range, and process.",
      "Case studies are most useful when they show constraints, decisions, and measurable change.",
    ],
  },
]

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}
