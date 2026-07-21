import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/Badge"
import type { Post } from "@/lib/constants/main-contents"

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex min-h-full flex-col border border-border transition-colors hover:border-fg"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted/10">
        <Image
          src={post.thumbnail}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap gap-3 font-mono text-xs uppercase text-muted">
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{post.title}</h2>
        <p className="mt-4 text-muted">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {post.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
