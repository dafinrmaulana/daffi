"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { simpleEntityConfigs, type SimpleEntityKind } from "@/lib/constants/simple-entities";
import CreateButton from "../ui/CreateButton";

type Props<Data> = {
  kind: SimpleEntityKind;
  data?: Data[];
  children: React.ReactNode;
  onCreate?: () => void;
};

export function CrudLayout<Data>({ kind, data = [], children, onCreate }: Props<Data>) {
  const config = simpleEntityConfigs[kind];

  return (
    <>
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        count={data.length}
        action={<CreateButton label={`Create ${config.singular}`} onCreate={onCreate} />}
      />
      {children}
    </>
  );
}
