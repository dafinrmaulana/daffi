import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onCreate?: () => void;
  label: string;
};

export default function CreateButton({ onCreate, label }: Props) {
  return (
    <Button
      type="button"
      variant="primary"
      onClick={onCreate}
    >
      <Plus size={16} aria-hidden="true" />
      {label}
    </Button>
  );
}
