"use client";

import { useQuery } from "@tanstack/react-query";
import { getApi } from "@/features/tickets/infrastructure/api/axios-instance";
import {
  mapLoadedTicketToEditable,
  parseTicketListEnvelope,
  type EditableSprintTicket,
} from "../utils/sprint-ticket-planning";
import { ticketKeys } from "@/features/tickets/presentation/queries/ticket-keys";

const api = getApi();

type UseSprintAvailableTicketsParams = {
  projectId?: string | null;
  enabled?: boolean;
};

/**
 * Fetch all tickets with "in progress" and "open" statuses
 * This hook is used in sprint capacity planning to show all available tickets
 * that can be assigned to the sprint
 *
 * Automatically refetches data when the query becomes enabled
 * to ensure fresh data is always displayed
 */
export function useSprintAvailableTickets({
  projectId,
  enabled = true,
}: UseSprintAvailableTicketsParams) {
  return useQuery({
    queryKey: ticketKeys.availableForSprint(projectId ?? ""),
    enabled: Boolean(projectId) && enabled,
    staleTime: 0, // Always refetch to ensure fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    queryFn: async (): Promise<EditableSprintTicket[]> => {
      if (!projectId) {
        return [];
      }

      const all: EditableSprintTicket[] = [];
      let page = 1;
      let totalPages = 1;

      // Fetch all tickets with "in progress" and "open" statuses
      const statuses = ["in progress", "open"];

      while (page <= totalPages) {
        const response = await api.get("/tickets", {
          params: {
            page,
            size: 100,
            projectId,
          },
        });

        const { content, totalPages: nextTotalPages } = parseTicketListEnvelope(
          response.data,
        );

        // Filter only tickets with "in progress" and "open" statuses
        const availableTickets = content.filter(
          (ticket) =>
            ticket.status && statuses.includes(ticket.status.toLowerCase()),
        );

        all.push(...availableTickets.map(mapLoadedTicketToEditable));
        totalPages = nextTotalPages;
        page += 1;
      }

      return all;
    },
  });
}
