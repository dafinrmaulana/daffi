"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import EmptyContent from "@/components/admin/empty-content";
import { PostCard } from "@/components/admin/post-card";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useAdminPagination,
  useAdminPaginationBounds,
} from "@/lib/hooks/use-admin-pagination";
import { useDeletePost } from "@/lib/services/posts/delete-post";
import { useGetPosts } from "@/lib/services/posts/get-posts";
import { getAdminPaginationUrl } from "@/lib/pagination/admin-pagination";
import type { EventMessage } from "@/types/admin";

export default function PostsClientPage() {
  const pagination = useAdminPagination();
  const { data, isLoading, isError, isFetching } = useGetPosts({
    page: pagination.page,
    limit: pagination.limit,
  });

  useAdminPaginationBounds({
    page: pagination.page,
    limit: pagination.limit,
    meta: data?.meta,
    replacePage: pagination.replacePage,
  });
  const deleteMutation = useDeletePost();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);
  const posts = data?.data ?? [];

  const handleDelete = () => {
    if (!deleteSlug) return;
    deleteMutation.mutate(deleteSlug, {
      onSuccess: () => {
        setDeleteSlug(null);
        setEventMessage({ type: "success", message: "Post deleted successfully" });
      },
      onError: (error) => {
        setDeleteSlug(null);
        setEventMessage({
          type: "failed",
          message: error.response?.data.message ?? "Failed to delete Post",
        });
      },
    });
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Writing"
        title="Posts"
        count={data?.meta.total ?? 0}
        action={
          <Button href={getAdminPaginationUrl("/admin/posts/create", pagination.page, pagination.limit)} variant="primary" externalIcon={false}>
            Create Post
          </Button>
        }
      />
      {eventMessage && (
        <Alert
          className="mb-5"
          color={eventMessage.type === "success" ? "success" : "error"}
          message={eventMessage.message}
          onClose={() => setEventMessage(null)}
        />
      )}
      {isError && <Alert className="mb-5" color="error" message="Failed to load Posts." />}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse border border-border bg-muted/10" />
          ))}
        </div>
      )}
      {!isLoading && !isError && data?.meta.total === 0 && (
        <EmptyContent
          title="No Posts yet"
          description="Create the first Post to populate this index."
          action={
            <Button href={getAdminPaginationUrl("/admin/posts/create", pagination.page, pagination.limit)} variant="primary" externalIcon={false}>
              Create Post
            </Button>
          }
        />
      )}
      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} page={pagination.page} limit={pagination.limit} onDelete={() => setDeleteSlug(post.slug)} />
          ))}
        </div>
      )}
      {data?.meta && (
        <AdminPagination
          meta={data.meta}
          disabled={pagination.isNavigating || isFetching}
          onPageChange={pagination.setPage}
          onLimitChange={pagination.setLimit}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteSlug)}
        title="Delete Post"
        description="This action permanently removes the Post and its Tag connections."
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteSlug(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
