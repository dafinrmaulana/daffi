"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProjectDetail } from "@/components/admin/project-detail";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDeleteProject } from "@/lib/services/projects/delete-project";
import { useGetProject } from "@/lib/services/projects/get-project";

export default function ProjectDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useGetProject(slug);
  const deleteMutation = useDeleteProject();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  if (query.isLoading) return <div className="h-[40rem] animate-pulse border border-border bg-muted/10" />;
  if ((query.error as AxiosError | null)?.response?.status === 404) return <div className="border border-border p-8"><h1 className="font-serif text-4xl">Project not found</h1><p className="mt-3 text-muted">The requested slug does not exist.</p><Button className="mt-6" href="/admin/projects" externalIcon={false}>Back to Projects</Button></div>;
  if (query.isError || !query.data) return <Alert color="error" message="Failed to load Project." />;

  const handleDelete = () => deleteMutation.mutate(slug, {
    onSuccess: () => router.push("/admin/projects"),
    onError: (error) => {
      setConfirmOpen(false);
      setDeleteError(error.response?.data.message ?? "Failed to delete Project");
    },
  });

  return <>{deleteError && <Alert className="mb-5" color="error" message={deleteError} onClose={() => setDeleteError(undefined)} />}<ProjectDetail project={query.data.data} onDelete={() => setConfirmOpen(true)} /><ConfirmDialog open={confirmOpen} title="Delete Project" description="This action permanently removes the Project and its Tag connections." confirmText="Delete" loading={deleteMutation.isPending} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} /></>;
}
