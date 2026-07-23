"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import EmptyContent from "@/components/admin/empty-content";
import { ProjectCard } from "@/components/admin/project-card";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useAdminPagination,
  useAdminPaginationBounds,
} from "@/lib/hooks/use-admin-pagination";
import { useDeleteProject } from "@/lib/services/projects/delete-project";
import { useGetProjects } from "@/lib/services/projects/get-projects";
import type { EventMessage } from "@/types/admin";

export default function ProjectsClientPage() {
  const pagination = useAdminPagination();
  const { data, isLoading, isError, isFetching } = useGetProjects({
    page: pagination.page,
    limit: pagination.limit,
  });

  useAdminPaginationBounds({
    page: pagination.page,
    meta: data?.meta,
    replacePage: pagination.replacePage,
  });
  const deleteMutation = useDeleteProject();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);
  const projects = data?.data ?? [];

  const handleDelete = () => {
    if (!deleteSlug) return;
    deleteMutation.mutate(deleteSlug, {
      onSuccess: () => {
        setDeleteSlug(null);
        setEventMessage({ type: "success", message: "Project deleted successfully" });
      },
      onError: (error) => {
        setDeleteSlug(null);
        setEventMessage({ type: "failed", message: error.response?.data.message ?? "Failed to delete project" });
      },
    });
  };

  return (
    <>
      <AdminPageHeader eyebrow="Portfolio" title="Projects" count={data?.meta.total ?? 0} action={<Button href="/admin/projects/create" variant="primary" externalIcon={false}>Create Project</Button>} />
      {eventMessage && <Alert className="mb-5" color={eventMessage.type === "success" ? "success" : "error"} message={eventMessage.message} onClose={() => setEventMessage(null)} />}
      {isError && <Alert className="mb-5" color="error" message="Failed to load projects." />}
      {isLoading && <div className="grid grid-cols-1 gap-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse border border-border bg-muted/10" />)}</div>}
      {!isLoading && !isError && projects.length === 0 && <EmptyContent title="No projects yet" description="Create the first Project to populate this index." action={<Button href="/admin/projects/create" variant="primary" externalIcon={false}>Create Project</Button>} />}
      {!isLoading && projects.length > 0 && <div className="grid grid-cols-1 gap-4">{projects.map((project) => <ProjectCard key={project.slug} project={project} onDelete={() => setDeleteSlug(project.slug)} />)}</div>}
      {data?.meta && (
        <AdminPagination
          meta={data.meta}
          disabled={pagination.isNavigating || isFetching}
          onPageChange={pagination.setPage}
          onLimitChange={pagination.setLimit}
        />
      )}
      <ConfirmDialog open={Boolean(deleteSlug)} title="Delete Project" description="This action permanently removes the Project and its Tag connections." confirmText="Delete" loading={deleteMutation.isPending} onClose={() => setDeleteSlug(null)} onConfirm={handleDelete} />
    </>
  );
}
