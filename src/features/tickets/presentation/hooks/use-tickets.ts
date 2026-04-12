import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { TicketQueryParams } from "../../domain/types/ticket-types";
import { ticketService } from "../../infrastructure/ticket-service";
import { normalizeTicketQueryParams, ticketKeys } from "../queries/ticket-keys";

export function useTickets(params?: TicketQueryParams) {
  const normalizedParams = normalizeTicketQueryParams(params);

  return useQuery<Awaited<ReturnType<typeof ticketService.getTickets.execute>>, ApiError>({
    queryKey: ticketKeys.list(normalizedParams),
    queryFn: () => ticketService.getTickets.execute(normalizedParams),
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useTicket(id: string, enabled = true) {
  return useQuery<Awaited<ReturnType<typeof ticketService.getTicketById.execute>>, ApiError>({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketService.getTicketById.execute(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useAvailableMembers(ticketId: string) {
  return useQuery<Awaited<ReturnType<typeof ticketService.getAvailableMembers.execute>>, ApiError>({
    queryKey: ticketKeys.availableMembers(ticketId),
    queryFn: () => ticketService.getAvailableMembers.execute(ticketId),
    enabled: !!ticketId,
  });
}
