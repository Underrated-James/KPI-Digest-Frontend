"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjects } from "@/features/projects/presentation/hooks/use-projects";
import { Ticket, TicketStatus } from "../../domain/types/ticket-types";
import { useTickets } from "./use-tickets";
import { useDeleteTicket } from "./use-delete-ticket";
import { ticketService } from "../../infrastructure/ticket-service";
import { ticketKeys } from "../queries/ticket-keys";
import {
  closeDeleteTicketModal,
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
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const search = searchParams.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const selectedStatus: TicketStatus | "ALL" =
    (searchParams.get("status") as TicketStatus | null) || "ALL";
  const selectedProjectId = searchParams.get("projectId");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const isFormOpen = useAppSelector(selectIsTicketFormOpen);
  const editingTicket = useAppSelector(selectEditingTicket);
  const deleteTarget = useAppSelector(selectDeleteTarget);
  const selectedTicketIds = useAppSelector(selectSelectedTicketIds);
  const deleteTicket = useDeleteTicket();
  const { data: projectsData } = useProjects({ size: 100 });

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
    projectId: selectedProjectId || undefined,
    search: debouncedSearchTerm,
  });

  const tickets = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const projectOptions = projectsData?.content ?? [];

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

  const updateProjectFilter = (projectId: string | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (projectId === "ALL") {
      params.delete("projectId");
    } else {
      params.set("projectId", projectId);
    }
    pushTicketsUrl(pathname, params);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget?.id) {
      deleteTicket.mutate(deleteTarget.id, {
        onSuccess: () => {
          dispatch(closeDeleteTicketModal());
          dispatch(
            setSelectedTicketIds(
              selectedTicketIds.filter((selectedId) => selectedId !== deleteTarget.id)
            )
          );
        },
      });
      return;
    }

    if (selectedTicketIds.length === 0) {
      return;
    }

    setIsBulkDeleting(true);
    Promise.all(selectedTicketIds.map((id) => ticketService.deleteTicket.execute(id)))
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        dispatch(setSelectedTicketIds([]));
        dispatch(closeDeleteTicketModal());
        toast.success(
          selectedTicketIds.length === 1
            ? "Ticket deleted successfully"
            : `${selectedTicketIds.length} tickets deleted successfully`
        );
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to delete tickets";
        toast.error(message);
      })
      .finally(() => {
        setIsBulkDeleting(false);
      });
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeDeleteTicketModal());
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
    selectedProjectId,
    projectOptions,
    updateStatusFilter,
    updateProjectFilter,
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
      if (selectedTicketIds.length === 0) {
        return;
      }

      dispatch(
        openDeleteTicketModal({
          ticketNumber:
            selectedTicketIds.length === 1
              ? "1 selected ticket"
              : `${selectedTicketIds.length} selected tickets`,
        })
      );
    },
    isDeleteLoading: deleteTicket.isPending || isBulkDeleting,
    handleDeleteConfirm,
    handleCloseDeleteModal,
  };
}
