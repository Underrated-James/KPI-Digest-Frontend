import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Ticket } from "../../domain/types/ticket-types";

interface DeleteTarget {
  id?: string;
  ticketNumber: string;
}

export interface TicketUiState {
  isFormOpen: boolean;
  editingTicket: Ticket | null;
  deleteTarget: DeleteTarget | null;
  selectedTicketIds: string[];
}

const initialState: TicketUiState = {
  isFormOpen: false,
  editingTicket: null,
  deleteTarget: null,
  selectedTicketIds: [],
};

const ticketUiSlice = createSlice({
  name: "ticketUi",
  initialState,
  reducers: {
    openCreateTicketForm: (state) => {
      state.isFormOpen = true;
      state.editingTicket = null;
    },
    openEditTicketForm: (state, action: PayloadAction<Ticket>) => {
      state.isFormOpen = true;
      state.editingTicket = action.payload;
    },
    closeTicketForm: (state) => {
      state.isFormOpen = false;
      state.editingTicket = null;
    },
    openDeleteTicketModal: (state, action: PayloadAction<DeleteTarget>) => {
      state.deleteTarget = action.payload;
    },
    closeDeleteTicketModal: (state) => {
      state.deleteTarget = null;
    },
    setSelectedTicketIds: (state, action: PayloadAction<string[]>) => {
      state.selectedTicketIds = action.payload;
    },
    clearSelectedTicketIds: (state) => {
      state.selectedTicketIds = [];
    },
  },
});

type TicketUiRootState = {
  ticketUi: TicketUiState;
};

export const {
  openCreateTicketForm,
  openEditTicketForm,
  closeTicketForm,
  openDeleteTicketModal,
  closeDeleteTicketModal,
  setSelectedTicketIds,
  clearSelectedTicketIds,
} = ticketUiSlice.actions;

export const selectTicketUi = (state: TicketUiRootState) => state.ticketUi;
export const selectIsTicketFormOpen = (state: TicketUiRootState) =>
  state.ticketUi.isFormOpen;
export const selectEditingTicket = (state: TicketUiRootState) =>
  state.ticketUi.editingTicket;
export const selectDeleteTarget = (state: TicketUiRootState) =>
  state.ticketUi.deleteTarget;
export const selectSelectedTicketIds = (state: TicketUiRootState) =>
  state.ticketUi.selectedTicketIds;

export const ticketUiReducer = ticketUiSlice.reducer;
