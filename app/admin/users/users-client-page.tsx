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
import type { PublicUser } from "@/lib/auth/user-dto";
import {
  useAdminPagination,
  useAdminPaginationBounds,
} from "@/lib/hooks/use-admin-pagination";
import { useCreateUser } from "@/lib/services/users/create-user";
import { useDeleteUser } from "@/lib/services/users/delete-user";
import { useGetUsers } from "@/lib/services/users/get-users";
import { useUpdateUser } from "@/lib/services/users/update-user";
import type { EventMessage, OptionalModeFormModalState } from "@/types/admin";
import type { ValidationErrorResponse } from "@/types/api";
import { AxiosError } from "axios";
import { Eye, EyeOff, LockKeyhole, Mail, User, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type UserFormValues = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export default function UsersClientPage() {
  const pagination = useAdminPagination();
  const router = useRouter();
  const formMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();

  const [usernameToDelete, setUsernameToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<OptionalModeFormModalState | null>(null);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { data: users, isLoading, isFetching } = useGetUsers({
    page: pagination.page,
    limit: pagination.limit,
  });

  useAdminPaginationBounds({
    page: pagination.page,
    meta: users?.meta,
    replacePage: pagination.replacePage,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const isMutating = formMutation.isPending || updateMutation.isPending;

  const handleOpenCreate = () => {
    reset({
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    });
    setShowPassword(false);
    setShowPasswordConfirmation(false);
    setSelectedUser(null);
    setIsFormOpen({ open: true, mode: "create" });
  };

  const handleOpenEdit = (user: PublicUser) => {
    reset({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      passwordConfirmation: "",
    });

    setShowPassword(false);
    setShowPasswordConfirmation(false);
    setSelectedUser(user);
    setIsFormOpen({ open: true, mode: "edit" });
  };

  const handleMutationError = (err: unknown) => {
    const error = err as AxiosError<
      ValidationErrorResponse<keyof UserFormValues>
    >;
    const validationErrors = error.response?.data.errors;

    if (!validationErrors) {
      setEventMessage({
        type: "failed",
        message:
          error.response?.data.message ??
          "Failed to save User.",
      });
      return;
    }

    Object.entries(validationErrors).forEach(([field, messages]) => {
      const message = (messages as string[] | undefined)?.[0];

      if (!message) return;

      setError(field as keyof UserFormValues, {
        type: "server",
        message,
      });
    });
  };

  const closeFormAfterSuccess = (message: string) => {
    setEventMessage({
      type: "success",
      message,
    });
    reset();
    setSelectedUser(null);
    setIsFormOpen({
      open: false,
      mode: "create",
    });
  };

  const onSubmit = (formData: UserFormValues) => {
    if (isFormOpen?.mode === "edit") {
      if (!selectedUser) return;

      updateMutation.mutate(
        {
          username: selectedUser.username,
          payload: formData,
        },
        {
          onSuccess: (response) => {
            if (response.sessionRevoked) {
              router.replace("/login");
              router.refresh();
              return;
            }

            closeFormAfterSuccess("User updated successfully");
          },
          onError: handleMutationError,
        },
      );
      return;
    }

    formMutation.mutate(formData, {
      onSuccess: () => {
        closeFormAfterSuccess("User created successfully");
      },
      onError: handleMutationError,
    });
  };

  const handleCancel = () => {
    reset();
    setSelectedUser(null);

    setIsFormOpen((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const isCreateMode = isFormOpen?.mode === "create";

  return (
    <CrudLayout
      kind="users"
      onCreate={handleOpenCreate}
      data={users?.data ?? []}
      total={users?.meta.total}
    >
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
                  <Button size="sm" variant="outline" onClick={() => setUsernameToDelete(user.username)}>
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

      {users?.meta && (
        <AdminPagination
          meta={users.meta}
          disabled={pagination.isNavigating || isFetching}
          onPageChange={pagination.setPage}
          onLimitChange={pagination.setLimit}
        />
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
          <Input
            required={isCreateMode}
            label={isCreateMode ? "Password" : "Password (optional)"}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={
              isCreateMode
                ? "At least 15 characters"
                : "Leave blank to keep current password"
            }
            errorMessage={errors.password?.message}
            prefixIcon={{ icon: LockKeyhole }}
            suffix={
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="mr-1 border-0 hover:bg-transparent"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                onClick={() =>
                  setShowPassword((visible) => !visible)
                }
              >
                {showPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </Button>
            }
            {...register("password", {
              validate: (value) => {
                if (isCreateMode && !value) {
                  return "Password is required.";
                }
                if (value && value.length < 15) {
                  return "Password must be at least 15 characters.";
                }
                if (value.length > 128) {
                  return "Password may not be greater than 128 characters.";
                }
                return true;
              },
            })}
          />
          <Input
            required={isCreateMode}
            label={
              isCreateMode
                ? "Confirm Password"
                : "Confirm Password (optional)"
            }
            id="passwordConfirmation"
            type={showPasswordConfirmation ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat the password"
            errorMessage={errors.passwordConfirmation?.message}
            prefixIcon={{ icon: LockKeyhole }}
            suffix={
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="mr-1 border-0 hover:bg-transparent"
                aria-label={
                  showPasswordConfirmation
                    ? "Hide password confirmation"
                    : "Show password confirmation"
                }
                aria-pressed={showPasswordConfirmation}
                onClick={() =>
                  setShowPasswordConfirmation((visible) => !visible)
                }
              >
                {showPasswordConfirmation ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </Button>
            }
            {...register("passwordConfirmation", {
              validate: (value, values) => {
                if (isCreateMode && !value) {
                  return "Password confirmation is required.";
                }
                if (
                  (values.password || value) &&
                  values.password !== value
                ) {
                  return "Password confirmation does not match.";
                }
                return true;
              },
            })}
          />
          {!isCreateMode && (
            <p className="font-mono text-[11px] leading-relaxed text-muted">
              Leave both Password fields blank to preserve the current
              password.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={usernameToDelete !== null}
        title="Delete User"
        description="Are you sure want to delete this user? This action cannot be undone"
        confirmText="Yes, Delete"
        onClose={() => setUsernameToDelete(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (usernameToDelete === null) return;
          deleteMutation.mutate(usernameToDelete, {
            onSuccess: () => {
              setUsernameToDelete(null);
              setEventMessage({
                type: "success",
                message: "User deleted successfully",
              });
            },

            onError: (error) => {
              setUsernameToDelete(null);
              setEventMessage({
                type: "failed",
                message:
                  (
                    error as AxiosError<{ message: string }>
                  ).response?.data.message ??
                  "Failed to delete User",
              });
            },
          });
        }}
      />
    </CrudLayout>
  );
}
