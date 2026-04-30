"use client";

import { useQuery } from "@tanstack/react-query";
import { getApi } from "@/features/tickets/infrastructure/api/axios-instance";
import {
  mapLoadedTicketToEditable,
  parseTicketListEnvelope,
  type EditableSprintTicket,
} from "../utils/sprint-ticket-planning";

const api = getApi();

type UseSprintAttachedTicketsParams = {
  sprintId: string;
  projectId?: string | null;
  teamId?: string | null;
};

export function sprintAttachedTicketsQueryKey({
  sprintId,
  projectId,
  teamId,
}: UseSprintAttachedTicketsParams) {
  return [
    "sprint-attached-tickets",
    sprintId,
    projectId ?? null,
    teamId ?? null,
  ] as const;
}

export function useSprintAttachedTickets({
  sprintId,
  projectId,
  teamId,
}: UseSprintAttachedTicketsParams) {
  return useQuery({
    queryKey: sprintAttachedTicketsQueryKey({ sprintId, projectId, teamId }),
    enabled: Boolean(sprintId && projectId),
    queryFn: async (): Promise<EditableSprintTicket[]> => {
      if (!projectId) {
        return [];
      }

      const all: EditableSprintTicket[] = [];
      let page = 1;
      let totalPages = 1;

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

        const attachedTickets = content.filter(
          (ticket) =>
            ticket.sprintId === sprintId ||
            (teamId ? ticket.teamId === teamId : false),
        );

        all.push(...attachedTickets.map(mapLoadedTicketToEditable));
        totalPages = nextTotalPages;
        page += 1;
      }

      return all;
    },
  });
}
