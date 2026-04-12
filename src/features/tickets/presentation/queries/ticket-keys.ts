import { TicketQueryParams } from "../../domain/types/ticket-types";

export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (params: TicketQueryParams) => [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  availableMembers: (ticketId: string) => [...ticketKeys.all, "availableMembers", ticketId] as const,
};

export const normalizeTicketQueryParams = (params?: TicketQueryParams): TicketQueryParams => {
  return {
    page: params?.page ?? 1,
    size: params?.size ?? 10,
    status: params?.status,
    projectId: params?.projectId,
    sprintId: params?.sprintId,
    teamId: params?.teamId,
    search: params?.search,
  };
};
