import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Team } from "../../domain/types/team-types";

interface DeleteTarget {
  id?: string;
  name: string;
}

export interface TeamUiState {
  isFormOpen: boolean;
  editingTeam: Team | null;
  deleteTarget: DeleteTarget | null;
  selectedTeamIds: string[];
}

const initialState: TeamUiState = {
  isFormOpen: false,
  editingTeam: null,
  deleteTarget: null,
  selectedTeamIds: [],
};

const teamUiSlice = createSlice({
  name: "teamUi",
  initialState,
  reducers: {
    openCreateTeamForm: (state) => {
      state.isFormOpen = true;
      state.editingTeam = null;
    },
    openEditTeamForm: (state, action: PayloadAction<Team>) => {
      state.isFormOpen = true;
      state.editingTeam = action.payload;
    },
    closeTeamForm: (state) => {
      state.isFormOpen = false;
      state.editingTeam = null;
    },
    openDeleteTeamModal: (state, action: PayloadAction<DeleteTarget>) => {
      state.deleteTarget = action.payload;
    },
    closeDeleteTeamModal: (state) => {
      state.deleteTarget = null;
    },
    setSelectedTeamIds: (state, action: PayloadAction<string[]>) => {
      state.selectedTeamIds = action.payload;
    },
    clearSelectedTeamIds: (state) => {
      state.selectedTeamIds = [];
    },
  },
});

type TeamUiRootState = {
  teamUi: TeamUiState;
};

export const {
  openCreateTeamForm,
  openEditTeamForm,
  closeTeamForm,
  openDeleteTeamModal,
  closeDeleteTeamModal,
  setSelectedTeamIds,
  clearSelectedTeamIds,
} = teamUiSlice.actions;

export const selectTeamUi = (state: TeamUiRootState) => state.teamUi;
export const selectIsTeamFormOpen = (state: TeamUiRootState) =>
  state.teamUi.isFormOpen;
export const selectEditingTeam = (state: TeamUiRootState) =>
  state.teamUi.editingTeam;
export const selectDeleteTarget = (state: TeamUiRootState) =>
  state.teamUi.deleteTarget;
export const selectSelectedTeamIds = (state: TeamUiRootState) =>
  state.teamUi.selectedTeamIds;

export const teamUiReducer = teamUiSlice.reducer;
