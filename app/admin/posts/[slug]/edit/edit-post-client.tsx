"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PostSchema } from "@/lib/form/post-schema";
import { useAdminPagination } from "@/lib/hooks/use-admin-pagination";
import { getAdminPaginationUrl } from "@/lib/pagination/admin-pagination";
import { useGetPost } from "@/lib/services/posts/get-post";
import { useUpdatePost } from "@/lib/services/posts/update-post";

export default function EditPostClient({ slug }: { slug: string }) {
  const router = useRouter();
  const pagination = useAdminPagination();
  const listUrl = getAdminPaginationUrl("/admin/posts", pagination.page, pagination.limit);
  const detailUrl = getAdminPaginationUrl(
    `/admin/posts/${slug}`,
    pagination.page,
    pagination.limit,
  );
  const query = useGetPost(slug);
  const mutation = useUpdatePost();
  const [submitError, setSubmitError] = useState<string>();

  if (query.isLoading) return <div className="h-[44rem] animate-pulse border border-border bg-muted/10" />;
  if ((query.error as AxiosError | null)?.response?.status === 404) {
    return (
      <div className="border border-border p-8">
        <h1 className="font-serif text-4xl">Post not found</h1>
        <Button className="mt-6" href={listUrl} externalIcon={false}>
          Back to Posts
        </Button>
      </div>
    );
  }
  if (query.isError || !query.data) return <Alert color="error" message="Failed to load Post." />;

  const onSubmit = (values: PostSchema, applyServerErrors: (error: unknown) => void) => {
    setSubmitError(undefined);
    mutation.mutate(
      { slug, payload: values },
      {
        onSuccess: (response) =>
          router.push(
            getAdminPaginationUrl(
              `/admin/posts/${response.data.slug}`,
              pagination.page,
              pagination.limit,
            ),
          ),
        onError: (error) => {
          applyServerErrors(error);
          setSubmitError(error.response?.data.message ?? "Failed to update Post");
        },
      },
    );
  };

  return (
    <>
      <AdminPageHeader eyebrow="Writing" title="Edit Post" />
      <PostForm
        mode="edit"
        initialPost={query.data.data}
        isSubmitting={mutation.isPending}
        submitError={submitError}
        onSubmit={onSubmit}
        onCancel={() => router.push(detailUrl)}
      />
    </>
  );
}
