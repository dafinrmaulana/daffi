"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExperienceDetail } from "@/components/admin/experience-detail";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDeleteExperience } from "@/lib/services/experiences/delete-experience";
import { useGetExperience } from "@/lib/services/experiences/get-experience";

export default function ExperienceDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useGetExperience(slug);
  const deleteMutation = useDeleteExperience();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  if (query.isLoading) return <div className="h-[32rem] animate-pulse border border-border bg-muted/10" />;
  if ((query.error as AxiosError | null)?.response?.status === 404) {
    return <div className="border border-border p-8"><h1 className="font-serif text-4xl">Experience not found</h1><p className="mt-3 text-muted">The requested slug does not exist.</p><Button className="mt-6" href="/admin/experiences" externalIcon={false}>Back to Experiences</Button></div>;
  }
  if (query.isError || !query.data) return <Alert color="error" message="Failed to load experience." />;

  const handleDelete = () => {
    deleteMutation.mutate(slug, {
      onSuccess: () => router.push("/admin/experiences"),
      onError: (error) => {
        setConfirmOpen(false);
        setDeleteError(error.response?.data.message ?? "Failed to delete experience");
      },
    });
  };

  return (
    <>
      {deleteError && <Alert className="mb-5" color="error" message={deleteError} onClose={() => setDeleteError(undefined)} />}
      <ExperienceDetail experience={query.data.data} onDelete={() => setConfirmOpen(true)} />
      <ConfirmDialog open={confirmOpen} title="Delete Experience" description="This action permanently removes the experience and its skill connections." confirmText="Delete" loading={deleteMutation.isPending} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </>
  );
}
