import { ArrowLeft } from "lucide-react";

import { RichTextContent } from "@/components/shared/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/lib/post";
import type { PublicPost } from "@/types/public-content";

export function PostArticle({ post }: { post: PublicPost }) {
  return (
    <article>
      <Button href="/blog" externalIcon={false} size="sm" variant="secondary">
        <ArrowLeft size={14} />
        Back to Blog
      </Button>
      <div className="mt-8 overflow-hidden border border-border">
        <div className="aspect-[16/7] bg-muted/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
        </div>
      </div>
      <header className="border-b border-border py-8 sm:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {formatPostDate(post.date)} · {post.readTime ?? 1} min read
        </p>
        <h1 className="mt-4 max-w-5xl font-serif text-5xl leading-[0.95] sm:text-7xl">{post.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.slug}>{tag.name}</Badge>
            ))}
          </div>
        )}
      </header>
      <div className="grid gap-8 py-10 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Article</p>
        <RichTextContent html={post.body} className="max-w-3xl" />
      </div>
    </article>
  );
}
