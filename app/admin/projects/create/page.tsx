"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/project-form";
import type { ProjectSchema } from "@/lib/form/project-schema";
import { useCreateProject } from "@/lib/services/projects/create-project";

export default function CreateProjectPage() {
  const router = useRouter();
  const mutation = useCreateProject();
  const [submitError, setSubmitError] = useState<string>();

  const onSubmit = (values: ProjectSchema, applyServerErrors: (error: unknown) => void) => {
    setSubmitError(undefined);
    mutation.mutate(values, {
      onSuccess: (response) => router.push(`/admin/projects/${response.data.slug}`),
      onError: (error) => {
        applyServerErrors(error);
        setSubmitError(error.response?.data.message ?? "Failed to create project");
      },
    });
  };

  return <><AdminPageHeader eyebrow="Portfolio" title="Create Project" /><ProjectForm mode="create" isSubmitting={mutation.isPending} submitError={submitError} onSubmit={onSubmit} onCancel={() => router.push("/admin/projects")} /></>;
}
