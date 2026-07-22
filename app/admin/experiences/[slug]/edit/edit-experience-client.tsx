"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ExperienceForm } from "@/components/admin/experience-form";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ExperienceSchema } from "@/lib/form/experience-schema";
import { useGetExperience } from "@/lib/services/experiences/get-experience";
import { useUpdateExperience } from "@/lib/services/experiences/update-experience";

export default function EditExperienceClient({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useGetExperience(slug);
  const mutation = useUpdateExperience();
  const [submitError, setSubmitError] = useState<string>();

  if (query.isLoading) return <div className="h-[38rem] animate-pulse border border-border bg-muted/10" />;
  if ((query.error as AxiosError | null)?.response?.status === 404) {
    return <div className="border border-border p-8"><h1 className="font-serif text-4xl">Experience not found</h1><Button className="mt-6" href="/admin/experiences" externalIcon={false}>Back to Experiences</Button></div>;
  }
  if (query.isError || !query.data) return <Alert color="error" message="Failed to load experience." />;

  const onSubmit = (values: ExperienceSchema, applyServerErrors: (error: unknown) => void) => {
    setSubmitError(undefined);
    mutation.mutate({ slug, payload: values }, {
      onSuccess: (response) => router.push(`/admin/experiences/${response.data.slug}`),
      onError: (error) => {
        applyServerErrors(error);
        setSubmitError(error.response?.data.message ?? "Failed to update experience");
      },
    });
  };

  return (
    <>
      <AdminPageHeader eyebrow="Career" title="Edit Experience" />
      <ExperienceForm mode="edit" initialExperience={query.data.data} isSubmitting={mutation.isPending} submitError={submitError} onSubmit={onSubmit} onCancel={() => router.push(`/admin/experiences/${slug}`)} />
    </>
  );
}
