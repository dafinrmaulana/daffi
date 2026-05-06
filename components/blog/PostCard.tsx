import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/Badge"
import type { Post } from "@/lib/content"

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid gap-5 border-t border-border py-7 hover:border-fg md:grid-cols-[220px_1fr]">
      <div className="relative aspect-[16/11] overflow-hidden border border-border bg-muted/10">
        <Image
          src={post.thumbnail}
          alt=""
          fill
          sizes="(min-width: 768px) 220px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div>
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
      </div>
    </Link>
  )
}
