"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Ticket, TicketStatus } from "../../domain/types/ticket-types";
import { useTickets } from "./use-tickets";
import {
  openCreateTicketForm,
  openDeleteTicketModal,
  openEditTicketForm,
  selectDeleteTarget,
  selectEditingTicket,
  selectIsTicketFormOpen,
  selectSelectedTicketIds,
  setSelectedTicketIds,
} from "../store/ticket-slice";
import { pushTicketsUrl, replaceTicketsUrl } from "../utils/tickets-url-state";

export function useTicketPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  
  const search = searchParams.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const selectedStatus: TicketStatus | "ALL" =
    (searchParams.get("status") as TicketStatus | null) || "ALL";

  const isFormOpen = useAppSelector(selectIsTicketFormOpen);
  const editingTicket = useAppSelector(selectEditingTicket);
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedTicketIds = useAppSelector(selectSelectedTicketIds);

  useEffect(() => {
    const normalizedSearchTerm = debouncedSearchTerm.trim();
    if (normalizedSearchTerm === search) return;

    const params = new URLSearchParams(searchParams.toString());
    if (normalizedSearchTerm) {
      params.set("search", normalizedSearchTerm);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    replaceTicketsUrl(pathname, params);
  }, [debouncedSearchTerm, pathname, search, searchParams]);

  const { data, isLoading, isError, error, refetch } = useTickets({
    page,
    size,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    search: debouncedSearchTerm,
  });

  const tickets = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const updateStatusFilter = (status: TicketStatus | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    pushTicketsUrl(pathname, params);
  };

  return {
    tickets,
    total,
    isLoading,
    isError,
    error,
    refetch,
    isMobile,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    updateStatusFilter,
    isFormOpen,
    editingTicket,
    deleteTarget,
    selectedTicketIds,
    onAddTicket: () => dispatch(openCreateTicketForm()),
    onEditTicket: (ticket: Ticket) => dispatch(openEditTicketForm(ticket)),
    onDeleteTicket: (ticket: Ticket) => 
      dispatch(openDeleteTicketModal({ id: ticket.id, ticketNumber: ticket.ticketNumber })),
    onSelectionChange: (ids: string[]) => dispatch(setSelectedTicketIds(ids)),
    onBulkDelete: () => {
      // Logic for bulk delete if needed
    }
  };
}
