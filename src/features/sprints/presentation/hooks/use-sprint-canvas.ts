"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LeaveType } from "@/features/teams/domain/types/team-types";
import { useSprintById } from "./use-sprint-by-id";
import { useSprintAttachedTickets } from "./use-sprint-attached-tickets";
import { useTeams } from "@/features/teams/presentation/hooks/use-teams";
import { teamService } from "@/features/teams/infrastructure/team-service";
import { teamKeys } from "@/features/teams/presentation/queries/team-keys";
import { useProjectMembers } from "@/features/projects/presentation/hooks/use-project-members";
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

function isActiveMemberStatus(status: boolean | string | undefined): boolean {
  if (typeof status === "string") {
    return status.toLowerCase() === "true";
  }

  return Boolean(status);
}

export function useSprintCanvas(sprintId: string) {
  const router = useRouter();
  const sprintQuery = useSprintById(sprintId);
  const sprint = sprintQuery.data;

  const teamsQuery = useTeams({ sprintId, size: 50 }, Boolean(sprintId));
  const listTeam = teamsQuery.data?.content?.[0] ?? null;
  const teamDetailQuery = useQuery({
    queryKey: teamKeys.detail(listTeam?.id ?? "__disabled__"),
    queryFn: () => teamService.getTeamById.execute(listTeam!.id),
    enabled: Boolean(listTeam?.id),
    staleTime: 1000 * 60 * 5,
  });
  const team = teamDetailQuery.data ?? listTeam;
  const projectMembersQuery = useProjectMembers(sprint?.projectId ?? null);

  const teamUsers = useMemo(() => {
    if ((team?.users?.length ?? 0) > 0) {
      return team?.users ?? [];
    }

    const hoursPerDay = Number(sprint?.workingHoursDay ?? 0);

    return (projectMembersQuery.data ?? [])
      .filter((member) => isActiveMemberStatus(member.status))
      .map((member) => ({
        userId: member.id,
        name: member.name,
        allocationPercentage: 100,
        hoursPerDay,
        role: member.role === "QA" ? "QA" : "DEVS",
        leave: [],
      }));
  }, [projectMembersQuery.data, sprint?.workingHoursDay, team?.users]);

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
    for (const user of teamUsers) {
      lookup.set(user.userId, user.name ?? "");
    }
    return lookup;
  }, [teamUsers]);

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
    return teamUsers.map((user) => ({
      userId: user.userId,
      name: user.name ?? "Unknown",
      role: user.role === "QA" ? "QA" : "DEVS",
      hoursPerDay: Number(user.hoursPerDay ?? 0),
      leave: user.leave ?? [],
    }));
  }, [teamUsers]);

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
    return teamUsers.map((user) => ({
      userId: user.userId,
      name: user.name ?? "Member",
      role: user.role === "QA" ? "QA" : "DEVS",
      allocationPercentage: user.allocationPercentage ?? 100,
      leave: user.leave ?? [],
    }));
  }, [teamUsers]);

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
    teamDetailQuery.isLoading ||
    (!team && projectMembersQuery.isLoading) ||
    (Boolean(sprint?.projectId) && attachedTicketsQuery.isLoading);

  return {
    sprint,
    team,
    teamUsers,
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
