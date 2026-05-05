"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarRange,
  Clock,
  FolderKanban,
  Layers,
  Loader2,
  UserCog,
  Users,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LeaveType,
  type LeaveDays,
} from "@/features/teams/domain/types/team-types";
import { SprintTeamsTimeline } from "./sprint-teams/sprint-teams-timeline";
import { useSprintCanvas } from "../hooks/use-sprint-canvas";
import { sprintAttachedTicketsQueryKey } from "../hooks/use-sprint-attached-tickets";
import {
  computeMemberAllocationMetrics,
  type AllocationMember,
  type TicketCommitInput,
  utilizationBarClass,
} from "../utils/sprint-member-allocation-metrics";
import {
  canCompleteSprint,
  getSprintStatusLabel,
  isSprintViewOnly,
} from "../utils/sprint-control-utils";
import { extractErrorMessage } from "@/lib/api-error";
import { teamService } from "@/features/teams/infrastructure/team-service";
import { ticketService } from "@/features/tickets/infrastructure/ticket-service";
import { sprintOverviewApi } from "@/features/sprint-overviews/infrastructure/api/sprint-overview-api";
import { storeSprintOverviewId } from "@/features/sprint-overviews/presentation/utils/sprint-overview-storage";
import { sprintService } from "../../infrastructure/sprint-service";
import { teamKeys } from "@/features/teams/presentation/queries/team-keys";
import { sprintKeys } from "../queries/sprint-keys";
import { projectKeys } from "@/features/projects/presentation/queries/project-keys";
import { ticketKeys } from "@/features/tickets/presentation/queries/ticket-keys";
import {
  TICKET_STATUS_LABELS,
  ticketStatusLabel,
} from "@/features/tickets/presentation/utils/ticket-status-ui";
import type { TicketStatus } from "@/features/tickets/domain/types/ticket-types";
import type { EditableSprintTicket } from "../utils/sprint-ticket-planning";
import type { CreateSprintOverviewDTO } from "@/features/sprint-overviews/domain/types/sprint-overview-types";

function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  try {
    return format(new Date(date), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "—";
  try {
    return format(new Date(date), "MMM d, yyyy · HH:mm");
  } catch {
    return "—";
  }
}

interface SprintCanvasPageProps {
  sprintId: string;
  mode?: "overview" | "complete";
}

type ReviewMember = {
  userId: string;
  name: string;
  role: "QA" | "DEVS";
  allocationPercentage: number;
  hoursPerDay: number;
  leave?: LeaveDays[];
};

const TICKET_STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "inProgress",
  "done",
  "cancelled",
];

function roundToTenths(value: number) {
  return Math.round(value * 10) / 10;
}

function roundToHundredths(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeDateKey(date: string) {
  return date.split("T")[0];
}

function toUtcMidnightIso(date: string) {
  return `${normalizeDateKey(date)}T00:00:00Z`;
}

function getLeaveTimelineStatus(type: LeaveType) {
  switch (type) {
    case LeaveType.SICK_LEAVE:
      return "S";
    case LeaveType.VACATION_LEAVE:
      return "V";
    case LeaveType.WHOLE_DAY_LEAVE:
      return "W";
    case LeaveType.HALF_DAY_LEAVE:
      return "H";
    default:
      return "O";
  }
}

function resolveFinalizedBy() {
  if (typeof window === "undefined") {
    return "Admin User";
  }

  const candidateKeys = [
    "userName",
    "username",
    "fullName",
    "name",
    "authUserName",
    "auth_user_name",
  ];

  for (const key of candidateKeys) {
    const value = window.localStorage.getItem(key)?.trim();
    if (value) {
      return value;
    }
  }

  return "Admin User";
}

function upsertLeave(
  leave: LeaveDays[] | undefined,
  date: string,
  type: LeaveType,
): LeaveDays[] {
  const normalizedDate = normalizeDateKey(date);
  const next = (leave ?? []).filter(
    (entry) => normalizeDateKey(entry.leaveDate) !== normalizedDate,
  );
  next.push({
    leaveDate: normalizedDate,
    leaveType: [type],
  });
  return next.sort((a, b) => a.leaveDate.localeCompare(b.leaveDate));
}

function removeLeaveEntry(
  leave: LeaveDays[] | undefined,
  date: string,
): LeaveDays[] {
  const normalizedDate = normalizeDateKey(date);
  return (leave ?? []).filter(
    (entry) => normalizeDateKey(entry.leaveDate) !== normalizedDate,
  );
}

function buildReviewMembers(
  users: NonNullable<
    ReturnType<typeof useSprintCanvas>["team"]
  >["users"] = [],
): ReviewMember[] {
  return users.map((user) => ({
    userId: user.userId,
    name: user.name ?? "Member",
    role: user.role === "QA" ? "QA" : "DEVS",
    allocationPercentage: Number(user.allocationPercentage ?? 100),
    hoursPerDay: roundToTenths(Number(user.hoursPerDay ?? 0)),
    leave: user.leave ?? [],
  }));
}

function buildReviewTickets(tickets: EditableSprintTicket[]) {
  return tickets.map((ticket) => ({ ...ticket }));
}

export function SprintCanvasPage({
  sprintId,
  mode = "overview",
}: SprintCanvasPageProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [reviewMembers, setReviewMembers] = useState<ReviewMember[]>([]);
  const [reviewTickets, setReviewTickets] = useState<EditableSprintTicket[]>([]);
  const [reviewInitialized, setReviewInitialized] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleteMode = mode === "complete";

  const noopSetLeave = useCallback<
    (userId: string, date: string, type: LeaveType) => void
  >(() => {}, []);
  const noopRemoveLeave = useCallback<
    (userId: string, date: string) => void
  >(() => {}, []);
  const passthroughLeave = useCallback(
    (_userId: string, _date: string, originalType?: LeaveType) => originalType,
    [],
  );

  const {
    sprint,
    team,
    tickets,
    editableTickets,
    memberAllocation,
    sprintDays,
    dayOffDates,
    timelineMembers,
    getEffectiveLeaveReadonly,
    isLoading,
    goBackToSprintList,
    buildSubpageUrl,
  } = useSprintCanvas(sprintId);

  useEffect(() => {
    if (!isCompleteMode || isLoading || !sprint || reviewInitialized) {
      return;
    }

    setReviewMembers(buildReviewMembers(team?.users ?? []));
    setReviewTickets(buildReviewTickets(editableTickets));
    setReviewInitialized(true);
  }, [
    editableTickets,
    isCompleteMode,
    isLoading,
    reviewInitialized,
    sprint,
    team?.users,
  ]);

  const displayedMembers = isCompleteMode ? reviewMembers : [];

  const displayTickets = useMemo(() => {
    if (!isCompleteMode) {
      return tickets;
    }

    const memberNameById = new Map(
      reviewMembers.map((member) => [member.userId, member.name] as const),
    );

    return reviewTickets.map((ticket) => ({
      id: ticket.ticketId,
      ticketNumber: ticket.ticketNumber,
      ticketTitle: ticket.title,
      status: ticket.status,
      assignedDevName: ticket.assignedDevId
        ? memberNameById.get(ticket.assignedDevId) ?? "—"
        : "—",
      assignedQaName: ticket.assignedQaId
        ? memberNameById.get(ticket.assignedQaId) ?? "—"
        : "—",
      developmentEstimation: ticket.developmentEstimation,
      estimationTesting: ticket.estimationTesting,
      devTimeSpent: ticket.devTimeSpent,
      testingTimeSpent: ticket.testingTimeSpent,
    }));
  }, [isCompleteMode, reviewMembers, reviewTickets, tickets]);

  const editableMemberAllocation = useMemo(() => {
    if (!isCompleteMode || !sprint) {
      return memberAllocation;
    }

    const allocationMembers: AllocationMember[] = reviewMembers.map((member) => ({
      userId: member.userId,
      name: member.name,
      role: member.role,
      hoursPerDay: member.hoursPerDay,
      leave: member.leave ?? [],
    }));

    const ticketCommitInputs: TicketCommitInput[] = reviewTickets.map((ticket) => ({
      assignedDevId: ticket.assignedDevId,
      assignedQaId: ticket.assignedQaId,
      developmentEstimation: ticket.developmentEstimation,
      estimationTesting: ticket.estimationTesting,
      devTimeSpent: ticket.devTimeSpent,
      testingTimeSpent: ticket.testingTimeSpent,
    }));

    return computeMemberAllocationMetrics(
      sprint,
      allocationMembers,
      ticketCommitInputs,
    );
  }, [isCompleteMode, memberAllocation, reviewMembers, reviewTickets, sprint]);

  const displayMemberAllocation = isCompleteMode
    ? editableMemberAllocation
    : memberAllocation;

  const displayTimelineMembers = isCompleteMode ? displayedMembers : timelineMembers;

  const handleHoursPerDayChange = useCallback(
    (userId: string, value: string) => {
      if (!sprint) {
        return;
      }

      const parsedValue = Number(value);
      const nextHours =
        Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
      const clampedHours = roundToTenths(
        Math.min(nextHours, Number(sprint.workingHoursDay ?? 0)),
      );
      const allocationPercentage =
        sprint.workingHoursDay > 0
          ? roundToTenths((clampedHours / sprint.workingHoursDay) * 100)
          : 0;

      setReviewMembers((current) =>
        current.map((member) =>
          member.userId === userId
            ? {
                ...member,
                hoursPerDay: clampedHours,
                allocationPercentage,
              }
            : member,
        ),
      );
    },
    [sprint],
  );

  const handleSetLeave = useCallback(
    (userId: string, date: string, type: LeaveType) => {
      setReviewMembers((current) =>
        current.map((member) =>
          member.userId === userId
            ? {
                ...member,
                leave: upsertLeave(member.leave, date, type),
              }
            : member,
        ),
      );
    },
    [],
  );

  const handleRemoveLeave = useCallback((userId: string, date: string) => {
    setReviewMembers((current) =>
      current.map((member) =>
        member.userId === userId
          ? {
              ...member,
              leave: removeLeaveEntry(member.leave, date),
            }
          : member,
      ),
    );
  }, []);

  const handleTicketStatusChange = useCallback(
    (ticketId: string, status: TicketStatus) => {
      setReviewTickets((current) =>
        current.map((ticket) =>
          ticket.ticketId === ticketId ? { ...ticket, status } : ticket,
        ),
      );
    },
    [],
  );

  const handleTicketSpentChange = useCallback(
    (
      ticketId: string,
      field: "devTimeSpent" | "testingTimeSpent",
      value: string,
    ) => {
      const parsedValue = Number(value);
      const nextValue =
        Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;

      setReviewTickets((current) =>
        current.map((ticket) =>
          ticket.ticketId === ticketId
            ? {
                ...ticket,
                [field]: roundToTenths(nextValue),
              }
            : ticket,
        ),
      );
    },
    [],
  );

  if (isLoading || !sprint || (isCompleteMode && !reviewInitialized)) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">
          {isCompleteMode ? "Loading sprint completion…" : "Loading sprint canvas…"}
        </span>
      </div>
    );
  }

  const dayOffCount = sprint.dayOff?.length ?? 0;
  const statusLabel = getSprintStatusLabel(sprint);
  const sprintLocked = isSprintViewOnly(sprint);
  const canComplete = canCompleteSprint(sprint);

  const completionMessage =
    sprint.status === "completed"
      ? "This sprint has already been completed."
      : canComplete
        ? "Any changes you made below will be saved before the sprint is marked complete."
        : "Only active or previously started paused sprints can be completed.";

  const buildSprintOverviewPayload = (): CreateSprintOverviewDTO => {
    const finalizedAt = new Date().toISOString();
    const memberMetricById = new Map(
      displayMemberAllocation.byMember.map((member) => [member.userId, member] as const),
    );

    return {
      projectId: sprint.projectId,
      projectName: sprint.projectName ?? "",
      sprintId: sprint.id,
      sprintName: sprint.name,
      sprintStatus: "completed",
      planningStatus: "locked",
      planningStart: sprint.startDate,
      planningEnd: sprint.endDate,
      workingDays: sprint.sprintDuration,
      actualStart: sprint.officialStartDate,
      actualEnd: finalizedAt,
      teamRhythm: sprint.workingHoursDay,
      holidays: (sprint.dayOff ?? []).map((dayOff) => ({
        name: dayOff.label,
        date: toUtcMidnightIso(dayOff.date),
      })),
      teamId: team?.id ?? "",
      finalizedAt,
      finalizedBy: resolveFinalizedBy(),
      summary: {
        totalCapacity: displayMemberAllocation.totalSprintCapacity,
        totalCommitted: displayMemberAllocation.totalCommitted,
        totalAvailable: displayMemberAllocation.totalAvailable,
        totalSpent: displayMemberAllocation.totalTimeSpent,
        utilization:
          displayMemberAllocation.totalSprintCapacity > 0
            ? roundToHundredths(
                (displayMemberAllocation.totalTimeSpent /
                  displayMemberAllocation.totalSprintCapacity) *
                  100,
              )
            : 0,
      },
      memberMetrics: reviewMembers.map((member) => {
        const metrics = memberMetricById.get(member.userId);
        const leaveStatusByDate = new Map<string, string>();

        for (const holiday of sprint.dayOff ?? []) {
          leaveStatusByDate.set(normalizeDateKey(holiday.date), "OFF");
        }

        for (const leave of member.leave ?? []) {
          const leaveType = leave.leaveType[0];
          if (!leaveType) {
            continue;
          }
          leaveStatusByDate.set(
            normalizeDateKey(leave.leaveDate),
            getLeaveTimelineStatus(leaveType),
          );
        }

        return {
          userId: member.userId,
          name: member.name,
          role: member.role,
          rhythm: member.hoursPerDay,
          sprintCapacity: metrics?.sprintCapacity ?? 0,
          committedCapacity: metrics?.committed ?? 0,
          availableCapacity: metrics?.available ?? 0,
          timeSpent: metrics?.timeSpent ?? 0,
          utilization: metrics?.utilization ?? 0,
          leaveTimeline: Array.from(leaveStatusByDate.entries())
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([date, status]) => ({
              date: toUtcMidnightIso(date),
              status,
            })),
        };
      }),
      sprintTickets: displayTickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.ticketTitle,
        status: ticket.status as TicketStatus,
        devName: ticket.assignedDevName ?? "—",
        qaName: ticket.assignedQaName ?? "—",
        devEstimate: ticket.developmentEstimation ?? 0,
        qaEstimate: ticket.estimationTesting ?? 0,
        devSpent: ticket.devTimeSpent ?? 0,
        qaSpent: ticket.testingTimeSpent ?? 0,
      })),
    };
  };

  const handleCompleteSprint = async () => {
    if (!canComplete || isCompleting) {
      return;
    }

    if (!team?.id) {
      toast.error("A team is required before you can finalize this sprint.");
      return;
    }

    setIsCompleting(true);

    try {
      if (team?.id && reviewMembers.length > 0) {
        await teamService.updateTeam.execute(team.id, {
          userIds: reviewMembers.map((member) => ({
            userId: member.userId,
            role: member.role,
            allocationPercentage: member.allocationPercentage,
            hoursPerDay: member.hoursPerDay,
            leave: member.leave ?? [],
          })),
        });
      }

      if (reviewTickets.length > 0) {
        await ticketService.bulkUpdateTickets.execute(
          reviewTickets.map((ticket) => ({
            id: ticket.ticketId,
            status: ticket.status,
            devTimeSpent: ticket.devTimeSpent,
            testingTimeSpent: ticket.testingTimeSpent,
          })),
        );
      }

      const overview = await sprintOverviewApi.createSprintOverview(
        buildSprintOverviewPayload(),
      );

      await sprintService.updateSprint.execute(sprint.id, {
        status: "completed",
        officialEndDate: new Date().toISOString(),
      });

      const resolvedOverview =
        overview ?? (await sprintOverviewApi.findSprintOverviewBySprintId(sprint.id));
      if (resolvedOverview?.id) {
        storeSprintOverviewId(sprint.id, resolvedOverview.id);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sprintKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: sprintKeys.detail(sprint.id) }),
        queryClient.invalidateQueries({ queryKey: teamKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: projectKeys.members(sprint.projectId),
        }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
        queryClient.invalidateQueries({
          queryKey: sprintAttachedTicketsQueryKey({
            sprintId: sprint.id,
            projectId: sprint.projectId,
            teamId: team?.id ?? null,
          }),
        }),
      ]);

      toast.success("Sprint completed successfully");
      goBackToSprintList();
    } catch (error) {
      toast.error(extractErrorMessage(error) || "Failed to complete sprint");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border/80 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={goBackToSprintList}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sprints
          </Button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isCompleteMode ? "Sprint completion" : "Sprint canvas"}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {sprint.name}
            </h1>
            {sprint.projectName ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <FolderKanban className="h-4 w-4 shrink-0" />
                {sprint.projectName}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {statusLabel}
          </Badge>
          {sprintLocked ? (
            <Badge variant="outline" className="text-xs">
              Planning locked
            </Badge>
          ) : null}
          {!isCompleteMode ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={buildSubpageUrl("create-teams")} prefetch={false}>
                  <UserCog className="mr-2 h-4 w-4" />
                  {team
                    ? sprintLocked
                      ? "View team"
                      : "Manage team"
                    : "Create team"}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link
                  href={buildSubpageUrl("capacity-planning")}
                  prefetch={false}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  {sprintLocked ? "View capacity" : "Plan capacity"}
                </Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-muted/15 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            Planning window
          </p>
          <p className="text-sm text-foreground">
            {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {sprint.sprintDuration} working days
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/15 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Official Start | End Dates
          </p>
          <p className="text-sm text-foreground">
            Start: {formatDateTime(sprint.officialStartDate)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            End: {formatDateTime(sprint.officialEndDate)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Rhythm
          </p>
          <p className="text-lg font-semibold text-foreground">
            {sprint.workingHoursDay}h / day
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Team days off (sprint holidays)
          </p>
          {dayOffCount === 0 ? (
            <p className="text-sm font-semibold text-foreground">None</p>
          ) : (
            <ul className="mt-2 max-h-32 space-y-1.5 overflow-y-auto text-sm">
              {(sprint.dayOff ?? []).map((dayOff, index) => (
                <li
                  key={`${dayOff.date}-${index}`}
                  className="flex justify-between gap-2 border-b border-border/40 pb-1 last:border-0"
                >
                  <span className="font-medium text-foreground">
                    {dayOff.label}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(dayOff.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!team || (isCompleteMode && displayedMembers.length === 0) ? (
            <p className="text-sm text-muted-foreground">
              No team for this sprint yet. Create a team to assign members
              before starting the sprint.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border border-border">
              {(isCompleteMode ? displayedMembers : team.users ?? []).map((member) => (
                <li
                  key={member.userId}
                  className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{member.name ?? "Member"}</span>
                    {isCompleteMode ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.allocationPercentage}% allocation
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{member.role}</Badge>
                    {isCompleteMode ? (
                      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={sprint.workingHoursDay}
                          step="0.5"
                          value={member.hoursPerDay}
                          onChange={(event) =>
                            handleHoursPerDayChange(
                              member.userId,
                              event.target.value,
                            )
                          }
                          className="h-8 w-20 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                        />
                        <span className="text-xs text-muted-foreground">
                          h / day
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {member.hoursPerDay}h / day
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {!isMobile && sprintDays.length > 0 && displayTimelineMembers.length > 0 ? (
        <Card className="min-h-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Leave &amp; holidays timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {isCompleteMode
                ? "Click a member day to review or update leave before completing the sprint."
                : "Sprint holidays (OFF) and each member&apos;s leave across the sprint window. Read-only on this overview."}
            </p>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <SprintTeamsTimeline
              members={displayTimelineMembers}
              days={sprintDays}
              dayOffs={dayOffDates}
              isMobile={isMobile}
              hoveredUserId={hoveredUserId}
              onHover={setHoveredUserId}
              getEffectiveLeave={
                isCompleteMode ? passthroughLeave : getEffectiveLeaveReadonly
              }
              onSetLeave={isCompleteMode ? handleSetLeave : noopSetLeave}
              onRemoveLeave={isCompleteMode ? handleRemoveLeave : noopRemoveLeave}
              readOnly={!isCompleteMode}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Member allocation</CardTitle>
          <p className="text-xs text-muted-foreground">
            Capacity vs committed hours from tickets (same logic as capacity
            planner).
          </p>
        </CardHeader>
        <CardContent>
          {!team || displayMemberAllocation.byMember.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a team to see per-member capacity and utilization.
            </p>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total sprint capacity
                  </p>
                  <p className="text-lg font-semibold">
                    {displayMemberAllocation.totalSprintCapacity}h
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total committed
                  </p>
                  <p className="text-lg font-semibold">
                    {displayMemberAllocation.totalCommitted}h
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total available
                  </p>
                  <p className="text-lg font-semibold">
                    {displayMemberAllocation.totalAvailable}h
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total time spent
                  </p>
                  <p className="text-lg font-semibold">
                    {displayMemberAllocation.totalTimeSpent}h
                  </p>
                </div>
              </div>
              {displayMemberAllocation.hasOverCapacity ? (
                <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Over capacity: one or more members exceed available hours.
                </div>
              ) : null}
              <div className="overflow-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Member</th>
                      <th className="px-2 py-2 text-left">Sprint capacity</th>
                      <th className="px-2 py-2 text-left">Committed</th>
                      <th className="px-2 py-2 text-left">Available</th>
                      <th className="px-2 py-2 text-left">Time spent</th>
                      <th className="px-2 py-2 text-left">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayMemberAllocation.byMember.map((member) => (
                      <tr key={member.userId} className="border-b">
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                            <Badge
                              variant={
                                member.role === "QA" ? "secondary" : "default"
                              }
                            >
                              {member.role}
                            </Badge>
                            {member.isZeroCapacity ? (
                              <Badge
                                variant="destructive"
                                className="text-[10px]"
                              >
                                0 capacity
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-2 py-2">{member.sprintCapacity}h</td>
                        <td className="px-2 py-2">{member.committed}h</td>
                        <td
                          className={
                            member.available < 0
                              ? "px-2 py-2 text-destructive"
                              : "px-2 py-2"
                          }
                        >
                          {member.available}h
                        </td>
                        <td className="px-2 py-2">{member.timeSpent}h</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-40 max-w-[min(10rem,40vw)] overflow-hidden rounded bg-muted">
                              <div
                                className={`h-2 ${utilizationBarClass(member.utilization)}`}
                                style={{
                                  width: `${Math.min(member.utilization, 100)}%`,
                                }}
                              />
                            </div>
                            <span>{member.utilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="min-h-0">
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">Title</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Dev</th>
                  <th className="px-2 py-2 text-left">QA</th>
                  <th className="px-2 py-2 text-right">Dev Est.</th>
                  <th className="px-2 py-2 text-right">QA Est.</th>
                  <th className="px-2 py-2 text-right">Dev Spent</th>
                  <th className="px-2 py-2 text-right">QA Spent</th>
                </tr>
              </thead>
              <tbody>
                {displayTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-2 py-10 text-center text-muted-foreground"
                    >
                      No tickets linked to this sprint. Assign tickets in Plan
                      capacity.
                    </td>
                  </tr>
                ) : (
                  displayTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b">
                      <td className="px-2 py-2 font-mono text-xs">
                        {ticket.ticketNumber}
                      </td>
                      <td className="max-w-[240px] px-2 py-2">
                        <span className="line-clamp-2">{ticket.ticketTitle}</span>
                      </td>
                      <td className="px-2 py-2">
                        {isCompleteMode ? (
                          <select
                            className="h-9 rounded border border-border bg-background px-2 text-sm"
                            value={ticket.status}
                            onChange={(event) =>
                              handleTicketStatusChange(
                                ticket.id,
                                event.target.value as TicketStatus,
                              )
                            }
                          >
                            {TICKET_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {TICKET_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant="outline" className="font-normal">
                            {ticketStatusLabel(ticket.status as TicketStatus)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {ticket.assignedDevName ?? "—"}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {ticket.assignedQaName ?? "—"}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {ticket.developmentEstimation ?? 0}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {ticket.estimationTesting ?? 0}
                      </td>
                      <td className="px-2 py-2">
                        {isCompleteMode ? (
                          <Input
                            type="number"
                            min={0}
                            step="0.5"
                            value={ticket.devTimeSpent ?? 0}
                            onChange={(event) =>
                              handleTicketSpentChange(
                                ticket.id,
                                "devTimeSpent",
                                event.target.value,
                              )
                            }
                            className="ml-auto h-9 w-24 text-right font-mono"
                          />
                        ) : (
                          <div className="text-right font-mono">
                            {ticket.devTimeSpent ?? 0}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {isCompleteMode ? (
                          <Input
                            type="number"
                            min={0}
                            step="0.5"
                            value={ticket.testingTimeSpent ?? 0}
                            onChange={(event) =>
                              handleTicketSpentChange(
                                ticket.id,
                                "testingTimeSpent",
                                event.target.value,
                              )
                            }
                            className="ml-auto h-9 w-24 text-right font-mono"
                          />
                        ) : (
                          <div className="text-right font-mono">
                            {ticket.testingTimeSpent ?? 0}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isCompleteMode ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Complete this sprint
              </p>
              <p className="text-sm text-muted-foreground">
                {completionMessage}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleCompleteSprint}
              disabled={!canComplete || isCompleting}
            >
              {isCompleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {isCompleting ? "Completing..." : "Complete Sprint"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
