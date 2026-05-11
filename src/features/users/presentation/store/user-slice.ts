import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { FormMode } from "@/lib/form-mode";
import { User } from "../../domain/types/user-types";

interface DeleteTarget {
  id?: string;
  name: string;
}

export interface UserUiState {
  isFormOpen: boolean;
  editingUser: User | null;
  formMode: FormMode;
  deleteTarget: DeleteTarget | null;
  selectedUserIds: string[];
}

const initialState: UserUiState = {
  isFormOpen: false,
  editingUser: null,
  formMode: "create",
  deleteTarget: null,
  selectedUserIds: [],
};

const userUiSlice = createSlice({
  name: "userUi",
  initialState,
  reducers: {
    openCreateUserForm: (state) => {
      state.isFormOpen = true;
      state.editingUser = null;
      state.formMode = "create";
    },
    openEditUserForm: (state, action: PayloadAction<User>) => {
      state.isFormOpen = true;
      state.editingUser = action.payload;
      state.formMode = "edit";
    },
    openViewUserForm: (state, action: PayloadAction<User>) => {
      state.isFormOpen = true;
      state.editingUser = action.payload;
      state.formMode = "view";
    },
    closeUserForm: (state) => {
      state.isFormOpen = false;
      state.editingUser = null;
      state.formMode = "create";
    },
    openDeleteUserModal: (state, action: PayloadAction<DeleteTarget>) => {
      state.deleteTarget = action.payload;
    },
    closeDeleteUserModal: (state) => {
      state.deleteTarget = null;
    },
    setSelectedUserIds: (state, action: PayloadAction<string[]>) => {
      state.selectedUserIds = action.payload;
    },
    clearSelectedUserIds: (state) => {
      state.selectedUserIds = [];
    },
  },
});

export const {
  openCreateUserForm,
  openEditUserForm,
  openViewUserForm,
  closeUserForm,
  openDeleteUserModal,
  closeDeleteUserModal,
  setSelectedUserIds,
  clearSelectedUserIds,
} = userUiSlice.actions;

export const selectUserUi = (state: RootState) => state.userUi;
export const selectIsUserFormOpen = (state: RootState) =>
  state.userUi.isFormOpen;
export const selectEditingUser = (state: RootState) =>
  state.userUi.editingUser;
export const selectUserFormMode = (state: RootState) =>
  state.userUi.formMode;
export const selectDeleteTarget = (state: RootState) =>
  state.userUi.deleteTarget;
export const selectSelectedUserIds = (state: RootState) =>
  state.userUi.selectedUserIds;

export const userUiReducer = userUiSlice.reducer;
