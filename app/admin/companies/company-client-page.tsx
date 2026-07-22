"use client";

import { AxiosError } from "axios";
import { Building2, FileText, ImageIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import type { CompanySchema } from "@/lib/form/company-schema";
import { useCreateCompany } from "@/lib/services/companies/create-company";
import { useDeleteCompany } from "@/lib/services/companies/delete-company";
import { useGetCompanies } from "@/lib/services/companies/get-companies";
import { useUpdateCompany } from "@/lib/services/companies/update-company";
import type { Company } from "@/prisma/generated/prisma/client";

type FormModalState = {
  open: boolean;
  mode: "create" | "edit";
};

type EventMessage = {
  type: "success" | "failed";
  message: string;
};

type CompanyValidationErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof CompanySchema, string[]>>;
};

export default function CompaniesClientPage() {
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  const { data: companies, isLoading } = useGetCompanies();

  const [formModal, setFormModal] = useState<FormModalState>({
    open: false,
    mode: "create",
  });

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyIdToDelete, setCompanyIdToDelete] = useState<number | null>(null);
  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CompanySchema>({
    defaultValues: {
      name: "",
      description: "",
      companyLogo: "",
    },
  });

  const isFormSubmitting = createCompanyMutation.isPending || updateCompanyMutation.isPending;

  const handleOpenCreate = () => {
    clearErrors();

    reset({
      name: "",
      description: "",
      companyLogo: "",
    });

    setSelectedCompany(null);

    setFormModal({
      open: true,
      mode: "create",
    });
  };

  const handleOpenEdit = (company: Company) => {
    clearErrors();

    reset({
      name: company.name,
      description: company.description ?? "",
      companyLogo: company.companyLogo ?? "",
    });

    setSelectedCompany(company);

    setFormModal({
      open: true,
      mode: "edit",
    });
  };

  const handleCloseForm = () => {
    reset({
      name: "",
      description: "",
      companyLogo: "",
    });

    clearErrors();
    setSelectedCompany(null);

    setFormModal((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const handleValidationError = (error: unknown) => {
    const axiosError = error as AxiosError<CompanyValidationErrorResponse>;
    const responseData = axiosError.response?.data;
    const validationErrors = responseData?.errors;

    if (!validationErrors) {
      setEventMessage({
        type: "failed",
        message: responseData?.message ?? "Failed to save company",
      });

      return;
    }

    Object.entries(validationErrors).forEach(([field, messages]) => {
      const message = messages?.[0];

      if (!message) {
        return;
      }

      setError(field as keyof CompanySchema, {
        type: "server",
        message,
      });
    });
  };

  const onSubmit = (formData: CompanySchema) => {
    if (formModal.mode === "edit" && selectedCompany) {
      updateCompanyMutation.mutate(
        {
          id: selectedCompany.id,
          payload: formData,
        },
        {
          onSuccess: () => {
            setEventMessage({
              type: "success",
              message: "Company updated successfully",
            });

            handleCloseForm();
          },
          onError: handleValidationError,
        },
      );

      return;
    }

    createCompanyMutation.mutate(formData, {
      onSuccess: () => {
        setEventMessage({
          type: "success",
          message: "Company created successfully",
        });

        handleCloseForm();
      },
      onError: handleValidationError,
    });
  };

  const handleDelete = () => {
    if (companyIdToDelete === null) {
      return;
    }

    deleteCompanyMutation.mutate(companyIdToDelete, {
      onSuccess: () => {
        setCompanyIdToDelete(null);

        setEventMessage({
          type: "success",
          message: "Company deleted successfully",
        });
      },

      onError: (error) => {
        setCompanyIdToDelete(null);

        setEventMessage({
          type: "failed",
          message: error.response?.data.message ?? "Failed to delete company",
        });
      },
    });
  };

  return (
    <CrudLayout kind="companies" data={companies?.data ?? []} onCreate={handleOpenCreate}>
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
          {Array.from({
            length: 10,
          }).map((_, index) => (
            <EntityCard key={index} loading title="" />
          ))}
        </GridLayout>
      )}

      {!isLoading && companies?.data.length === 0 && (
        <EmptyContent
          title="No companies yet"
          description="Create the first company to populate this index."
          action={<CreateButton label="Create Company" onCreate={handleOpenCreate} />}
        />
      )}

      {!isLoading && companies?.data && companies.data.length > 0 && (
        <GridLayout>
          {companies.data.map((company) => (
            <EntityCard
              key={company.id}
              eyebrow="Company"
              title={company.name}
              description={company.description ?? "No description"}
              actions={
                <div className="flex w-full justify-end gap-2">
                  <Button size="sm" onClick={() => handleOpenEdit(company)}>
                    Edit
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => setCompanyIdToDelete(company.id)}>
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
        title={formModal.mode === "create" ? "Create Company" : "Edit Company"}
        size="md"
        footer={
          <div className="flex w-full justify-between gap-3">
            <Button disabled={isFormSubmitting} onClick={handleCloseForm}>
              Cancel
            </Button>

            <Button variant="primary" loading={isFormSubmitting} onClick={handleSubmit(onSubmit)}>
              {formModal.mode === "create" ? "Create Company" : "Save Changes"}
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
            placeholder="Company name"
            errorMessage={errors.name?.message}
            prefixIcon={{
              icon: Building2,
            }}
            {...register("name")}
          />

          <Input
            id="description"
            type="text"
            label="Description"
            placeholder="Company description"
            errorMessage={errors.description?.message}
            prefixIcon={{
              icon: FileText,
            }}
            {...register("description")}
          />

          <Input
            id="companyLogo"
            type="text"
            label="Company Logo"
            placeholder="https://example.com/logo.png"
            errorMessage={errors.companyLogo?.message}
            prefixIcon={{
              icon: ImageIcon,
            }}
            {...register("companyLogo")}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={companyIdToDelete !== null}
        title="Delete Company"
        description="Are you sure you want to delete this company? This action cannot be undone."
        confirmText="Yes, Delete"
        loading={deleteCompanyMutation.isPending}
        onClose={() => setCompanyIdToDelete(null)}
        onConfirm={handleDelete}
      />
    </CrudLayout>
  );
}
