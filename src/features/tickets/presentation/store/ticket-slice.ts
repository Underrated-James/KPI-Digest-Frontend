import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { FormMode } from "@/lib/form-mode";
import { Ticket, TicketStatus } from "../../domain/types/ticket-types";

interface DeleteTarget {
  id?: string;
  ticketNumber: string;
}

export interface TicketUiState {
  isFormOpen: boolean;
  editingTicket: Ticket | null;
  formMode: FormMode;
  statusOverride: TicketStatus | null;
  deleteTarget: DeleteTarget | null;
  selectedTicketIds: string[];
}

const initialState: TicketUiState = {
  isFormOpen: false,
  editingTicket: null,
  formMode: "create",
  statusOverride: null,
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
      state.formMode = "create";
      state.statusOverride = null;
    },
    openEditTicketForm: (state, action: PayloadAction<Ticket>) => {
      state.isFormOpen = true;
      state.editingTicket = action.payload;
      state.formMode = "edit";
      state.statusOverride = null;
    },
    openCompleteTicketForm: (state, action: PayloadAction<Ticket>) => {
      state.isFormOpen = true;
      state.editingTicket = action.payload;
      state.formMode = "edit";
      state.statusOverride = "completed";
    },
    openViewTicketForm: (state, action: PayloadAction<Ticket>) => {
      state.isFormOpen = true;
      state.editingTicket = action.payload;
      state.formMode = "view";
      state.statusOverride = null;
    },
    closeTicketForm: (state) => {
      state.isFormOpen = false;
      state.editingTicket = null;
      state.formMode = "create";
      state.statusOverride = null;
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

export const {
  openCreateTicketForm,
  openEditTicketForm,
  openCompleteTicketForm,
  openViewTicketForm,
  closeTicketForm,
  openDeleteTicketModal,
  closeDeleteTicketModal,
  setSelectedTicketIds,
  clearSelectedTicketIds,
} = ticketUiSlice.actions;

export const selectTicketUi = (state: RootState) => state.ticketUi;
export const selectIsTicketFormOpen = (state: RootState) =>
  state.ticketUi.isFormOpen;
export const selectEditingTicket = (state: RootState) =>
  state.ticketUi.editingTicket;
export const selectTicketFormMode = (state: RootState) =>
  state.ticketUi.formMode;
export const selectTicketStatusOverride = (state: RootState) =>
  state.ticketUi.statusOverride;
export const selectDeleteTarget = (state: RootState) =>
  state.ticketUi.deleteTarget;
export const selectSelectedTicketIds = (state: RootState) =>
  state.ticketUi.selectedTicketIds;

export const ticketUiReducer = ticketUiSlice.reducer;
