import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/lib/post";
import { getAdminPaginationUrl } from "@/lib/pagination/admin-pagination";
import type { PostWithRelations } from "@/types/post";

export function PostCard({ post, page, limit, onDelete }: { post: PostWithRelations; page: number; limit: number; onDelete: () => void }) {
  return (
    <article className="grid overflow-hidden border border-border bg-bg lg:grid-cols-[22rem_minmax(0,1fr)_18rem]">
      <div className="aspect-video bg-muted/10 lg:aspect-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.thumbnail} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={post.published ? "border-fg text-fg" : undefined}>
            {post.published ? "Published" : "Draft"}
          </Badge>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {formatPostDate(post.date)} · {post.readTime ?? 1} min read
          </p>
        </div>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.slug}>{tag.name}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-end border-t border-border p-5 lg:border-l lg:border-t-0">
        <div className="flex flex-wrap gap-2">
          <Button href={getAdminPaginationUrl(`/admin/posts/${post.slug}`, page, limit)} externalIcon={false} size="sm">
            <Eye size={14} />
            View
          </Button>
          <Button href={getAdminPaginationUrl(`/admin/posts/${post.slug}/edit`, page, limit)} externalIcon={false} size="sm">
            <Pencil size={14} />
            Edit
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onDelete}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
