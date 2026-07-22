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
import { UserSchema } from "@/lib/form/user-schema";
import { useCreateUser } from "@/lib/services/users/create-user";
import { useDeleteUser } from "@/lib/services/users/delete-user";
import { useGetUsers } from "@/lib/services/users/get-users";
import { useUpdateUser } from "@/lib/services/users/update-user";
import { AxiosError } from "axios";
import { Mail, User, UserCog } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type ModalFormState = {
  open: boolean;
  mode?: "create" | "edit";
};

// Bentuk data user dari API — sesuaikan kalau shape aslinya beda
type UserData = UserSchema & { id: number };

export default function UsersClientPage() {
  const formMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();

  const [dataToDelete, setDataToDelete] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<ModalFormState | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [eventMessage, setEventMessage] = useState<{
    type: "success" | "failed";
    message: string;
  } | null>(null);

  const { data: users, isLoading } = useGetUsers();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserSchema>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
    },
  });

  const isMutating = formMutation.isPending || updateMutation.isPending;

  const handleOpenCreate = () => {
    reset({ name: "", username: "", email: "" });
    setSelectedUser(null);
    setIsFormOpen({ open: true, mode: "create" });
  };

  const handleOpenEdit = (user: UserData) => {
    reset({
      name: user.name,
      username: user.username,
      email: user.email,
    });

    setSelectedUser(user);
    setIsFormOpen({ open: true, mode: "edit" });
  };

  const onSubmit = (formData: UserSchema) => {
    const onSettled = {
      onSuccess: () => {
        setEventMessage({
          type: "success",
          message: isFormOpen?.mode === "create" ? "User created successfully" : "User updated successfully",
        });

        reset();
        setSelectedUser(null);
        setIsFormOpen({
          open: false,
          mode: "create",
        });
      },

      onError: (err: unknown) => {
        const error = err as AxiosError<{ errors: Record<string, string[]> }>;
        const validationErrors = error.response?.data.errors;
        if (!validationErrors) return;

        Object.entries(validationErrors).forEach(([field, messages]) => {
          const message = (messages as string[] | undefined)?.[0];

          if (!message) return;

          setError(field as keyof UserSchema, {
            type: "server",
            message,
          });
        });
      },
    };

    if (isFormOpen?.mode === "edit") {
      if (!selectedUser) return;

      updateMutation.mutate({ id: String(selectedUser.id), payload: formData }, onSettled);
      return;
    }

    formMutation.mutate(formData, onSettled);
  };

  const handleCancel = () => {
    reset();
    setSelectedUser(null);

    setIsFormOpen((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <CrudLayout kind="users" onCreate={handleOpenCreate} data={users?.data ?? []}>
      {eventMessage?.message && (
        <Alert
          className="mb-4"
          color={eventMessage?.type === "success" ? "success" : "error"}
          message={eventMessage?.message}
          onClose={() => setEventMessage(null)}
        />
      )}

      {!users?.data && isLoading && (
        <GridLayout>
          {Array.from({ length: 10 }).map((_, index) => (
            <EntityCard key={index} loading title="" />
          ))}
        </GridLayout>
      )}

      {!isLoading && users?.data?.length === 0 && (
        <EmptyContent
          title={`No users yet`}
          description={`Create the first User to populate this index.`}
          action={<CreateButton label="Create User" onCreate={handleOpenCreate} />}
        />
      )}

      {!isLoading && users?.data && users?.data?.length > 0 && (
        <GridLayout>
          {users?.data?.map((user, index) => (
            <EntityCard
              key={index}
              eyebrow={"Name"}
              title={user.name}
              actions={
                <div className="flex justify-end w-full gap-2">
                  <Button size="sm" onClick={() => handleOpenEdit(user)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDataToDelete(user.id)}>
                    Delete
                  </Button>
                </div>
              }
              meta={[
                {
                  label: "Email",
                  value: user.email,
                },
                {
                  label: "Username",
                  value: user.username,
                },
              ]}
            />
          ))}
        </GridLayout>
      )}

      <Modal
        open={isFormOpen?.open ?? false}
        onOpenChange={(open) =>
          setIsFormOpen((prev) => ({
            ...prev,
            open,
          }))
        }
        title={isFormOpen?.mode === "create" ? `Create User` : `Edit User`}
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button onClick={handleCancel} disabled={isMutating}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isMutating}>
              Save {isFormOpen?.mode === "create" ? "User" : "Changes"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 w-full">
          <Input
            required
            label="Name"
            id="name"
            type="text"
            placeholder="Full name"
            {...register("name")}
            errorMessage={errors.name?.message}
            prefixIcon={{
              icon: User,
            }}
          />
          <Input
            required
            label="Username"
            id="username"
            type="text"
            placeholder="Username"
            errorMessage={errors.username?.message}
            {...register("username")}
            prefixIcon={{
              icon: UserCog,
            }}
          />
          <Input
            required
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            errorMessage={errors.email?.message}
            {...register("email")}
            prefixIcon={{
              icon: Mail,
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!dataToDelete}
        title="Delete User"
        description="Are you sure want to delete this user? This action cannot be undone"
        confirmText="Yes, Delete"
        onClose={() => setDataToDelete(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!dataToDelete) return;
          deleteMutation.mutate(dataToDelete, {
            onSuccess: () => {
              setDataToDelete(null);
              setEventMessage({
                type: "success",
                message: "User deleted successfully",
              });
            },

            onError: (error) => {
              console.error(error);

              setDataToDelete(null);
              setEventMessage({
                type: "failed",
                message: "Failed to delete user",
              });
            },
          });
        }}
      />
    </CrudLayout>
  );
}
