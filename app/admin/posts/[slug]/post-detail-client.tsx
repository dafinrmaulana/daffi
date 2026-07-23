"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PostDetail } from "@/components/admin/post-detail";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDeletePost } from "@/lib/services/posts/delete-post";
import { useGetPost } from "@/lib/services/posts/get-post";

export default function PostDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useGetPost(slug);
  const deleteMutation = useDeletePost();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  if (query.isLoading) return <div className="h-[40rem] animate-pulse border border-border bg-muted/10" />;
  if ((query.error as AxiosError | null)?.response?.status === 404) {
    return (
      <div className="border border-border p-8">
        <h1 className="font-serif text-4xl">Post not found</h1>
        <p className="mt-3 text-muted">The requested slug does not exist.</p>
        <Button className="mt-6" href="/admin/posts" externalIcon={false}>
          Back to Posts
        </Button>
      </div>
    );
  }
  if (query.isError || !query.data) return <Alert color="error" message="Failed to load Post." />;

  const handleDelete = () => {
    deleteMutation.mutate(slug, {
      onSuccess: () => router.push("/admin/posts"),
      onError: (error) => {
        setConfirmOpen(false);
        setDeleteError(error.response?.data.message ?? "Failed to delete Post");
      },
    });
  };

  return (
    <>
      {deleteError && (
        <Alert
          className="mb-5"
          color="error"
          message={deleteError}
          onClose={() => setDeleteError(undefined)}
        />
      )}
      <PostDetail post={query.data.data} onDelete={() => setConfirmOpen(true)} />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Post"
        description="This action permanently removes the Post and its Tag connections."
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
