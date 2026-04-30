"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LeaveType } from "@/features/teams/domain/types/team-types";
import { useSprintById } from "./use-sprint-by-id";
import { useSprintAttachedTickets } from "./use-sprint-attached-tickets";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import { getSprintDays, normalizeDate } from "../utils/sprint-date-utils";
import {
  computeMemberAllocationMetrics,
  type AllocationMember,
  type MemberAllocationRow,
  type TicketCommitInput,
} from "../utils/sprint-member-allocation-metrics";
import type { SprintTeamMember } from "../types/sprint-team-member";

export type SprintCanvasTicketRow = {
  id: string;
  ticketNumber: string;
  ticketTitle: string;
  status: string;
  assignedDevName?: string;
  assignedQaName?: string;
  developmentEstimation: number;
  estimationTesting: number;
  devTimeSpent: number;
  testingTimeSpent: number;
};

export function useSprintCanvas(sprintId: string) {
  const router = useRouter();
  const sprintQuery = useSprintById(sprintId);
  const sprint = sprintQuery.data;

  const teamsQuery = useTeams({ sprintId, size: 50 }, Boolean(sprintId));
  const team = teamsQuery.data?.content?.[0] ?? null;

  const attachedTicketsQuery = useSprintAttachedTickets({
    sprintId,
    projectId: sprint?.projectId,
    teamId: team?.id ?? null,
  });

  const editableTickets = useMemo(
    () => attachedTicketsQuery.data ?? [],
    [attachedTicketsQuery.data],
  );

  const userNameById = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const user of team?.users ?? []) {
      lookup.set(user.userId, user.name ?? "");
    }
    return lookup;
  }, [team]);

  const ticketsForDisplay: SprintCanvasTicketRow[] = useMemo(() => {
    return editableTickets.map((ticket) => ({
      id: ticket.ticketId,
      ticketNumber: ticket.ticketNumber,
      ticketTitle: ticket.title,
      status: ticket.status,
      assignedDevName: ticket.assignedDevId
        ? userNameById.get(ticket.assignedDevId) ?? "-"
        : undefined,
      assignedQaName: ticket.assignedQaId
        ? userNameById.get(ticket.assignedQaId) ?? "-"
        : undefined,
      developmentEstimation: ticket.developmentEstimation,
      estimationTesting: ticket.estimationTesting,
      devTimeSpent: ticket.devTimeSpent,
      testingTimeSpent: ticket.testingTimeSpent,
    }));
  }, [editableTickets, userNameById]);

  const allocationMembers: AllocationMember[] = useMemo(() => {
    if (!team) return [];

    return (team.users ?? []).map((user) => ({
      userId: user.userId,
      name: user.name ?? "Unknown",
      role: user.role === "QA" ? "QA" : "DEVS",
      hoursPerDay: Number(user.hoursPerDay ?? 0),
      leave: user.leave ?? [],
    }));
  }, [team]);

  const ticketCommitInputs: TicketCommitInput[] = useMemo(
    () =>
      editableTickets.map((ticket) => ({
        assignedDevId: ticket.assignedDevId,
        assignedQaId: ticket.assignedQaId,
        developmentEstimation: ticket.developmentEstimation,
        estimationTesting: ticket.estimationTesting,
        devTimeSpent: ticket.devTimeSpent,
        testingTimeSpent: ticket.testingTimeSpent,
      })),
    [editableTickets],
  );

  const memberAllocation = useMemo(() => {
    if (!sprint) {
      return {
        byMember: [] as MemberAllocationRow[],
        totalSprintCapacity: 0,
        totalCommitted: 0,
        totalTimeSpent: 0,
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
    return sprint.dayOff.map((dayOff) => normalizeDate(dayOff.date));
  }, [sprint]);

  const timelineMembers: SprintTeamMember[] = useMemo(() => {
    if (!team) return [];

    return (team.users ?? []).map((user) => ({
      userId: user.userId,
      name: user.name ?? "Member",
      role: user.role === "QA" ? "QA" : "DEVS",
      allocationPercentage: user.allocationPercentage ?? 100,
      leave: user.leave ?? [],
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

  const buildOverviewUrl = () => {
    const params = new URLSearchParams();
    if (sprint?.projectId) params.set("projectId", sprint.projectId);
    if (sprint?.projectName) params.set("projectName", sprint.projectName);
    const query = params.toString();
    return query ? `/sprints/${sprintId}?${query}` : `/sprints/${sprintId}`;
  };

  const buildSubpageUrl = (path: "capacity-planning" | "create-teams") => {
    const params = new URLSearchParams();
    if (sprint?.projectId) params.set("projectId", sprint.projectId);
    if (sprint?.projectName) params.set("projectName", sprint.projectName);
    if (path === "capacity-planning") {
      params.set("backTo", "overview");
    }
    if (path === "create-teams" && team?.id) {
      params.set("teamId", team.id);
    }
    if (path === "create-teams" && sprint?.name) {
      params.set("sprintName", sprint.name);
    }
    const query = params.toString();
    return query ? `/sprints/${sprintId}/${path}?${query}` : `/sprints/${sprintId}/${path}`;
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
    buildOverviewUrl,
    buildSubpageUrl,
  };
}
