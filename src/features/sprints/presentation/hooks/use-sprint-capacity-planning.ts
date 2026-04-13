"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/features/tickets/infrastructure/api/axios-instance";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSprintById } from "./use-sprint-by-id";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import { LeaveType } from "@/features/teams/domain/types/team-types";

type TeamMember = {
  userId: string;
  name: string;
  role: "DEVS" | "QA";
  hoursPerDay: number;
  leave?: Array<{ leaveDate: string; leaveType: LeaveType[] }>;
};

export type EditableTicket = {
  ticketId: string;
  ticketNumber: string;
  title: string;
  status: string;
  assignedDevId: string | null;
  assignedQaId: string | null;
  developmentEstimation: number;
  estimationTesting: number;
};

type TicketSearchItem = {
  id: string;
  ticketNumber: string;
  ticketTitle: string;
  status?: string;
};

type TicketSearchResponse = {
  items: TicketSearchItem[];
  page: number;
  totalPages: number;
};

type TicketListEnvelope = {
  content?: unknown[];
  page?: number;
  totalPages?: number;
  data?: {
    content?: unknown[];
    page?: number;
    totalPages?: number;
  };
};

type LoadedTicket = {
  id: string;
  ticketNumber: string;
  ticketTitle: string;
  status?: string;
  assignedDevId?: string | null;
  assignedQaId?: string | null;
  developmentEstimation?: number | null;
  estimationTesting?: number | null;
};

function parseTicketSearchEnvelope(
  envelope: TicketListEnvelope,
  fallbackPage: number,
): TicketSearchResponse {
  const nestedData = envelope.data;
  const itemsSource: unknown[] = Array.isArray(envelope.content)
    ? envelope.content
    : Array.isArray(nestedData?.content)
      ? nestedData.content
      : [];

  const items = itemsSource
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: String(row.id ?? row._id ?? ""),
        ticketNumber: String(row.ticketNumber ?? row.key ?? "N/A"),
        ticketTitle: String(row.ticketTitle ?? row.title ?? "Untitled"),
        status: typeof row.status === "string" ? row.status : undefined,
      };
    })
    .filter((item) => Boolean(item.id));

  const currentPage = Number(envelope.page ?? nestedData?.page ?? fallbackPage);
  const totalPages = Number(envelope.totalPages ?? nestedData?.totalPages ?? currentPage);

  return {
    items,
    page: Number.isFinite(currentPage) ? currentPage : fallbackPage,
    totalPages: Number.isFinite(totalPages) ? totalPages : fallbackPage,
  };
}

function mapLoadedTicketToEditable(ticket: LoadedTicket): EditableTicket {
  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    title: ticket.ticketTitle,
    status: ticket.status ?? "open",
    assignedDevId: ticket.assignedDevId ?? null,
    assignedQaId: ticket.assignedQaId ?? null,
    developmentEstimation: Number(ticket.developmentEstimation ?? 0),
    estimationTesting: Number(ticket.estimationTesting ?? 0),
  };
}

function normalizeDate(date: string) {
  return date.split("T")[0];
}

function getWorkDays(start: string, end: string) {
  const result: string[] = [];
  const current = new Date(`${normalizeDate(start)}T00:00:00`);
  const last = new Date(`${normalizeDate(end)}T00:00:00`);
  while (current <= last) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      result.push(current.toISOString().slice(0, 10));
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
}

function getLeaveWeight(leaveTypes: LeaveType[] = []) {
  if (leaveTypes.includes(LeaveType.HALF_DAY_LEAVE)) return 0.5;
  return leaveTypes.length > 0 ? 1 : 0;
}

export function useSprintCapacityPlanning(sprintId: string) {
  const router = useRouter();
  const [addedTickets, setAddedTickets] = useState<EditableTicket[]>([]);
  const [removedTicketIds, setRemovedTicketIds] = useState<string[]>([]);
  const [ticketPatches, setTicketPatches] = useState<Record<string, Partial<EditableTicket>>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketSearchPage, setTicketSearchPage] = useState(1);
  const debouncedTicketSearch = useDebouncedValue(ticketSearch.trim(), 300);

  const sprintQuery = useSprintById(sprintId);
  const sprint = sprintQuery.data;

  const teamsQuery = useTeams({ sprintId, size: 50 }, Boolean(sprintId));
  const team = teamsQuery.data?.content?.[0] ?? null;

  const members = useMemo<TeamMember[]>(() => {
    if (!team) return [];
    return (team.users ?? []).map((user) => ({
      userId: user.userId,
      name: user.name ?? "Unknown",
      role: user.role,
      hoursPerDay: Number(user.hoursPerDay ?? 0),
      leave: user.leave ?? [],
    }));
  }, [team]);

  const attachedTicketsQuery = useQuery({
    queryKey: ["attached-sprint-tickets", sprintId],
    enabled: Boolean(sprintId),
    queryFn: async (): Promise<EditableTicket[]> => {
      const all: EditableTicket[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const response = await api.get("/tickets", {
          params: {
            page,
            size: 100,
            sprintId,
          },
        });

        const envelope = response.data as TicketListEnvelope;
        const nestedData = envelope.data;
        const content = (Array.isArray(envelope.content)
          ? envelope.content
          : Array.isArray(nestedData?.content)
            ? nestedData.content
            : []) as LoadedTicket[];

        all.push(...content.map(mapLoadedTicketToEditable));

        const currentPage = Number(envelope.page ?? nestedData?.page ?? page);
        const pageCount = Number(envelope.totalPages ?? nestedData?.totalPages ?? currentPage);
        totalPages = Number.isFinite(pageCount) && pageCount > 0 ? pageCount : page;
        page += 1;
      }

      return all;
    },
  });

  const tickets = useMemo(() => {
    const removedSet = new Set(removedTicketIds);
    const attached = (attachedTicketsQuery.data ?? []).filter((ticket) => !removedSet.has(ticket.ticketId));
    const mergedById = new Map<string, EditableTicket>();

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
  }, [addedTickets, attachedTicketsQuery.data, removedTicketIds, ticketPatches]);

  const memberLookup = useMemo(() => {
    return new Map(members.map((member) => [member.userId, member]));
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
          available: number;
          utilization: number;
          isZeroCapacity: boolean;
        }>,
        totalSprintCapacity: 0,
        totalCommitted: 0,
        totalAvailable: 0,
        hasOverCapacity: false,
      };
    }

    const workDays = getWorkDays(sprint.startDate, sprint.endDate);
    const holidaySet = new Set((sprint.dayOff ?? []).map((d) => normalizeDate(d.date)));
    const committedMap = new Map<string, number>();

    for (const ticket of tickets) {
      if (ticket.assignedDevId) {
        committedMap.set(
          ticket.assignedDevId,
          (committedMap.get(ticket.assignedDevId) ?? 0) + Number(ticket.developmentEstimation || 0),
        );
      }
      if (ticket.assignedQaId) {
        committedMap.set(
          ticket.assignedQaId,
          (committedMap.get(ticket.assignedQaId) ?? 0) + Number(ticket.estimationTesting || 0),
        );
      }
    }

    const byMember = members.map((member) => {
      let workingDays = 0;
      let leaveDeduction = 0;

      const leaveByDate = new Map(
        (member.leave ?? []).map((leave) => [normalizeDate(leave.leaveDate), leave.leaveType]),
      );

      for (const day of workDays) {
        if (holidaySet.has(day)) continue;
        workingDays += 1;
        const leaveTypes = leaveByDate.get(day);
        leaveDeduction += getLeaveWeight(leaveTypes);
      }

      const actualWorkingDays = Math.max(workingDays - leaveDeduction, 0);
      const sprintCapacity = Number((member.hoursPerDay * actualWorkingDays).toFixed(2));
      const committed = Number((committedMap.get(member.userId) ?? 0).toFixed(2));
      const available = Number((sprintCapacity - committed).toFixed(2));
      const utilization =
        sprintCapacity <= 0 ? (committed > 0 ? 100 : 0) : Number(((committed / sprintCapacity) * 100).toFixed(2));

      return {
        userId: member.userId,
        name: member.name,
        role: member.role,
        sprintCapacity,
        committed,
        available,
        utilization,
        isZeroCapacity: sprintCapacity === 0,
      };
    });

    const totalSprintCapacity = Number(byMember.reduce((sum, m) => sum + m.sprintCapacity, 0).toFixed(2));
    const totalCommitted = Number(byMember.reduce((sum, m) => sum + m.committed, 0).toFixed(2));
    const totalAvailable = Number((totalSprintCapacity - totalCommitted).toFixed(2));
    const hasOverCapacity = byMember.some((m) => m.available < 0);

    return {
      byMember,
      totalSprintCapacity,
      totalCommitted,
      totalAvailable,
      hasOverCapacity,
    };
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
      if (!team) throw new Error("Team not found for sprint.");
      const payload: {
        tickets: Array<{
          id: string;
          sprintId: string | null;
          projectId?: string;
          teamId?: string | null;
          assignedDevId: string | null;
          assignedQaId: string | null;
          developmentEstimation: number;
          estimationTesting: number;
        }>;
      } = {
        tickets: tickets.map((ticket) => ({
          id: ticket.ticketId,
          sprintId,
          projectId: sprint?.projectId,
          teamId: team.id,
          assignedDevId: ticket.assignedDevId,
          assignedQaId: ticket.assignedQaId,
          developmentEstimation: Number(ticket.developmentEstimation || 0),
          estimationTesting: Number(ticket.estimationTesting || 0),
        })),
      };

      const originallyAttachedIds = new Set(
        (attachedTicketsQuery.data ?? []).map((ticket) => ticket.ticketId),
      );
      const removedAttached = removedTicketIds.filter((id) => originallyAttachedIds.has(id));

      for (const ticketId of removedAttached) {
        payload.tickets.push({
          id: ticketId,
          sprintId: null,
          teamId: null,
          assignedDevId: null,
          assignedQaId: null,
          developmentEstimation: 0,
          estimationTesting: 0,
        });
      }

      await api.patch("/tickets", payload);
    },
    onSuccess: () => {
      toast.success("Sprint capacity plan saved.");
      const params = new URLSearchParams();
      if (sprint?.projectId) {
        params.set("projectId", sprint.projectId);
      }
      if (sprint?.projectName) {
        params.set("projectName", sprint.projectName);
      }
      const target = params.toString() ? `/sprints?${params.toString()}` : "/sprints";
      router.push(target);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save capacity plan.");
    },
  });

  const ticketSearchQuery = useQuery({
    queryKey: ["ticket-search-external", debouncedTicketSearch, ticketSearchPage],
    enabled: isAddModalOpen,
    queryFn: async (): Promise<TicketSearchResponse> => {
      const url = new URL("http://localhost:3001/tickets");
      url.searchParams.set("page", String(ticketSearchPage));
      url.searchParams.set("size", "10");
      if (debouncedTicketSearch) {
        url.searchParams.set("search", debouncedTicketSearch);
        url.searchParams.set("q", debouncedTicketSearch);
      }
      try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Ticket search failed.");
        const json: unknown = await response.json();
        return parseTicketSearchEnvelope(json as TicketListEnvelope, ticketSearchPage);
      } catch {
        const fallback = await api.get("/tickets", {
          params: {
            page: ticketSearchPage,
            size: 10,
            ...(debouncedTicketSearch ? { search: debouncedTicketSearch } : {}),
          },
        });
        return parseTicketSearchEnvelope(fallback.data as TicketListEnvelope, ticketSearchPage);
      }
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
      },
    ]);
  };

  const updateTicket = (ticketId: string, patch: Partial<EditableTicket>) => {
    setTicketPatches((prev) => ({
      ...prev,
      [ticketId]: { ...(prev[ticketId] ?? {}), ...patch },
    }));
  };

  const removeTicket = (ticketId: string) => {
    setAddedTickets((prev) => prev.filter((ticket) => ticket.ticketId !== ticketId));
    setRemovedTicketIds((prev) => (prev.includes(ticketId) ? prev : [...prev, ticketId]));
  };

  return {
    sprint,
    team,
    members: metrics.byMember,
    devMembers,
    qaMembers,
    tickets,
    memberLookup,
    isLoading: sprintQuery.isLoading || teamsQuery.isLoading || attachedTicketsQuery.isLoading,
    isSaving: saveMutation.isPending,
    totalSprintCapacity: metrics.totalSprintCapacity,
    totalCommitted: metrics.totalCommitted,
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
      (ticketSearchQuery.data?.page ?? 1) < (ticketSearchQuery.data?.totalPages ?? 1),
    loadMoreSearchResults: () => {
      if (ticketSearchQuery.isFetching) return;
      setTicketSearchPage((prev) => prev + 1);
    },
    ticketSearchLoading: ticketSearchQuery.isLoading || ticketSearchQuery.isFetching,
    ticketSearchError:
      ticketSearchQuery.isError && ticketSearchQuery.error instanceof Error
        ? ticketSearchQuery.error.message
        : null,
    addTicket,
    isTicketAlreadyAdded: (ticketId: string) =>
      tickets.some((ticket) => ticket.ticketId === ticketId),
    updateTicket,
    removeTicket,
    goBackToSprintList: () => {
      const params = new URLSearchParams();
      if (sprint?.projectId) {
        params.set("projectId", sprint.projectId);
      }
      if (sprint?.projectName) {
        params.set("projectName", sprint.projectName);
      }
      const target = params.toString() ? `/sprints?${params.toString()}` : "/sprints";
      router.push(target);
    },
    save: () => saveMutation.mutate(),
  };
}
