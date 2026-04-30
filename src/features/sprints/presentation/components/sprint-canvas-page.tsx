"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { format } from "date-fns";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeaveType } from "@/features/teams/domain/types/team-types";
import { SprintTeamsTimeline } from "./sprint-teams/sprint-teams-timeline";
import { useSprintCanvas } from "../hooks/use-sprint-canvas";
import {
  getSprintStatusLabel,
  isSprintViewOnly,
} from "../utils/sprint-control-utils";
import { utilizationBarClass } from "../utils/sprint-member-allocation-metrics";

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

function ticketStatusLabel(status: string) {
  return status
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

interface SprintCanvasPageProps {
  sprintId: string;
}

export function SprintCanvasPage({ sprintId }: SprintCanvasPageProps) {
  const isMobile = useIsMobile();
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const noopSetLeave = useCallback<
    (userId: string, date: string, type: LeaveType) => void
  >(() => {}, []);
  const noopRemoveLeave = useCallback<
    (userId: string, date: string) => void
  >(() => {}, []);

  const {
    sprint,
    team,
    tickets,
    memberAllocation,
    sprintDays,
    dayOffDates,
    timelineMembers,
    getEffectiveLeaveReadonly,
    isLoading,
    goBackToSprintList,
    buildSubpageUrl,
  } = useSprintCanvas(sprintId);

  if (isLoading || !sprint) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading sprint canvas…</span>
      </div>
    );
  }

  const dayOffCount = sprint.dayOff?.length ?? 0;
  const statusLabel = getSprintStatusLabel(sprint);
  const sprintLocked = isSprintViewOnly(sprint);

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
              Sprint canvas
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
            <Link href={buildSubpageUrl("capacity-planning")} prefetch={false}>
              <Layers className="mr-2 h-4 w-4" />
              {sprintLocked ? "View capacity" : "Plan capacity"}
            </Link>
          </Button>
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
              {(sprint.dayOff ?? []).map((d, i) => (
                <li
                  key={`${d.date}-${i}`}
                  className="flex justify-between gap-2 border-b border-border/40 pb-1 last:border-0"
                >
                  <span className="font-medium text-foreground">{d.label}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(d.date)}
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
          {!team ? (
            <p className="text-sm text-muted-foreground">
              No team for this sprint yet. Create a team to assign members
              before starting the sprint.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border border-border">
              {(team.users ?? []).map((u) => (
                <li
                  key={u.userId}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{u.name ?? "Member"}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{u.role}</Badge>
                    <span className="text-muted-foreground">
                      {u.hoursPerDay}h / day
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {!isMobile && sprintDays.length > 0 && timelineMembers.length > 0 ? (
        <Card className="min-h-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Leave &amp; holidays timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Sprint holidays (OFF) and each member&apos;s leave across the
              sprint window. Read-only on this overview.
            </p>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <SprintTeamsTimeline
              members={timelineMembers}
              days={sprintDays}
              dayOffs={dayOffDates}
              isMobile={isMobile}
              hoveredUserId={hoveredUserId}
              onHover={setHoveredUserId}
              getEffectiveLeave={getEffectiveLeaveReadonly}
              onSetLeave={noopSetLeave}
              onRemoveLeave={noopRemoveLeave}
              readOnly
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
          {!team || memberAllocation.byMember.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a team to see per-member capacity and utilization.
            </p>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total sprint capacity
                  </p>
                  <p className="text-lg font-semibold">
                    {memberAllocation.totalSprintCapacity}h
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total committed
                  </p>
                  <p className="text-lg font-semibold">
                    {memberAllocation.totalCommitted}h
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">
                    Total available
                  </p>
                  <p className="text-lg font-semibold">
                    {memberAllocation.totalAvailable}h
                  </p>
                </div>
              </div>
              {memberAllocation.hasOverCapacity ? (
                <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Over capacity: one or more members exceed available hours.
                </div>
              ) : null}
              <div className="overflow-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Member</th>
                      <th className="px-2 py-2 text-left">Sprint capacity</th>
                      <th className="px-2 py-2 text-left">Committed</th>
                      <th className="px-2 py-2 text-left">Available</th>
                      <th className="px-2 py-2 text-left">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberAllocation.byMember.map((member) => (
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
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">Title</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Dev</th>
                  <th className="px-2 py-2 text-left">QA</th>
                  <th className="px-2 py-2 text-right">Dev Est.</th>
                  <th className="px-2 py-2 text-right">QA Est.</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-2 py-10 text-center text-muted-foreground"
                    >
                      No tickets linked to this sprint. Assign tickets in Plan
                      capacity.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="px-2 py-2 font-mono text-xs">
                        {t.ticketNumber}
                      </td>
                      <td className="max-w-[240px] px-2 py-2">
                        <span className="line-clamp-2">{t.ticketTitle}</span>
                      </td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="font-normal">
                          {ticketStatusLabel(t.status)}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {t.assignedDevName ?? "—"}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {t.assignedQaName ?? "—"}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {t.developmentEstimation ?? 0}
                      </td>
                      <td className="px-2 py-2 text-right font-mono">
                        {t.estimationTesting ?? 0}
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
