"use client";

import { AxiosError } from "axios";
import { FileText, Link, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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
import type { SkillSchema } from "@/lib/form/skill-schema";
import { normalizeSlug } from "@/lib/slug";
import { useCreateSkill } from "@/lib/services/skills/create-skill";
import { useDeleteSkill } from "@/lib/services/skills/delete-skill";
import { useGetSkills } from "@/lib/services/skills/get-skills";
import { useUpdateSkill } from "@/lib/services/skills/update-skill";
import type { Skill } from "@/prisma/generated/prisma/client";
import type { EventMessage, FormModalState } from "@/types/admin";
import type { ValidationErrorResponse } from "@/types/api";

export default function SkillsClientPage() {
  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill();
  const deleteSkillMutation = useDeleteSkill();

  const { data: skills, isLoading } = useGetSkills();

  const [formModal, setFormModal] = useState<FormModalState>({
    open: false,
    mode: "create",
  });

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [skillSlugToDelete, setSkillSlugToDelete] = useState<string | null>(null);

  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);
  const slugManuallyEdited = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<SkillSchema>({
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

  const isFormSubmitting = createSkillMutation.isPending || updateSkillMutation.isPending;

  const handleOpenCreate = () => {
    clearErrors();
    slugManuallyEdited.current = false;

    reset({
      name: "",
      slug: "",
      description: "",
    });

    setSelectedSkill(null);

    setFormModal({
      open: true,
      mode: "create",
    });
  };

  const handleOpenEdit = (skill: Skill) => {
    clearErrors();
    slugManuallyEdited.current = true;

    reset({
      name: skill.name,
      slug: skill.slug,
      description: skill.description ?? "",
    });

    setSelectedSkill(skill);

    setFormModal({
      open: true,
      mode: "edit",
    });
  };

  const handleCloseForm = () => {
    reset({
      name: "",
      slug: "",
      description: "",
    });

    clearErrors();
    setSelectedSkill(null);

    setFormModal((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const handleValidationError = (error: unknown) => {
    const axiosError = error as AxiosError<ValidationErrorResponse<keyof SkillSchema>>;

    const responseData = axiosError.response?.data;

    const validationErrors = responseData?.errors;

    if (!validationErrors) {
      setEventMessage({
        type: "failed",
        message: responseData?.message ?? "Failed to save skill",
      });

      return;
    }

    Object.entries(validationErrors).forEach(([field, messages]) => {
      const message = messages?.[0];

      if (!message) {
        return;
      }

      setError(field as keyof SkillSchema, {
        type: "server",
        message,
      });
    });
  };

  const onSubmit = (formData: SkillSchema) => {
    if (formModal.mode === "edit" && selectedSkill) {
      updateSkillMutation.mutate(
        {
          slug: selectedSkill.slug,
          payload: formData,
        },
        {
          onSuccess: () => {
            setEventMessage({
              type: "success",
              message: "Skill updated successfully",
            });

            handleCloseForm();
          },
          onError: handleValidationError,
        },
      );

      return;
    }

    createSkillMutation.mutate(formData, {
      onSuccess: () => {
        setEventMessage({
          type: "success",
          message: "Skill created successfully",
        });

        handleCloseForm();
      },
      onError: handleValidationError,
    });
  };

  const handleDelete = () => {
    if (skillSlugToDelete === null) {
      return;
    }

    deleteSkillMutation.mutate(skillSlugToDelete, {
      onSuccess: () => {
        setSkillSlugToDelete(null);

        setEventMessage({
          type: "success",
          message: "Skill deleted successfully",
        });
      },

      onError: (error) => {
        setSkillSlugToDelete(null);

        setEventMessage({
          type: "failed",
          message: error.response?.data.message ?? "Failed to delete skill",
        });
      },
    });
  };

  return (
    <CrudLayout kind="skills" data={skills?.data ?? []} onCreate={handleOpenCreate}>
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

      {!isLoading && skills?.data.length === 0 && (
        <EmptyContent
          title="No skills yet"
          description="Create the first skill to populate this index."
          action={<CreateButton label="Create Skill" onCreate={handleOpenCreate} />}
        />
      )}

      {!isLoading && skills?.data && skills.data.length > 0 && (
        <GridLayout>
          {skills.data.map((skill) => (
            <EntityCard
              key={skill.id}
              eyebrow="Skill"
              title={skill.name}
              description={skill.description ?? "No description"}
              actions={
                <div className="flex w-full justify-end gap-2">
                  <Button size="sm" onClick={() => handleOpenEdit(skill)}>
                    Edit
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => setSkillSlugToDelete(skill.slug)}>
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
        </GridLayout>
      )}

      <Modal
        open={formModal.open}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm();
            return;
          }

          setFormModal((previous) => ({
            ...previous,
            open,
          }));
        }}
        title={formModal.mode === "create" ? "Create Skill" : "Edit Skill"}
        size="md"
        footer={
          <div className="flex w-full justify-between gap-3">
            <Button disabled={isFormSubmitting} onClick={handleCloseForm}>
              Cancel
            </Button>

            <Button variant="primary" loading={isFormSubmitting} onClick={handleSubmit(onSubmit)}>
              {formModal.mode === "create" ? "Create Skill" : "Save Changes"}
            </Button>
          </div>
        }
      >
        <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <Input
            required
            id="name"
            type="text"
            label="Name"
            placeholder="Skill name"
            errorMessage={errors.name?.message}
            prefixIcon={{
              icon: Wrench,
            }}
            {...register("name")}
          />

          <Input
            id="slug"
            type="text"
            label="Slug"
            placeholder="skill-name"
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
            id="description"
            type="text"
            label="Description"
            placeholder="Skill description"
            errorMessage={errors.description?.message}
            prefixIcon={{
              icon: FileText,
            }}
            {...register("description")}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={skillSlugToDelete !== null}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone."
        confirmText="Yes, Delete"
        loading={deleteSkillMutation.isPending}
        onClose={() => setSkillSlugToDelete(null)}
        onConfirm={handleDelete}
      />
    </CrudLayout>
  );
}
