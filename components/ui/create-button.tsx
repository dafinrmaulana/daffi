import { Plus } from "lucide-react";

type Props = {
  onCreate?: () => void;
  label: string;
};

export default function CreateButton({ onCreate, label }: Props) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center gap-2 border border-fg bg-fg px-4 py-3 text-sm text-bg"
    >
      <Plus size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
