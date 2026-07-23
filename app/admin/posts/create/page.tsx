"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";
import type { PostSchema } from "@/lib/form/post-schema";
import { useAdminPagination } from "@/lib/hooks/use-admin-pagination";
import { getAdminPaginationUrl } from "@/lib/pagination/admin-pagination";
import { useCreatePost } from "@/lib/services/posts/create-post";

export default function CreatePostPage() {
  const router = useRouter();
  const pagination = useAdminPagination();
  const mutation = useCreatePost();
  const [submitError, setSubmitError] = useState<string>();

  const onSubmit = (values: PostSchema, applyServerErrors: (error: unknown) => void) => {
    setSubmitError(undefined);
    mutation.mutate(values, {
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
        setSubmitError(error.response?.data.message ?? "Failed to create Post");
      },
    });
  };

  return (
    <>
      <AdminPageHeader eyebrow="Writing" title="Create Post" />
      <PostForm
        mode="create"
        isSubmitting={mutation.isPending}
        submitError={submitError}
        onSubmit={onSubmit}
        onCancel={() =>
          router.push(
            getAdminPaginationUrl("/admin/posts", pagination.page, pagination.limit),
          )
        }
      />
    </>
  );
}
