import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { RichTextContent } from "@/components/shared/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/lib/post";
import type { PostWithRelations } from "@/types/post";

export function PostDetail({ post, listUrl, editUrl, onDelete }: { post: PostWithRelations; listUrl: string; editUrl: string; onDelete: () => void }) {
  return (
    <article>
      <Button href={listUrl} externalIcon={false} size="sm" variant="secondary">
        <ArrowLeft size={14} />
        Back
      </Button>
      <div className="mt-8 overflow-hidden border border-border">
        <div className="aspect-[16/7] bg-muted/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="border-b border-border py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={post.published ? "border-fg text-fg" : undefined}>
            {post.published ? "Published" : "Draft"}
          </Badge>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {formatPostDate(post.date)} · {post.readTime ?? 1} min read
          </p>
        </div>
        <h1 className="mt-3 max-w-5xl font-serif text-5xl leading-none sm:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.slug}>{tag.name}</Badge>
            ))}
          </div>
        )}
        <div className="mt-7 flex flex-wrap gap-2">
          <Button href={editUrl} externalIcon={false}>
            <Pencil size={15} />
            Edit Post
          </Button>
          <Button type="button" variant="secondary" onClick={onDelete}>
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </div>
      <div className="grid gap-8 py-9 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Article</p>
        <RichTextContent html={post.body} className="max-w-3xl" />
      </div>
    </article>
  );
}
