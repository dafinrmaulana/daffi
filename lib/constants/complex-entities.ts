import type { ComplexEntityConfig, ComplexEntityKind } from "@/types/admin"

const tags = [
  { label: "Frontend", value: "frontend" },
  { label: "Product Design", value: "product-design" },
]
export const complexEntityConfigs: Record<ComplexEntityKind, ComplexEntityConfig> = {
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
