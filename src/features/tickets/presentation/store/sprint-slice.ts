import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import { Sprint } from "../../domain/types/sprint-types";

interface DeleteTarget {
  id?: string;
  name: string;
}

export interface SprintUiState {
  isFormOpen: boolean;
  editingSprint: Sprint | null;
  deleteTarget: DeleteTarget | null;
  selectedSprintIds: string[];
}

const initialState: SprintUiState = {
  isFormOpen: false,
  editingSprint: null,
  deleteTarget: null,
  selectedSprintIds: [],
};

const sprintUiSlice = createSlice({
  name: "sprintUi",
  initialState,
  reducers: {
    openCreateSprintForm: (state) => {
      state.isFormOpen = true;
      state.editingSprint = null;
    },
    openEditSprintForm: (state, action: PayloadAction<Sprint>) => {
      state.isFormOpen = true;
      state.editingSprint = action.payload;
    },
    closeSprintForm: (state) => {
      state.isFormOpen = false;
      state.editingSprint = null;
    },
    openDeleteSprintModal: (state, action: PayloadAction<DeleteTarget>) => {
      state.deleteTarget = action.payload;
    },
    closeDeleteSprintModal: (state) => {
      state.deleteTarget = null;
    },
    setSelectedSprintIds: (state, action: PayloadAction<string[]>) => {
      state.selectedSprintIds = action.payload;
    },
    clearSelectedSprintIds: (state) => {
      state.selectedSprintIds = [];
    },
  },
});

export const {
  openCreateSprintForm,
  openEditSprintForm,
  closeSprintForm,
  openDeleteSprintModal,
  closeDeleteSprintModal,
  setSelectedSprintIds,
  clearSelectedSprintIds,
} = sprintUiSlice.actions;

export const selectSprintUi = (state: RootState) => state.sprintUi;
export const selectIsSprintFormOpen = (state: RootState) =>
  state.sprintUi.isFormOpen;
export const selectEditingSprint = (state: RootState) =>
  state.sprintUi.editingSprint;
export const selectDeleteTarget = (state: RootState) =>
  state.sprintUi.deleteTarget;
export const selectSelectedSprintIds = (state: RootState) =>
  state.sprintUi.selectedSprintIds;

export const sprintUiReducer = sprintUiSlice.reducer;
