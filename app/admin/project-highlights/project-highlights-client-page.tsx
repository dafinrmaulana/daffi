"use client";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AdminPagination } from "@/components/admin/admin-pagination";
import EmptyContent from "@/components/admin/empty-content";
import { EntityCard } from "@/components/admin/entity-card";
import { Modal } from "@/components/admin/modal";
import Input from "@/components/form/input";
import { CrudLayout } from "@/components/layout/crud-layout";
import GridLayout from "@/components/layout/grid-layout";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CreateButton from "@/components/ui/create-button";
import { ProjectHighlightSchema } from "@/lib/form/project-highlight-schema";
import {
  useAdminPagination,
  useAdminPaginationBounds,
} from "@/lib/hooks/use-admin-pagination";
import { useCreateProjectHighlight } from "@/lib/services/project-highlights/create-project-highlight";
import { useDeleteProjectHighlight } from "@/lib/services/project-highlights/delete-project-highlight";
import { useGetProjectHighlights } from "@/lib/services/project-highlights/get-project-highlights";
import { useUpdateProjectHighlight } from "@/lib/services/project-highlights/update-project-highlight";
import { normalizeSlug } from "@/lib/slug";
import type { ProjectHighlight } from "@/prisma/generated/prisma/client";
import type { EventMessage, OptionalModeFormModalState } from "@/types/admin";
import type { ValidationErrorResponse } from "@/types/api";
import { AxiosError } from "axios";
import { FileText, Highlighter, Link } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export default function ProjectHighlightsClientPage() {
  const pagination = useAdminPagination();
  const createMutation = useCreateProjectHighlight();
  const deleteMutation = useDeleteProjectHighlight();
  const updateMutation = useUpdateProjectHighlight();

  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<OptionalModeFormModalState | null>(null);

  const [selectedProjectHighlight, setSelectedProjectHighlight] = useState<ProjectHighlight | null>(null);
  const slugManuallyEdited = useRef(false);

  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);

  const {
    data: projectHighlights,
    isLoading,
    isFetching,
  } = useGetProjectHighlights({
    page: pagination.page,
    limit: pagination.limit,
  });

  useAdminPaginationBounds({
    page: pagination.page,
    meta: projectHighlights?.meta,
    replacePage: pagination.replacePage,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProjectHighlightSchema>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const watchedName = useWatch({ control, name: "name" });
  const slugRegistration = register("slug");

  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setValue("slug", normalizeSlug(watchedName), { shouldDirty: true });
    }
  }, [setValue, watchedName]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const handleOpenCreate = () => {
    slugManuallyEdited.current = false;

    reset({
      name: "",
      slug: "",
      description: "",
    });

    setSelectedProjectHighlight(null);
    setIsFormOpen({
      open: true,
      mode: "create",
    });
  };

  const handleOpenEdit = (projectHighlight: ProjectHighlight) => {
    slugManuallyEdited.current = true;

    reset({
      name: projectHighlight.name,
      slug: projectHighlight.slug,
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
    const axiosError = error as AxiosError<ValidationErrorResponse<keyof ProjectHighlightSchema>>;
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
          slug: selectedProjectHighlight.slug,
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
      total={projectHighlights?.meta.total}
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

                  <Button size="sm" variant="outline" onClick={() => setSlugToDelete(projectHighlight.slug)}>
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
        </GridLayout>
      )}

      {projectHighlights?.meta && (
        <AdminPagination
          meta={projectHighlights.meta}
          disabled={pagination.isNavigating || isFetching}
          onPageChange={pagination.setPage}
          onLimitChange={pagination.setLimit}
        />
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
            label="Slug"
            id="slug"
            type="text"
            placeholder="project-highlight-name"
            errorMessage={errors.slug?.message}
            {...slugRegistration}
            onChange={(event) => {
              slugManuallyEdited.current = true;
              slugRegistration.onChange(event);
            }}
            prefixIcon={{
              icon: Link,
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
        open={slugToDelete !== null}
        title="Delete Project Highlight"
        description="Are you sure you want to delete this project highlight? This action cannot be undone."
        confirmText="Yes, Delete"
        onClose={() => setSlugToDelete(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (slugToDelete === null) return;

          deleteMutation.mutate(slugToDelete, {
            onSuccess: () => {
              setSlugToDelete(null);

              setEventMessage({
                type: "success",
                message: "Project highlight deleted successfully",
              });
            },

            onError: (error) => {
              console.error(error);
              setSlugToDelete(null);

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
