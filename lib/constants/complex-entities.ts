import type { ComplexEntityConfig, ComplexEntityKind } from "@/types/admin"

const companies = [
  { label: "Northstar Studio", value: "northstar" },
  { label: "Ledgerflow", value: "ledgerflow" },
]
const tags = [
  { label: "Frontend", value: "frontend" },
  { label: "Product Design", value: "product-design" },
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
}
