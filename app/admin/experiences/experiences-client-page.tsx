"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import EmptyContent from "@/components/admin/empty-content";
import { ExperienceCard } from "@/components/admin/experience-card";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useAdminPagination,
  useAdminPaginationBounds,
} from "@/lib/hooks/use-admin-pagination";
import { useDeleteExperience } from "@/lib/services/experiences/delete-experience";
import { useGetExperiences } from "@/lib/services/experiences/get-experiences";
import type { EventMessage } from "@/types/admin";

export default function ExperiencesClientPage() {
  const pagination = useAdminPagination();
  const { data, isLoading, isError, isFetching } = useGetExperiences({
    page: pagination.page,
    limit: pagination.limit,
  });

  useAdminPaginationBounds({
    page: pagination.page,
    meta: data?.meta,
    replacePage: pagination.replacePage,
  });
  const deleteMutation = useDeleteExperience();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);
  const experiences = data?.data ?? [];

  const handleDelete = () => {
    if (!deleteSlug) return;
    deleteMutation.mutate(deleteSlug, {
      onSuccess: () => {
        setDeleteSlug(null);
        setEventMessage({ type: "success", message: "Experience deleted successfully" });
      },
      onError: (error) => {
        setDeleteSlug(null);
        setEventMessage({ type: "failed", message: error.response?.data.message ?? "Failed to delete experience" });
      },
    });
  };

  return (
    <>
      <AdminPageHeader eyebrow="Career" title="Experiences" count={data?.meta.total ?? 0} action={<Button href="/admin/experiences/create" variant="primary" externalIcon={false}>Create Experience</Button>} />
      {eventMessage && <Alert className="mb-5" color={eventMessage.type === "success" ? "success" : "error"} message={eventMessage.message} onClose={() => setEventMessage(null)} />}
      {isError && <Alert className="mb-5" color="error" message="Failed to load experiences." />}
      {isLoading && <div className="grid grid-cols-1 gap-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-64 animate-pulse border border-border bg-muted/10" />)}</div>}
      {!isLoading && !isError && experiences.length === 0 && <EmptyContent title="No experiences yet" description="Create the first experience to populate this index." action={<Button href="/admin/experiences/create" variant="primary" externalIcon={false}>Create Experience</Button>} />}
      {!isLoading && experiences.length > 0 && <div className="grid grid-cols-1 gap-4">{experiences.map((experience) => <ExperienceCard key={experience.slug} experience={experience} onDelete={() => setDeleteSlug(experience.slug)} />)}</div>}
      {data?.meta && (
        <AdminPagination
          meta={data.meta}
          disabled={pagination.isNavigating || isFetching}
          onPageChange={pagination.setPage}
          onLimitChange={pagination.setLimit}
        />
      )}
      <ConfirmDialog open={Boolean(deleteSlug)} title="Delete Experience" description="This action permanently removes the experience and its skill connections." confirmText="Delete" loading={deleteMutation.isPending} onClose={() => setDeleteSlug(null)} onConfirm={handleDelete} />
    </>
  );
}
