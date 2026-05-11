export type FormMode = "create" | "edit" | "view";

export const isViewFormMode = (mode: FormMode) => mode === "view";
