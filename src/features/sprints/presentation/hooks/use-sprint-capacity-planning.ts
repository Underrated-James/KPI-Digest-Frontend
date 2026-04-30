"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { getApi } from "@/features/tickets/infrastructure/api/axios-instance";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSprintById } from "./use-sprint-by-id";
import { useSprintAttachedTickets } from "./use-sprint-attached-tickets";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import { ticketKeys } from "@/features/tickets/presentation/queries/ticket-keys";
import type { TicketStatus } from "@/features/tickets/domain/types/ticket-types";
import { isSprintViewOnly } from "../utils/sprint-control-utils";
import {
  computeMemberAllocationMetrics,
  type AllocationMember,
  type TicketCommitInput,
} from "../utils/sprint-member-allocation-metrics";
import type { EditableSprintTicket } from "../utils/sprint-ticket-planning";

const api = getApi();

type TicketSearchItem = {
  id: string;
  ticketNumber: string;
  ticketTitle: string;
  status?: TicketStatus;
};

type TicketSearchResponse = {
  items: TicketSearchItem[];
  page: number;
  totalPages: number;
};

type AvailableSprintTicketsResponse = {
  data?: {
    available?: unknown[];
  };
  available?: unknown[];
};

export function useSprintCapacityPlanning(sprintId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [addedTickets, setAddedTickets] = useState<EditableSprintTicket[]>([]);
  const [removedTicketIds, setRemovedTicketIds] = useState<string[]>([]);
  const [ticketPatches, setTicketPatches] = useState<
    Record<string, Partial<EditableSprintTicket>>
  >({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketSearchPage, setTicketSearchPage] = useState(1);
  const debouncedTicketSearch = useDebouncedValue(ticketSearch.trim(), 300);

  const sprintQuery = useSprintById(sprintId);
  const sprint = sprintQuery.data;

  // Invalidate and refetch ticket cache when sprint capacity page mounts
  // This ensures fresh data is always shown when users enter the sprint capacity planning page
  useEffect(() => {
    // Clear the ticket cache to force a fresh fetch
    queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    queryClient.invalidateQueries({
      queryKey: ["sprint-available-ticket-search"],
    });
  }, [sprintId, queryClient]);

  const teamsQuery = useTeams({ sprintId, size: 50 }, Boolean(sprintId));
  const team = teamsQuery.data?.content?.[0] ?? null;

  const members = useMemo<AllocationMember[]>(() => {
    if (!team) return [];

    return (team.users ?? []).map((user) => ({
      userId: user.userId,
      name: user.name ?? "Unknown",
      role: user.role === "QA" ? "QA" : "DEVS",
      hoursPerDay: Number(user.hoursPerDay ?? 0),
      leave: user.leave ?? [],
    }));
  }, [team]);

  const attachedTicketsQuery = useSprintAttachedTickets({
    sprintId,
    projectId: sprint?.projectId,
    teamId: team?.id ?? null,
  });

  const tickets = useMemo(() => {
    const removedSet = new Set(removedTicketIds);
    const attached = (attachedTicketsQuery.data ?? []).filter(
      (ticket) => !removedSet.has(ticket.ticketId),
    );
    const mergedById = new Map<string, EditableSprintTicket>();

    for (const ticket of attached) {
      mergedById.set(ticket.ticketId, ticket);
    }

    for (const ticket of addedTickets) {
      if (!removedSet.has(ticket.ticketId)) {
        mergedById.set(ticket.ticketId, ticket);
      }
    }

    return Array.from(mergedById.values()).map((ticket) => ({
      ...ticket,
      ...(ticketPatches[ticket.ticketId] ?? {}),
    }));
  }, [
    addedTickets,
    attachedTicketsQuery.data,
    removedTicketIds,
    ticketPatches,
  ]);

  const memberLookup = useMemo(() => {
    return new Map(members.map((member) => [member.userId, member] as const));
  }, [members]);

  const metrics = useMemo(() => {
    if (!sprint) {
      return {
        byMember: [] as Array<{
          userId: string;
          name: string;
          role: "DEVS" | "QA";
          sprintCapacity: number;
          committed: number;
          timeSpent: number;
          available: number;
          utilization: number;
          isZeroCapacity: boolean;
        }>,
        totalSprintCapacity: 0,
        totalCommitted: 0,
        totalTimeSpent: 0,
        totalAvailable: 0,
        hasOverCapacity: false,
      };
    }

    const ticketCommitInputs: TicketCommitInput[] = tickets.map((ticket) => ({
      assignedDevId: ticket.assignedDevId,
      assignedQaId: ticket.assignedQaId,
      developmentEstimation: ticket.developmentEstimation,
      estimationTesting: ticket.estimationTesting,
      devTimeSpent: ticket.devTimeSpent,
      testingTimeSpent: ticket.testingTimeSpent,
    }));

    return computeMemberAllocationMetrics(sprint, members, ticketCommitInputs);
  }, [members, sprint, tickets]);

  const devMembers = useMemo(
    () => metrics.byMember.filter((member) => member.role === "DEVS"),
    [metrics.byMember],
  );
  const qaMembers = useMemo(
    () => metrics.byMember.filter((member) => member.role === "QA"),
    [metrics.byMember],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: {
        tickets: Array<{
          id: string;
          sprintId: string | null;
          projectId?: string;
          teamId?: string | null;
          status?: TicketStatus;
          assignedDevId: string | null;
          assignedQaId: string | null;
          developmentEstimation: number;
          estimationTesting: number;
          devTimeSpent: number;
          testingTimeSpent: number;
        }>;
      } = {
        tickets: tickets.map((ticket) => ({
          id: ticket.ticketId,
          sprintId,
          projectId: sprint?.projectId,
          teamId: team?.id ?? null,
          status: ticket.status,
          assignedDevId: ticket.assignedDevId,
          assignedQaId: ticket.assignedQaId,
          developmentEstimation: Number(ticket.developmentEstimation || 0),
          estimationTesting: Number(ticket.estimationTesting || 0),
          devTimeSpent: Number(ticket.devTimeSpent || 0),
          testingTimeSpent: Number(ticket.testingTimeSpent || 0),
        })),
      };

      const originallyAttachedIds = new Set(
        (attachedTicketsQuery.data ?? []).map((ticket) => ticket.ticketId),
      );
      const removedAttached = removedTicketIds.filter((id) =>
        originallyAttachedIds.has(id),
      );

      for (const ticketId of removedAttached) {
        payload.tickets.push({
          id: ticketId,
          sprintId: null,
          teamId: null,
          assignedDevId: null,
          assignedQaId: null,
          developmentEstimation: 0,
          estimationTesting: 0,
          devTimeSpent: 0,
          testingTimeSpent: 0,
        });
      }

      await api.patch("/tickets", payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
        queryClient.invalidateQueries({
          queryKey: ["sprint-available-ticket-search"],
        }),
        attachedTicketsQuery.refetch(),
      ]);
      toast.success("Sprint capacity plan saved.");

      const params = new URLSearchParams();
      if (sprint?.projectId) {
        params.set("projectId", sprint.projectId);
      }
      if (sprint?.projectName) {
        params.set("projectName", sprint.projectName);
      }

      const target = params.toString()
        ? `/sprints?${params.toString()}`
        : "/sprints";
      router.push(target);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save capacity plan.");
    },
  });

  const availableTicketsQueryKey = [
    "sprint-available-ticket-search",
    sprintId,
    sprint?.projectId ?? null,
    debouncedTicketSearch,
    ticketSearchPage,
  ] as const;

  const ticketSearchQuery = useQuery({
    queryKey: availableTicketsQueryKey,
    enabled: isAddModalOpen && Boolean(sprintId && sprint?.projectId),
    queryFn: async (): Promise<TicketSearchResponse> => {
      const pageSize = 10;
      const response = await api.get(`/sprints/${sprintId}/tickets/available`);
      const data = response.data as AvailableSprintTicketsResponse;
      const availableSource = Array.isArray(data.data?.available)
        ? data.data.available
        : Array.isArray(data.available)
          ? data.available
          : [];

      const allItems = availableSource.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          id: String(row.id ?? row._id ?? ""),
          ticketNumber: String(row.ticketNumber ?? row.key ?? "N/A"),
          ticketTitle: String(row.ticketTitle ?? row.title ?? "Untitled"),
          status: typeof row.status === "string"
            ? (row.status as TicketStatus)
            : undefined,
        };
      });

      const normalizedSearch = debouncedTicketSearch.toLowerCase();
      const filteredItems = normalizedSearch
        ? allItems.filter(
            (item) =>
              item.ticketNumber.toLowerCase().includes(normalizedSearch) ||
              item.ticketTitle.toLowerCase().includes(normalizedSearch),
          )
        : allItems;

      const totalPages = Math.max(
        1,
        Math.ceil(filteredItems.length / pageSize),
      );
      const safePage = Math.min(ticketSearchPage, totalPages);
      const start = (safePage - 1) * pageSize;
      const items = filteredItems.slice(start, start + pageSize);

      return {
        items,
        page: safePage,
        totalPages,
      };
    },
  });

  const addTicket = (ticket: TicketSearchItem) => {
    if (!ticket.id) return;

    const duplicate = tickets.some((row) => row.ticketId === ticket.id);
    if (duplicate) {
      toast.error("Ticket already exists in this planner.");
      return;
    }

    setRemovedTicketIds((prev) => prev.filter((id) => id !== ticket.id));
    setAddedTickets((prev) => [
      ...prev,
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.ticketTitle,
        status: ticket.status ?? "open",
        assignedDevId: null,
        assignedQaId: null,
        developmentEstimation: 0,
        estimationTesting: 0,
        devTimeSpent: 0,
        testingTimeSpent: 0,
      },
    ]);
  };

  const updateTicket = (
    ticketId: string,
    patch: Partial<EditableSprintTicket>,
  ) => {
    setTicketPatches((prev) => ({
      ...prev,
      [ticketId]: { ...(prev[ticketId] ?? {}), ...patch },
    }));
  };

  const removeTicket = (ticketId: string) => {
    setAddedTickets((prev) =>
      prev.filter((ticket) => ticket.ticketId !== ticketId),
    );
    setRemovedTicketIds((prev) =>
      prev.includes(ticketId) ? prev : [...prev, ticketId],
    );
  };

  const viewOnly = Boolean(sprint && isSprintViewOnly(sprint));
  const backTo = searchParams.get("backTo");

  return {
    sprint,
    team,
    viewOnly,
    members: metrics.byMember,
    devMembers,
    qaMembers,
    tickets,
    memberLookup,
    isLoading:
      sprintQuery.isLoading ||
      teamsQuery.isLoading ||
      attachedTicketsQuery.isLoading,
    isSaving: saveMutation.isPending,
    totalSprintCapacity: metrics.totalSprintCapacity,
    totalCommitted: metrics.totalCommitted,
    totalTimeSpent: metrics.totalTimeSpent,
    totalAvailable: metrics.totalAvailable,
    hasOverCapacity: metrics.hasOverCapacity,
    isAddModalOpen,
    setIsAddModalOpen,
    ticketSearch,
    setTicketSearch: (value: string) => {
      setTicketSearch(value);
      setTicketSearchPage(1);
    },
    ticketSearchResults: ticketSearchQuery.data?.items ?? [],
    ticketSearchPage,
    hasMoreSearchResults:
      (ticketSearchQuery.data?.page ?? 1) <
      (ticketSearchQuery.data?.totalPages ?? 1),
    loadMoreSearchResults: () => {
      if (ticketSearchQuery.isFetching) return;
      setTicketSearchPage((prev) => prev + 1);
    },
    ticketSearchLoading:
      ticketSearchQuery.isLoading || ticketSearchQuery.isFetching,
    ticketSearchError:
      ticketSearchQuery.isError && ticketSearchQuery.error instanceof Error
        ? ticketSearchQuery.error.message
        : null,
    addTicket,
    isTicketAlreadyAdded: (ticketId: string) =>
      tickets.some((ticket) => ticket.ticketId === ticketId),
    updateTicket,
    removeTicket,
    goBackToSprintOverview: () => {
      const params = new URLSearchParams();
      if (sprint?.projectId) {
        params.set("projectId", sprint.projectId);
      }
      if (sprint?.projectName) {
        params.set("projectName", sprint.projectName);
      }

      const target =
        backTo === "list"
          ? params.toString()
            ? `/sprints?${params.toString()}`
            : "/sprints"
          : params.toString()
            ? `/sprints/${sprintId}?${params.toString()}`
            : `/sprints/${sprintId}`;
      router.push(target);
    },
    goBackToSprintList: () => {
      const params = new URLSearchParams();
      if (sprint?.projectId) {
        params.set("projectId", sprint.projectId);
      }
      if (sprint?.projectName) {
        params.set("projectName", sprint.projectName);
      }
      const target = params.toString()
        ? `/sprints?${params.toString()}`
        : "/sprints";
      router.push(target);
    },
    save: () => saveMutation.mutate(),
  };
}
