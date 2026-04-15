"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { ticketService } from "@/features/tickets/infrastructure/ticket-service";
import {
  normalizeTicketQueryParams,
  ticketKeys,
} from "@/features/tickets/presentation/queries/ticket-keys";

export function useSprintTicketCounts(sprintIds: string[]) {
  const results = useQueries({
    queries: sprintIds.map((sprintId) => ({
      queryKey: ticketKeys.list(
        normalizeTicketQueryParams({ sprintId, page: 1, size: 1 }),
      ),
      queryFn: () =>
        ticketService.getTickets.execute({ sprintId, page: 1, size: 1 }),
      enabled: Boolean(sprintId),
      staleTime: 30_000,
      select: (data: { totalElements: number }) => data.totalElements,
    })),
  });

  const ticketCountBySprintId = useMemo(() => {
    const map = new Map<string, number>();
    sprintIds.forEach((id, index) => {
      const total = results[index]?.data;
      if (typeof total === "number") {
        map.set(id, total);
      }
    });
    return map;
  }, [sprintIds, results]);

  const isLoading = results.some((r) => r.isPending || r.isLoading);

  return { ticketCountBySprintId, isLoading };
}
