"use client";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import EmptyContent from "@/components/admin/empty-content";
import { EntityCard } from "@/components/admin/entity-card";
import { Modal } from "@/components/admin/modal";
import Input from "@/components/form/input";
import { CrudLayout } from "@/components/layout/crud-layout";
import GridLayout from "@/components/layout/grid-layout";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CreateButton from "@/components/ui/create-button";
import { TagSchema } from "@/lib/form/tag-schema";
import { useCreateTag } from "@/lib/services/tags/create-tag";
import { useDeleteTag } from "@/lib/services/tags/delete-tag";
import { useGetTags } from "@/lib/services/tags/get-tags";
import { useUpdateTag } from "@/lib/services/tags/update-tag";
import { normalizeSlug } from "@/lib/slug";
import type { Tag } from "@/prisma/generated/prisma/client";
import { AxiosError } from "axios";
import { FileText, Link, Tag as TagIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

type ModalFormState = {
  open: boolean;
  mode: "create" | "edit";
};

type ValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof TagSchema, string[]>>;
};

export default function TagsClientPage() {
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();
  const updateMutation = useUpdateTag();

  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  const [formState, setFormState] = useState<ModalFormState>({
    open: false,
    mode: "create",
  });

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const slugManuallyEdited = useRef(false);

  const [eventMessage, setEventMessage] = useState<{
    type: "success" | "failed";
    message: string;
  } | null>(null);

  const { data: tags, isLoading } = useGetTags();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<TagSchema>({
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
    clearErrors();
    slugManuallyEdited.current = false;

    reset({
      name: "",
      slug: "",
      description: "",
    });

    setSelectedTag(null);

    setFormState({
      open: true,
      mode: "create",
    });
  };

  const handleOpenEdit = (tag: Tag) => {
    clearErrors();
    slugManuallyEdited.current = true;

    reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? "",
    });

    setSelectedTag(tag);

    setFormState({
      open: true,
      mode: "edit",
    });
  };

  const handleCloseForm = () => {
    reset();
    clearErrors();
    setSelectedTag(null);

    setFormState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const handleValidationError = (error: unknown) => {
    const axiosError = error as AxiosError<ValidationErrorResponse>;

    const validationErrors = axiosError.response?.data.errors;

    if (!validationErrors) {
      setEventMessage({
        type: "failed",
        message: "Failed to save tag",
      });

      return;
    }

    Object.entries(validationErrors).forEach(([field, messages]) => {
      const message = messages?.[0];

      if (!message) return;

      setError(field as keyof TagSchema, {
        type: "server",
        message,
      });
    });
  };

  const onSubmit = (formData: TagSchema) => {
    const mutationOptions = {
      onSuccess: () => {
        setEventMessage({
          type: "success",
          message: formState.mode === "create" ? "Tag created successfully" : "Tag updated successfully",
        });

        handleCloseForm();
      },

      onError: handleValidationError,
    };

    if (formState.mode === "edit") {
      if (!selectedTag) return;

      updateMutation.mutate(
        {
          slug: selectedTag.slug,
          payload: formData,
        },
        mutationOptions,
      );

      return;
    }

    createMutation.mutate(formData, mutationOptions);
  };

  const handleDelete = () => {
    if (slugToDelete === null) return;

    deleteMutation.mutate(slugToDelete, {
      onSuccess: () => {
        setSlugToDelete(null);

        setEventMessage({
          type: "success",
          message: "Tag deleted successfully",
        });
      },

      onError: (error) => {
        console.error(error);
        setSlugToDelete(null);

        setEventMessage({
          type: "failed",
          message: "Failed to delete tag",
        });
      },
    });
  };

  return (
    <CrudLayout kind="tags" onCreate={handleOpenCreate} data={tags?.data ?? []}>
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

      {!isLoading && tags?.data.length === 0 && (
        <EmptyContent
          title="No tags yet"
          description="Create the first tag to populate this index."
          action={<CreateButton label="Create Tag" onCreate={handleOpenCreate} />}
        />
      )}

      {!isLoading && tags?.data && tags.data.length > 0 && (
        <GridLayout>
          {tags.data.map((tag) => (
            <EntityCard
              key={tag.id}
              eyebrow="Tag"
              title={tag.name}
              description={tag.description ?? "No description"}
              actions={
                <div className="flex w-full justify-end gap-2">
                  <Button size="sm" onClick={() => handleOpenEdit(tag)}>
                    Edit
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => setSlugToDelete(tag.slug)}>
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
        </GridLayout>
      )}

      <Modal
        open={formState.open}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm();
            return;
          }

          setFormState((previous) => ({
            ...previous,
            open,
          }));
        }}
        title={formState.mode === "create" ? "Create Tag" : "Edit Tag"}
        size="md"
        footer={
          <div className="flex w-full justify-between">
            <Button onClick={handleCloseForm} disabled={isMutating}>
              Cancel
            </Button>

            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isMutating}>
              Save {formState.mode === "create" ? "Tag" : "Changes"}
            </Button>
          </div>
        }
      >
        <div className="flex w-full flex-col gap-3">
          <Input
            id="slug"
            type="text"
            label="Slug"
            placeholder="tag-name"
            errorMessage={errors.slug?.message}
            prefixIcon={{
              icon: Link,
            }}
            {...slugRegistration}
            onChange={(event) => {
              slugManuallyEdited.current = true;
              slugRegistration.onChange(event);
            }}
          />

          <Input
            required
            id="name"
            type="text"
            label="Name"
            placeholder="Tag name"
            errorMessage={errors.name?.message}
            prefixIcon={{
              icon: TagIcon,
            }}
            {...register("name")}
          />

          <Input
            id="description"
            type="text"
            label="Description"
            placeholder="Tag description"
            errorMessage={errors.description?.message}
            prefixIcon={{
              icon: FileText,
            }}
            {...register("description")}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={slugToDelete !== null}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
        confirmText="Yes, Delete"
        loading={deleteMutation.isPending}
        onClose={() => setSlugToDelete(null)}
        onConfirm={handleDelete}
      />
    </CrudLayout>
  );
}
