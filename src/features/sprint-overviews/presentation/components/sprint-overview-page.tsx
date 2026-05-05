"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  FolderKanban,
  Layers,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ticketStatusLabel } from "@/features/tickets/presentation/utils/ticket-status-ui";
import { utilizationBarClass } from "@/features/sprints/presentation/utils/sprint-member-allocation-metrics";
import { SprintTeamsTimeline } from "@/features/sprints/presentation/components/sprint-teams/sprint-teams-timeline";
import { getSprintDays, normalizeDate } from "@/features/sprints/presentation/utils/sprint-date-utils";
import type { SprintTeamMember } from "@/features/sprints/presentation/types/sprint-team-member";
import { useSprintOverview } from "../hooks/use-sprint-overview";
import { useSprintOverviewBySprint } from "../hooks/use-sprint-overview-by-sprint";
import { storeSprintOverviewId } from "../utils/sprint-overview-storage";
import { LeaveType, type LeaveDays } from "@/features/teams/domain/types/team-types";

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

interface SprintOverviewPageProps {
  overviewId: string;
}

function mapLeaveStatusToType(status: string): LeaveType | undefined {
  switch (status) {
    case "S":
      return LeaveType.SICK_LEAVE;
    case "V":
      return LeaveType.VACATION_LEAVE;
    case "W":
      return LeaveType.WHOLE_DAY_LEAVE;
    case "H":
      return LeaveType.HALF_DAY_LEAVE;
    case "O":
      return LeaveType.OTHER_LEAVE;
    default:
      return undefined;
  }
}

export function SprintOverviewPage({ overviewId }: SprintOverviewPageProps) {
  const router = useRouter();
  const { data: overview, isLoading, isError } = useSprintOverview(overviewId);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  useEffect(() => {
    if (overview?.sprintId && overview.id) {
      storeSprintOverviewId(overview.sprintId, overview.id);
    }
  }, [overview]);

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

  const holidays = useMemo(() => {
    const source = overview?.holidays ?? [];
    const seen = new Set<string>();
    return source.filter((holiday) => {
      const key = `${holiday.name}-${normalizeDate(holiday.date)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [overview?.holidays]);

  const timelineDays = useMemo(() => {
    if (!overview?.planningStart || !overview?.planningEnd) {
      return [];
    }

    return getSprintDays(overview.planningStart, overview.planningEnd);
  }, [overview]);

  const holidayDates = useMemo(
    () => Array.from(new Set(holidays.map((holiday) => normalizeDate(holiday.date)))),
    [holidays],
  );

  const timelineMembers = useMemo<SprintTeamMember[]>(() => {
    if (!overview) {
      return [];
    }

    return overview.memberMetrics.map((member) => {
      const leave: LeaveDays[] = member.leaveTimeline
        .filter((item) => item.status !== "OFF")
        .map((item) => {
          const leaveType = mapLeaveStatusToType(item.status);
          return leaveType
            ? {
                leaveDate: normalizeDate(item.date),
                leaveType: [leaveType],
              }
            : null;
        })
        .filter((item): item is LeaveDays => Boolean(item));

      const allocationPercentage =
        overview.teamRhythm > 0
          ? Math.min(100, Math.max(0, (member.rhythm / overview.teamRhythm) * 100))
          : 0;

      return {
        userId: member.userId,
        name: member.name,
        role: member.role,
        allocationPercentage,
        leave,
      };
    });
  }, [overview]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading sprint overview…</span>
      </div>
    );
  }

  if (!overview || isError) {
    return (
      <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Sprint overview not found.
        </p>
        <Button variant="outline" onClick={() => router.push("/sprints")}>
          Back to sprints
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border/80 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={() => router.push("/sprints")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sprints
          </Button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sprint overview
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {overview.sprintName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4 shrink-0" />
              {overview.projectName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Finalized by {overview.finalizedBy} on {formatDateTime(overview.finalizedAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            Completed
          </Badge>
          <Badge variant="outline" className="text-xs">
            {overview.planningStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-muted/15 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            Planning window
          </p>
          <p className="text-sm text-foreground">
            {formatDate(overview.planningStart)} → {formatDate(overview.planningEnd)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {overview.workingDays} working days
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/15 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Actual Start | End Dates
          </p>
          <p className="text-sm text-foreground">
            Start: {formatDateTime(overview.actualStart)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            End: {formatDateTime(overview.actualEnd)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Team rhythm
          </p>
          <p className="text-lg font-semibold text-foreground">
            {overview.teamRhythm}h / day
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Sprint holidays
          </p>
          {holidays.length === 0 ? (
            <p className="text-sm font-semibold text-foreground">None</p>
          ) : (
            <ul className="mt-2 max-h-32 space-y-1.5 overflow-y-auto text-sm">
              {holidays.map((holiday, index) => (
                <li
                  key={`${holiday.name}-${holiday.date}-${index}`}
                  className="flex justify-between gap-2 border-b border-border/40 pb-1 last:border-0"
                >
                  <span className="font-medium text-foreground">
                    {holiday.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(holiday.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {timelineDays.length > 0 && timelineMembers.length > 0 ? (
        <Card className="min-h-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Leave &amp; holidays timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Final leave and holiday distribution captured for this completed sprint.
            </p>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <SprintTeamsTimeline
              members={timelineMembers}
              days={timelineDays}
              dayOffs={holidayDates}
              isMobile={false}
              hoveredUserId={hoveredUserId}
              onHover={setHoveredUserId}
              getEffectiveLeave={passthroughLeave}
              onSetLeave={noopSetLeave}
              onRemoveLeave={noopRemoveLeave}
              readOnly
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y rounded-lg border border-border">
            {overview.memberMetrics.map((member) => (
              <li
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="font-medium">{member.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{member.role}</Badge>
                  <span className="text-muted-foreground">
                    {member.rhythm}h / day
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Member allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-5">
            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                Total sprint capacity
              </p>
              <p className="text-lg font-semibold">
                {overview.summary.totalCapacity}h
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                Total committed
              </p>
              <p className="text-lg font-semibold">
                {overview.summary.totalCommitted}h
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                Total available
              </p>
              <p className="text-lg font-semibold">
                {overview.summary.totalAvailable}h
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                Total time spent
              </p>
              <p className="text-lg font-semibold">
                {overview.summary.totalSpent}h
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                Utilization
              </p>
              <p className="text-lg font-semibold">
                {overview.summary.utilization}%
              </p>
            </div>
          </div>

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
                {overview.memberMetrics.map((member) => (
                  <tr key={member.userId} className="border-b">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span>{member.name}</span>
                        <Badge
                          variant={member.role === "QA" ? "secondary" : "default"}
                        >
                          {member.role}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-2 py-2">{member.sprintCapacity}h</td>
                    <td className="px-2 py-2">{member.committedCapacity}h</td>
                    <td className="px-2 py-2">{member.availableCapacity}h</td>
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
                {overview.sprintTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-2 py-10 text-center text-muted-foreground"
                    >
                      No tickets recorded in this sprint overview.
                    </td>
                  </tr>
                ) : (
                  overview.sprintTickets.map((ticket) => (
                    <tr key={`${ticket.id}-${ticket.ticketNumber}`} className="border-b">
                      <td className="px-2 py-2 font-mono text-xs">
                        {ticket.ticketNumber}
                      </td>
                      <td className="max-w-[240px] px-2 py-2">
                        <span className="line-clamp-2">{ticket.title}</span>
                      </td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="font-normal">
                          {ticketStatusLabel(ticket.status)}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {ticket.devName || "—"}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {ticket.qaName || "—"}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {ticket.devEstimate}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {ticket.qaEstimate}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {ticket.devSpent}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {ticket.qaSpent}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SprintOverviewBySprintPageProps {
  sprintId: string;
}

export function SprintOverviewBySprintPage({
  sprintId,
}: SprintOverviewBySprintPageProps) {
  const router = useRouter();
  const { data: overview, isLoading, isError } = useSprintOverviewBySprint(sprintId);

  useEffect(() => {
    if (overview?.id) {
      storeSprintOverviewId(sprintId, overview.id);
      router.replace(`/sprint-overviews/${overview.id}`);
    }
  }, [overview, router, sprintId]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading sprint overview…</span>
      </div>
    );
  }

  if (!overview || isError) {
    return (
      <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No sprint overview was found for this completed sprint yet.
        </p>
        <Button variant="outline" onClick={() => router.push("/sprints")}>
          Back to sprints
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Opening sprint overview…</span>
    </div>
  );
}
