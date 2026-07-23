"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import Input from "@/components/form/input";
import { Button } from "@/components/ui/button";
import type { ProjectSchema } from "@/lib/form/project-schema";

type Props = {
  control: Control<ProjectSchema>;
  register: UseFormRegister<ProjectSchema>;
  errors?: FieldErrors<ProjectSchema>["metrics"];
  disabled?: boolean;
};

export function ProjectMetricsFields({ control, register, errors, disabled }: Props) {
  const { fields, append, remove, move } = useFieldArray({ control, name: "metrics" });
  const topLevelError = errors && "message" in errors && typeof errors.message === "string" ? errors.message : undefined;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em]">Metrics</p>
          <p className="mt-1 text-sm text-muted">Optional key outcomes displayed on the Project detail page.</p>
        </div>
        <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => append({ label: "", value: "" })}>
          <Plus size={14} /> Add Metric
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="mt-3 border border-dashed border-border p-5 text-sm text-muted">
          No detail metrics. Add one when the Project has a measurable outcome.
        </div>
      )}

      <div className="mt-3 space-y-3">
        {fields.map((field, index) => {
          const rowError = Array.isArray(errors) ? errors[index] : undefined;
          return (
            <div key={field.id} className="grid gap-3 border border-border p-4 lg:grid-cols-[1fr_1fr_auto]">
              <Input
                id={`metrics-${index}-label`}
                label="Label"
                placeholder="Performance"
                disabled={disabled}
                errorMessage={rowError?.label?.message}
                {...register(`metrics.${index}.label`)}
              />
              <Input
                id={`metrics-${index}-value`}
                label="Value"
                placeholder="40% faster"
                disabled={disabled}
                errorMessage={rowError?.value?.message}
                {...register(`metrics.${index}.value`)}
              />
              <div className="flex items-end gap-1">
                <Button type="button" size="icon" variant="secondary" aria-label={`Move metric ${index + 1} up`} disabled={disabled || index === 0} onClick={() => move(index, index - 1)}>
                  <ArrowUp size={14} />
                </Button>
                <Button type="button" size="icon" variant="secondary" aria-label={`Move metric ${index + 1} down`} disabled={disabled || index === fields.length - 1} onClick={() => move(index, index + 1)}>
                  <ArrowDown size={14} />
                </Button>
                <Button type="button" size="icon" variant="secondary" aria-label={`Remove metric ${index + 1}`} disabled={disabled} onClick={() => remove(index)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {topLevelError && <p className="mt-1 text-xs text-red-500">{topLevelError}</p>}
    </section>
  );
}
