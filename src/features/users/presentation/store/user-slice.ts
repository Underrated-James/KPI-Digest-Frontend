import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../domain/types/user-types";

interface DeleteTarget {
  id?: string;
  name: string;
}

export interface UserUiState {
  isFormOpen: boolean;
  editingUser: User | null;
  deleteTarget: DeleteTarget | null;
  selectedUserIds: string[];
}

const initialState: UserUiState = {
  isFormOpen: false,
  editingUser: null,
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
    },
    openEditUserForm: (state, action: PayloadAction<User>) => {
      state.isFormOpen = true;
      state.editingUser = action.payload;
    },
    closeUserForm: (state) => {
      state.isFormOpen = false;
      state.editingUser = null;
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

type UserUiRootState = {
  userUi: UserUiState;
};

export const {
  openCreateUserForm,
  openEditUserForm,
  closeUserForm,
  openDeleteUserModal,
  closeDeleteUserModal,
  setSelectedUserIds,
  clearSelectedUserIds,
} = userUiSlice.actions;

export const selectUserUi = (state: UserUiRootState) => state.userUi;
export const selectIsUserFormOpen = (state: UserUiRootState) =>
  state.userUi.isFormOpen;
export const selectEditingUser = (state: UserUiRootState) =>
  state.userUi.editingUser;
export const selectDeleteTarget = (state: UserUiRootState) =>
  state.userUi.deleteTarget;
export const selectSelectedUserIds = (state: UserUiRootState) =>
  state.userUi.selectedUserIds;

export const userUiReducer = userUiSlice.reducer;
