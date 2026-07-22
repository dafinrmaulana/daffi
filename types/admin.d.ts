export type FormMode = "create" | "edit";

export type FormModalState = {
  open: boolean;
  mode: FormMode;
};

export type OptionalModeFormModalState = {
  open: boolean;
  mode?: FormMode;
};

export type EventMessage = {
  type: "success" | "failed";
  message: string;
};

export type ComplexEntityKind = "projects" | "posts";

export type ComplexFieldType =
  | "text"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "checkbox"
  | "select"
  | "checkboxGroup";

export type ComplexField = {
  name: string;
  label: string;
  type: ComplexFieldType;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};

export type ComplexRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
  values: Record<string, string | boolean | string[]>;
};

export type ComplexEntityConfig = {
  title: string;
  singular: string;
  eyebrow: string;
  indexHref: string;
  fields: ComplexField[];
  records: ComplexRecord[];
};
