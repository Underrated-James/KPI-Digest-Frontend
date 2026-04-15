"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  isWeekend,
  formatDate,
  normalizeDate,
  type SprintTeamMember,
} from "../../hooks/use-sprint-teams-page";
import { SprintTeamsLeavePopover } from "./sprint-teams-leave-popover";
import { LeaveType } from "@/features/teams/domain/types/team-types";

interface SprintTeamsTimelineRowProps {
  member: SprintTeamMember;
  days: Date[];
  dayOffs: string[];
  colWidth: number;
  index: number;
  hoveredUserId: string | null;
  onHover: (id: string | null) => void;
  getEffectiveLeave: (
    userId: string,
    date: string,
    originalType?: LeaveType,
  ) => LeaveType | undefined;
  onSetLeave: (userId: string, date: string, type: LeaveType) => void;
  onRemoveLeave: (userId: string, date: string) => void;
  readOnly?: boolean;
}

const leaveColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  sick: {
    bg: "bg-red-500 text-white",
    border: "border-red-600 shadow-sm shadow-red-500/20",
    label: "Sick Leave",
  },
  vacation: {
    bg: "bg-emerald-500 text-white",
    border: "border-emerald-600 shadow-sm shadow-emerald-500/20",
    label: "Vacation",
  },
  wholeDayLeave: {
    bg: "bg-amber-500 text-white",
    border: "border-amber-600 shadow-sm shadow-amber-500/20",
    label: "Whole Day",
  },
  halfDayLeave: {
    bg: "bg-sky-500 text-white",
    border: "border-sky-600 shadow-sm shadow-sky-500/20",
    label: "Half Day",
  },
  other: {
    bg: "bg-violet-500 text-white",
    border: "border-violet-600 shadow-sm shadow-violet-500/20",
    label: "Other Leave",
  },
};

export function SprintTeamsTimelineRow({
  member,
  days,
  dayOffs,
  colWidth,
  index,
  hoveredUserId,
  onHover,
  getEffectiveLeave,
  onSetLeave,
  onRemoveLeave,
  readOnly = false,
}: SprintTeamsTimelineRowProps) {
  const isHovered = hoveredUserId === member.userId;
  const [tooltip, setTooltip] = useState<{ x: number; text: string } | null>(
    null,
  );
  const [popover, setPopover] = useState<{
    date: string;
    pos: { x: number; y: number };
    leave?: LeaveType;
  } | null>(null);

  const originalLeaveMap = new Map(
    (member.leave ?? []).map((l) => [
      normalizeDate(l.leaveDate),
      l.leaveType[0] as LeaveType,
    ]),
  );

  const handleCellClick = (
    e: React.MouseEvent,
    dateStr: string,
    weekend: boolean,
  ) => {
    if (readOnly || weekend) return;
    const originalLeave = originalLeaveMap.get(dateStr);
    const effectiveLeave = getEffectiveLeave(
      member.userId,
      dateStr,
      originalLeave,
    );
    setPopover({
      date: dateStr,
      pos: { x: e.clientX, y: e.clientY },
      leave: effectiveLeave,
    });
  };

  return (
    <div
      onMouseEnter={() => onHover(member.userId)}
      onMouseLeave={() => {
        onHover(null);
        setTooltip(null);
      }}
      className={cn(
        "relative flex h-14 border-b border-border/70 transition-colors",
        isHovered
          ? "bg-muted/40"
          : index % 2 === 0
            ? "bg-transparent"
            : "bg-muted/15",
      )}
    >
      {/* Allocation bar */}
      <div
        className="absolute left-1 right-1 top-3 h-8 rounded-md border border-primary/20 bg-primary/10 transition-opacity"
        style={{ opacity: member.allocationPercentage / 100 }}
      >
        <div
          className="h-full rounded-md bg-primary/15"
          style={{ width: `${member.allocationPercentage}%` }}
        />
      </div>

      {/* Day cells */}
      {days.map((d, di) => {
        const dateStr = formatDate(d);
        const weekend = isWeekend(d);
        const isDayOff = dayOffs.includes(dateStr);
        const originalLeave = originalLeaveMap.get(dateStr);
        const leaveType = getEffectiveLeave(
          member.userId,
          dateStr,
          originalLeave,
        );
        const isToday = dateStr === formatDate(new Date());
        const lc = leaveType ? leaveColors[leaveType] : null;

        // console.log(
        //   "DAYS:",
        //   days.map((d) => d.toISOString()),
        // );

        return (
          <div
            key={dateStr}
            className={cn(
              "relative shrink-0 border-r border-border/60 transition-colors",
              readOnly || weekend
                ? "cursor-default"
                : "cursor-pointer hover:bg-muted/30",
              isToday && "bg-primary/5",
              weekend && !leaveType && "bg-muted/40",
            )}
            style={{ width: colWidth, minWidth: colWidth }}
            onClick={(e) => handleCellClick(e, dateStr, weekend)}
            onMouseEnter={() => {
              if (leaveType && lc) {
                setTooltip({
                  x: di * colWidth + colWidth / 2,
                  text: `${lc.label} · ${dateStr}`,
                });
              } else if (isDayOff) {
                setTooltip({
                  x: di * colWidth + colWidth / 2,
                  text: `Holiday · ${dateStr}`,
                });
              } else if (weekend) {
                setTooltip({
                  x: di * colWidth + colWidth / 2,
                  text: `Weekend · ${dateStr} · leave unavailable`,
                });
              } else {
                setTooltip(null);
              }
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            {leaveType && lc && (
              <div
                className={cn(
                  "absolute inset-x-1 bottom-2 top-2 flex items-center justify-center rounded-md border text-[10px] font-bold transition-transform hover:scale-105",
                  lc.bg,
                  lc.border,
                )}
              >
                {leaveType === "sick" && "S"}
                {leaveType === "vacation" && "V"}
                {leaveType === "wholeDayLeave" && "W"}
                {leaveType === "other" && "O"}
                {leaveType === "halfDayLeave" && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-full w-1/2 items-center justify-center rounded-l-md bg-white/30 text-white">
                      H
                    </div>
                    <div className="w-1/2" />
                  </div>
                )}
              </div>
            )}

            {isDayOff && !leaveType && (
              <div className="absolute inset-x-1 bottom-2 top-2 flex items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/15">
                <span className="text-[8px] font-medium text-amber-600 dark:text-amber-400">
                  OFF
                </span>
              </div>
            )}

            {isToday && (
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary/40" />
            )}
          </div>
        );
      })}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute -top-8 z-30 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1 text-[10px] text-foreground shadow-lg"
          style={{ left: tooltip.x, transform: "translateX(-50%)" }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Leave Popover */}
      {popover && !readOnly && (
        <SprintTeamsLeavePopover
          userId={member.userId}
          date={popover.date}
          currentLeave={popover.leave}
          position={popover.pos}
          onSetLeave={onSetLeave}
          onRemoveLeave={onRemoveLeave}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
