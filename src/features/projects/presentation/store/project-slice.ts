import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../../domain/types/project-types";

interface DeleteTarget {
  id?: string;
  name: string;
}

export interface ProjectUiState {
  isFormOpen: boolean;
  editingProject: Project | null;
  deleteTarget: DeleteTarget | null;
  selectedProjectIds: string[];
}

const initialState: ProjectUiState = {
  isFormOpen: false,
  editingProject: null,
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
    },
    openEditProjectForm: (state, action: PayloadAction<Project>) => {
      state.isFormOpen = true;
      state.editingProject = action.payload;
    },
    closeProjectForm: (state) => {
      state.isFormOpen = false;
      state.editingProject = null;
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

type ProjectUiRootState = {
  projectUi: ProjectUiState;
};

export const {
  openCreateProjectForm,
  openEditProjectForm,
  closeProjectForm,
  openDeleteProjectModal,
  closeDeleteProjectModal,
  setSelectedProjectIds,
  clearSelectedProjectIds,
} = projectUiSlice.actions;

export const selectProjectUi = (state: ProjectUiRootState) => state.projectUi;
export const selectIsProjectFormOpen = (state: ProjectUiRootState) =>
  state.projectUi.isFormOpen;
export const selectEditingProject = (state: ProjectUiRootState) =>
  state.projectUi.editingProject;
export const selectDeleteTarget = (state: ProjectUiRootState) =>
  state.projectUi.deleteTarget;
export const selectSelectedProjectIds = (state: ProjectUiRootState) =>
  state.projectUi.selectedProjectIds;

export const projectUiReducer = projectUiSlice.reducer;
