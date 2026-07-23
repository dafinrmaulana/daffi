import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { formatPostDate } from "@/lib/post"
import type { PostWithRelations } from "@/types/post"

export function PostCard({ post }: { post: PostWithRelations }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden border border-border bg-bg transition-colors hover:border-fg lg:grid-cols-[22rem_minmax(0,1fr)]"
    >
      <div className="aspect-video overflow-hidden border-b border-border bg-muted/10 lg:aspect-auto lg:border-b-0 lg:border-r">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5 sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {formatPostDate(post.date)} · {post.readTime ?? 1} min read
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{post.title}</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.slug}>{tag.name}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
