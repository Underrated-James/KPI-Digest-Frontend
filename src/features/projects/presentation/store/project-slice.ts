import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { FormMode } from "@/lib/form-mode";
import { Project } from "../../domain/types/project-types";

interface DeleteTarget {
  id?: string;
  name: string;
}

export interface ProjectUiState {
  isFormOpen: boolean;
  editingProject: Project | null;
  formMode: FormMode;
  deleteTarget: DeleteTarget | null;
  selectedProjectIds: string[];
}

const initialState: ProjectUiState = {
  isFormOpen: false,
  editingProject: null,
  formMode: "create",
  deleteTarget: null,
  selectedProjectIds: [],
};

const projectUiSlice = createSlice({
  name: "projectUi",
  initialState,
  reducers: {
    openCreateProjectForm: (state) => {
      state.isFormOpen = true;
      state.editingProject = null;
      state.formMode = "create";
    },
    openEditProjectForm: (state, action: PayloadAction<Project>) => {
      state.isFormOpen = true;
      state.editingProject = action.payload;
      state.formMode = "edit";
    },
    openViewProjectForm: (state, action: PayloadAction<Project>) => {
      state.isFormOpen = true;
      state.editingProject = action.payload;
      state.formMode = "view";
    },
    closeProjectForm: (state) => {
      state.isFormOpen = false;
      state.editingProject = null;
      state.formMode = "create";
    },
    openDeleteProjectModal: (state, action: PayloadAction<DeleteTarget>) => {
      state.deleteTarget = action.payload;
    },
    closeDeleteProjectModal: (state) => {
      state.deleteTarget = null;
    },
    setSelectedProjectIds: (state, action: PayloadAction<string[]>) => {
      state.selectedProjectIds = action.payload;
    },
    clearSelectedProjectIds: (state) => {
      state.selectedProjectIds = [];
    },
  },
});

export const {
  openCreateProjectForm,
  openEditProjectForm,
  openViewProjectForm,
  closeProjectForm,
  openDeleteProjectModal,
  closeDeleteProjectModal,
  setSelectedProjectIds,
  clearSelectedProjectIds,
} = projectUiSlice.actions;

export const selectProjectUi = (state: RootState) => state.projectUi;
export const selectIsProjectFormOpen = (state: RootState) =>
  state.projectUi.isFormOpen;
export const selectEditingProject = (state: RootState) =>
  state.projectUi.editingProject;
export const selectProjectFormMode = (state: RootState) =>
  state.projectUi.formMode;
export const selectDeleteTarget = (state: RootState) =>
  state.projectUi.deleteTarget;
export const selectSelectedProjectIds = (state: RootState) =>
  state.projectUi.selectedProjectIds;

export const projectUiReducer = projectUiSlice.reducer;
