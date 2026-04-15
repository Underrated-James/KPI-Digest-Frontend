"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { LeaveType } from "@/features/teams/domain/types/team-types";
import api from "@/features/tickets/infrastructure/api/axios-instance";
import { useSprintById } from "./use-sprint-by-id";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import {
  getSprintDays,
  normalizeDate,
  type SprintTeamMember,
} from "./use-sprint-teams-page";
import {
  computeMemberAllocationMetrics,
  type AllocationMember,
  type MemberAllocationRow,
  type TicketCommitInput,
} from "../utils/sprint-member-allocation-metrics";

type LoadedTicket = {
  id: string;
  sprintId?: string | null;
  teamId?: string | null;
  ticketNumber: string;
  ticketTitle: string;
  status?: string;
  assignedDevId?: string | null;
  assignedQaId?: string | null;
  developmentEstimation?: number | null;
  estimationTesting?: number | null;
};

type EditableTicket = {
  ticketId: string;
  ticketNumber: string;
  title: string;
  status: string;
  assignedDevId: string | null;
  assignedQaId: string | null;
  developmentEstimation: number;
  estimationTesting: number;
};

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

function parseTicketListEnvelope(responseData: unknown): {
  content: LoadedTicket[];
  page: number;
  totalPages: number;
} {
  const envelope = responseData as {
    content?: LoadedTicket[];
    data?: { content?: LoadedTicket[]; page?: number; totalPages?: number };
    page?: number;
    totalPages?: number;
  };
  const paginated = envelope.data;
  const content = Array.isArray(envelope.content)
    ? envelope.content
    : Array.isArray(paginated?.content)
      ? paginated.content
      : [];
  const currentPage = Number(
    envelope.page ?? paginated?.page ?? 1,
  );
  const pageCount = Number(
    envelope.totalPages ?? paginated?.totalPages ?? currentPage,
  );
  const totalPages =
    Number.isFinite(pageCount) && pageCount > 0 ? pageCount : currentPage;
  return { content, page: currentPage, totalPages };
}

export type SprintCanvasTicketRow = {
  id: string;
  ticketNumber: string;
  ticketTitle: string;
  status: string;
  assignedDevName?: string;
  assignedQaName?: string;
  developmentEstimation: number;
  estimationTesting: number;
};

export function useSprintCanvas(sprintId: string) {
  const router = useRouter();
  const sprintQuery = useSprintById(sprintId);
  const sprint = sprintQuery.data;

  const teamsQuery = useTeams({ sprintId, size: 50 }, Boolean(sprintId));
  const team = teamsQuery.data?.content?.[0] ?? null;

  const attachedTicketsQuery = useQuery({
    queryKey: [
      "sprint-canvas-attached-tickets",
      sprintId,
      sprint?.projectId ?? null,
      team?.id ?? null,
    ],
    enabled: Boolean(sprintId && sprint?.projectId),
    queryFn: async (): Promise<EditableTicket[]> => {
      if (!sprint?.projectId) {
        return [];
      }

      const all: EditableTicket[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const response = await api.get("/tickets", {
          params: {
            page,
            size: 100,
            projectId: sprint.projectId,
          },
        });

        const { content, totalPages: tp } = parseTicketListEnvelope(
          response.data,
        );

        const attachedTickets = content.filter(
          (ticket) =>
            ticket.sprintId === sprintId ||
            (team?.id ? ticket.teamId === team.id : false),
        );

        all.push(...attachedTickets.map(mapLoadedTicketToEditable));

        totalPages = tp;
        page += 1;
      }

      return all;
    },
  });

  const editableTickets = attachedTicketsQuery.data ?? [];

  const userNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of team?.users ?? []) {
      m.set(u.userId, u.name ?? "");
    }
    return m;
  }, [team]);

  const ticketsForDisplay: SprintCanvasTicketRow[] = useMemo(() => {
    return editableTickets.map((t) => ({
      id: t.ticketId,
      ticketNumber: t.ticketNumber,
      ticketTitle: t.title,
      status: t.status,
      assignedDevName: t.assignedDevId
        ? userNameById.get(t.assignedDevId) ?? "—"
        : undefined,
      assignedQaName: t.assignedQaId
        ? userNameById.get(t.assignedQaId) ?? "—"
        : undefined,
      developmentEstimation: t.developmentEstimation,
      estimationTesting: t.estimationTesting,
    }));
  }, [editableTickets, userNameById]);

  const allocationMembers: AllocationMember[] = useMemo(() => {
    if (!team) return [];
    return (team.users ?? []).map((u) => ({
      userId: u.userId,
      name: u.name ?? "Unknown",
      role: u.role === "QA" ? "QA" : "DEVS",
      hoursPerDay: Number(u.hoursPerDay ?? 0),
      leave: u.leave ?? [],
    }));
  }, [team]);

  const ticketCommitInputs: TicketCommitInput[] = useMemo(
    () =>
      editableTickets.map((t) => ({
        assignedDevId: t.assignedDevId,
        assignedQaId: t.assignedQaId,
        developmentEstimation: t.developmentEstimation,
        estimationTesting: t.estimationTesting,
      })),
    [editableTickets],
  );

  const memberAllocation = useMemo(() => {
    if (!sprint) {
      return {
        byMember: [] as MemberAllocationRow[],
        totalSprintCapacity: 0,
        totalCommitted: 0,
        totalAvailable: 0,
        hasOverCapacity: false,
      };
    }
    return computeMemberAllocationMetrics(
      sprint,
      allocationMembers,
      ticketCommitInputs,
    );
  }, [sprint, allocationMembers, ticketCommitInputs]);

  const sprintDays = useMemo(() => {
    if (!sprint) return [];
    return getSprintDays(sprint.startDate, sprint.endDate);
  }, [sprint]);

  const dayOffDates = useMemo(() => {
    if (!sprint?.dayOff) return [];
    return sprint.dayOff.map((d) => normalizeDate(d.date));
  }, [sprint]);

  const timelineMembers: SprintTeamMember[] = useMemo(() => {
    if (!team) return [];
    return (team.users ?? []).map((u) => ({
      userId: u.userId,
      name: u.name ?? "Member",
      role: u.role === "QA" ? "QA" : "DEVS",
      allocationPercentage: u.allocationPercentage ?? 100,
      leave: u.leave ?? [],
    }));
  }, [team]);

  const getEffectiveLeaveReadonly = useCallback(
    (_userId: string, _date: string, originalType?: LeaveType) => originalType,
    [],
  );

  const goBackToSprintList = () => {
    const params = new URLSearchParams();
    if (sprint?.projectId) {
      params.set("projectId", sprint.projectId);
    }
    if (sprint?.projectName) {
      params.set("projectName", sprint.projectName);
    }
    const target = params.toString() ? `/sprints?${params.toString()}` : "/sprints";
    router.push(target);
  };

  const buildSubpageUrl = (path: "capacity-planning" | "create-teams") => {
    const params = new URLSearchParams();
    if (sprint?.projectId) params.set("projectId", sprint.projectId);
    if (sprint?.projectName) params.set("projectName", sprint.projectName);
    if (path === "create-teams" && team?.id) {
      params.set("teamId", team.id);
    }
    if (path === "create-teams" && sprint?.name) {
      params.set("sprintName", sprint.name);
    }
    const q = params.toString();
    return q ? `/sprints/${sprintId}/${path}?${q}` : `/sprints/${sprintId}/${path}`;
  };

  const isLoading =
    sprintQuery.isLoading ||
    teamsQuery.isLoading ||
    (Boolean(sprint?.projectId) && attachedTicketsQuery.isLoading);

  return {
    sprint,
    team,
    tickets: ticketsForDisplay,
    editableTickets,
    memberAllocation,
    sprintDays,
    dayOffDates,
    timelineMembers,
    getEffectiveLeaveReadonly,
    isLoading,
    goBackToSprintList,
    buildSubpageUrl,
  };
}
