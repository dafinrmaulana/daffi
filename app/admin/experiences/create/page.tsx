"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ExperienceForm } from "@/components/admin/experience-form";
import type { ExperienceSchema } from "@/lib/form/experience-schema";
import { useAdminPagination } from "@/lib/hooks/use-admin-pagination";
import { getAdminPaginationUrl } from "@/lib/pagination/admin-pagination";
import { useCreateExperience } from "@/lib/services/experiences/create-experience";

export default function CreateExperiencePage() {
  const router = useRouter();
  const pagination = useAdminPagination();
  const mutation = useCreateExperience();
  const [submitError, setSubmitError] = useState<string>();

  const onSubmit = (values: ExperienceSchema, applyServerErrors: (error: unknown) => void) => {
    setSubmitError(undefined);
    mutation.mutate(values, {
      onSuccess: (response) =>
        router.push(
          getAdminPaginationUrl(
            `/admin/experiences/${response.data.slug}`,
            pagination.page,
            pagination.limit,
          ),
        ),
      onError: (error) => {
        applyServerErrors(error);
        setSubmitError(error.response?.data.message ?? "Failed to create experience");
      },
    });
  };

  return (
    <>
      <AdminPageHeader eyebrow="Career" title="Create Experience" />
      <ExperienceForm
        mode="create"
        isSubmitting={mutation.isPending}
        submitError={submitError}
        onSubmit={onSubmit}
        onCancel={() =>
          router.push(
            getAdminPaginationUrl(
              "/admin/experiences",
              pagination.page,
              pagination.limit,
            ),
          )
        }
      />
    </>
  );
}
