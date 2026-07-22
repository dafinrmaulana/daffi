"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { simpleEntityConfigs, type SimpleEntityKind } from "@/lib/constants/simple-entities";
import CreateButton from "../ui/create-button";

type Props<Data> = {
  kind: SimpleEntityKind;
  data?: Data[];
  children: React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
};

export function CrudLayout<Data>({ kind, data = [], children, onCreate, createLabel }: Props<Data>) {
  const config = simpleEntityConfigs[kind];

  return (
    <>
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        count={data.length}
        action={<CreateButton label={createLabel ?? `Create ${config.singular}`} onCreate={onCreate} />}
      />
      {children}
    </>
  );
}
