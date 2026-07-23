"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/project-form";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ProjectSchema } from "@/lib/form/project-schema";
import { useGetProject } from "@/lib/services/projects/get-project";
import { useUpdateProject } from "@/lib/services/projects/update-project";

export default function EditProjectClient({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useGetProject(slug);
  const mutation = useUpdateProject();
  const [submitError, setSubmitError] = useState<string>();

  if (query.isLoading) return <div className="h-[44rem] animate-pulse border border-border bg-muted/10" />;
  if ((query.error as AxiosError | null)?.response?.status === 404) return <div className="border border-border p-8"><h1 className="font-serif text-4xl">Project not found</h1><Button className="mt-6" href="/admin/projects" externalIcon={false}>Back to Projects</Button></div>;
  if (query.isError || !query.data) return <Alert color="error" message="Failed to load Project." />;

  const onSubmit = (values: ProjectSchema, applyServerErrors: (error: unknown) => void) => {
    setSubmitError(undefined);
    mutation.mutate({ slug, payload: values }, {
      onSuccess: (response) => router.push(`/admin/projects/${response.data.slug}`),
      onError: (error) => {
        applyServerErrors(error);
        setSubmitError(error.response?.data.message ?? "Failed to update Project");
      },
    });
  };

  return <><AdminPageHeader eyebrow="Portfolio" title="Edit Project" /><ProjectForm mode="edit" initialProject={query.data.data} isSubmitting={mutation.isPending} submitError={submitError} onSubmit={onSubmit} onCancel={() => router.push(`/admin/projects/${slug}`)} /></>;
}
