"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import EmptyContent from "@/components/admin/EmptyContent";
import { EntityCard } from "@/components/admin/EntityCard";
import { Modal } from "@/components/admin/Modal";
import Input from "@/components/form/Input";
import { CrudLayout } from "@/components/layout/CrudLayout";
import GridLayout from "@/components/layout/grid-layout";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import CreateButton from "@/components/ui/CreateButton";
import { ProjectHighlightSchema } from "@/lib/form/project-highlight.schema";
import { useCreateProjectHighlight } from "@/lib/services/project-highlights/create-project-highlight";
import { useDeleteProjectHighlight } from "@/lib/services/project-highlights/delete-project-highlight";
import { useGetProjectHighlights } from "@/lib/services/project-highlights/get-project-highlights";
import { useUpdateProjectHighlight } from "@/lib/services/project-highlights/update-project-highlight";
import { AxiosError } from "axios";
import { FileText, Highlighter } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type ModalFormState = {
  open: boolean;
  mode?: "create" | "edit";
};

type ProjectHighlightData = ProjectHighlightSchema & {
  id: number;
};

type ValidationErrorResponse = {
  errors?: Partial<Record<keyof ProjectHighlightSchema, string[]>>;
};

export default function ProjectHighlightsClientPage() {
  const createMutation = useCreateProjectHighlight();
  const deleteMutation = useDeleteProjectHighlight();
  const updateMutation = useUpdateProjectHighlight();

  const [dataToDelete, setDataToDelete] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<ModalFormState | null>(null);

  const [selectedProjectHighlight, setSelectedProjectHighlight] = useState<ProjectHighlightData | null>(null);

  const [eventMessage, setEventMessage] = useState<{
    type: "success" | "failed";
    message: string;
  } | null>(null);

  const { data: projectHighlights, isLoading } = useGetProjectHighlights();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProjectHighlightSchema>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const handleOpenCreate = () => {
    reset({
      name: "",
      description: "",
    });

    setSelectedProjectHighlight(null);
    setIsFormOpen({
      open: true,
      mode: "create",
    });
  };

  const handleOpenEdit = (projectHighlight: ProjectHighlightData) => {
    reset({
      name: projectHighlight.name,
      description: projectHighlight.description ?? "",
    });

    setSelectedProjectHighlight(projectHighlight);
    setIsFormOpen({
      open: true,
      mode: "edit",
    });
  };

  const handleSuccess = () => {
    setEventMessage({
      type: "success",
      message:
        isFormOpen?.mode === "create"
          ? "Project highlight created successfully"
          : "Project highlight updated successfully",
    });

    reset();
    setSelectedProjectHighlight(null);
    setIsFormOpen({
      open: false,
      mode: "create",
    });
  };

  const handleValidationError = (error: unknown) => {
    const axiosError = error as AxiosError<ValidationErrorResponse>;

    const validationErrors = axiosError.response?.data.errors;

    if (!validationErrors) {
      setEventMessage({
        type: "failed",
        message: "Failed to save project highlight",
      });

      return;
    }

    Object.entries(validationErrors).forEach(([field, messages]) => {
      const message = messages?.[0];

      if (!message) return;

      setError(field as keyof ProjectHighlightSchema, {
        type: "server",
        message,
      });
    });
  };

  const onSubmit = (formData: ProjectHighlightSchema) => {
    const mutationOptions = {
      onSuccess: handleSuccess,
      onError: handleValidationError,
    };

    if (isFormOpen?.mode === "edit") {
      if (!selectedProjectHighlight) return;

      updateMutation.mutate(
        {
          id: String(selectedProjectHighlight.id),
          payload: formData,
        },
        mutationOptions,
      );

      return;
    }

    createMutation.mutate(formData, mutationOptions);
  };

  const handleCancel = () => {
    reset();
    setSelectedProjectHighlight(null);

    setIsFormOpen((previous) => ({
      ...previous,
      open: false,
    }));
  };

  return (
    <CrudLayout
      kind="projectHighlights"
      createLabel="Create Project Highlight"
      onCreate={handleOpenCreate}
      data={projectHighlights?.data ?? []}
    >
      {eventMessage && (
        <Alert
          className="mb-4"
          color={eventMessage.type === "success" ? "success" : "error"}
          message={eventMessage.message}
          onClose={() => setEventMessage(null)}
        />
      )}

      {isLoading && (
        <GridLayout>
          {Array.from({ length: 10 }).map((_, index) => (
            <EntityCard key={index} loading title="" />
          ))}
        </GridLayout>
      )}

      {!isLoading && projectHighlights?.data.length === 0 && (
        <EmptyContent
          title="No project highlights yet"
          description="Create the first project highlight to populate this index."
          action={<CreateButton label="Create Project Highlight" onCreate={handleOpenCreate} />}
        />
      )}

      {!isLoading && projectHighlights?.data && projectHighlights.data.length > 0 && (
        <GridLayout>
          {projectHighlights.data.map((projectHighlight) => (
            <EntityCard
              key={projectHighlight.id}
              eyebrow="Project Highlight"
              title={projectHighlight.name}
              description={projectHighlight.description ?? "No description"}
              actions={
                <div className="flex w-full justify-end gap-2">
                  <Button size="sm" onClick={() => handleOpenEdit(projectHighlight)}>
                    Edit
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => setDataToDelete(projectHighlight.id)}>
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
        </GridLayout>
      )}

      <Modal
        open={isFormOpen?.open ?? false}
        onOpenChange={(open) =>
          setIsFormOpen((previous) => ({
            ...previous,
            open,
          }))
        }
        title={isFormOpen?.mode === "create" ? "Create Project Highlight" : "Edit Project Highlight"}
        size="md"
        footer={
          <div className="flex w-full justify-between">
            <Button onClick={handleCancel} disabled={isMutating}>
              Cancel
            </Button>

            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isMutating}>
              Save {isFormOpen?.mode === "create" ? "Project Highlight" : "Changes"}
            </Button>
          </div>
        }
      >
        <div className="flex w-full flex-col gap-3">
          <Input
            required
            label="Name"
            id="name"
            type="text"
            placeholder="Project highlight name"
            errorMessage={errors.name?.message}
            {...register("name")}
            prefixIcon={{
              icon: Highlighter,
            }}
          />

          <Input
            label="Description"
            id="description"
            type="text"
            placeholder="Project highlight description"
            errorMessage={errors.description?.message}
            {...register("description")}
            prefixIcon={{
              icon: FileText,
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={dataToDelete !== null}
        title="Delete Project Highlight"
        description="Are you sure you want to delete this project highlight? This action cannot be undone."
        confirmText="Yes, Delete"
        onClose={() => setDataToDelete(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (dataToDelete === null) return;

          deleteMutation.mutate(dataToDelete, {
            onSuccess: () => {
              setDataToDelete(null);

              setEventMessage({
                type: "success",
                message: "Project highlight deleted successfully",
              });
            },

            onError: (error) => {
              console.error(error);
              setDataToDelete(null);

              setEventMessage({
                type: "failed",
                message: "Failed to delete project highlight",
              });
            },
          });
        }}
      />
    </CrudLayout>
  );
}
