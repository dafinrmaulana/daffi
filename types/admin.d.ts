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
