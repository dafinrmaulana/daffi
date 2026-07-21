"use client";

import { EntityCard } from "@/components/admin/EntityCard";
import { Modal } from "@/components/admin/Modal";
import Input from "@/components/form/Input";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { Button } from "@/components/ui/Button";
import { Mail, User, UserCog } from "lucide-react";
import { useState } from "react";

type ModalFormState = {
  open: boolean;
  mode?: "create" | "edit";
};

export default function UsersClientPage() {
  const [isFormOpen, setIsFormOpen] = useState<ModalFormState | null>(null);

  return (
    <CrudLayout
      kind="users"
      onCreate={() => setIsFormOpen({ open: true, mode: "create" })}
      data={Array.from({ length: 10 })}
    >
      {/* <EmptyContent
        title={`No users yet`}
        description={`Create the first User to populate this index.`}
        action={<CreateButton label="Create User" onCreate={() => setIsFormOpen({ open: true, mode: "create" })} />}
      /> */}

      <EntityCard
        eyebrow={"Name"}
        title="Dafi"
        actions={
          <div className="flex justify-end w-full gap-2">
            <Button size="sm" onClick={() => setIsFormOpen({ open: true, mode: "edit" })}>
              Edit
            </Button>
            <Button size="sm" variant="outline">
              Delete
            </Button>
          </div>
        }
        meta={[
          {
            label: "Email",
            value: "dafinmaulana18@gmail.com",
          },
          {
            label: "Username",
            value: "dafinmaulana",
          },
        ]}
      />

      <Modal
        open={isFormOpen?.open ?? false}
        onOpenChange={(open) => setIsFormOpen({ open, mode: "create" })}
        title={isFormOpen?.mode === "create" ? `Create User` : `Edit User`}
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button onClick={() => setIsFormOpen({ open: false, mode: "create" })}>Cancel</Button>
            <Button variant="primary">Save {isFormOpen?.mode === "create" ? "User" : "Changes"}</Button>
          </div>
        }
      >
        <form action="" className="flex flex-col gap-3 w-full">
          <Input
            required
            label="Name"
            id="name"
            type="text"
            placeholder="Full name"
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
            prefixIcon={{
              icon: Mail,
            }}
          />
        </form>
      </Modal>
    </CrudLayout>
  );
}
