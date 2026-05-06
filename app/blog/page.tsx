import type { Metadata } from "next"

import { PostCard } from "@/components/blog/PostCard"
import { Section } from "@/components/layout/Section"
import { posts } from "@/lib/content"

export const metadata: Metadata = {
  title: "Blog",
}

export default function BlogPage() {
  return (
    <Section>
      <div className="mb-12">
        <p className="mb-4 font-mono text-xs uppercase text-muted">## Blog</p>
        <h1 className="max-w-5xl font-serif text-6xl leading-none sm:text-8xl">
          Notes on interface craft and web systems.
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </Section>
  )
}
