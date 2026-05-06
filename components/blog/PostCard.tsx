import Link from "next/link"

import { Badge } from "@/components/ui/Badge"
import type { Post } from "@/lib/content"

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block border-t border-border py-7 hover:border-fg">
      <div className="mb-3 flex flex-wrap gap-3 font-mono text-xs uppercase text-muted">
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
      <h2 className="max-w-4xl font-serif text-3xl leading-tight sm:text-5xl">{post.title}</h2>
      <p className="mt-4 max-w-2xl text-muted">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </Link>
  )
}
