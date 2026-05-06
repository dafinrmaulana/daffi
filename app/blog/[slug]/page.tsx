import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/Badge"
import { getPost, posts } from "@/lib/content"

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug)
  return { title: post?.title ?? "Post" }
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="mb-6 flex flex-wrap gap-3 font-mono text-xs uppercase text-muted">
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
      <h1 className="font-serif text-5xl leading-tight sm:text-7xl">{post.title}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="relative mt-10 aspect-[16/10] overflow-hidden border border-border bg-muted/10">
        <Image src={post.thumbnail} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="mt-12">
        {post.body.map((paragraph) => (
          <p key={paragraph} className="mb-6 text-lg leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  )
}
