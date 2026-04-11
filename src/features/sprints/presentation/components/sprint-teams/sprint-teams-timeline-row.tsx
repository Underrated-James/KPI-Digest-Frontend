"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  isWeekend,
  formatDate,
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
}

const leaveColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  sick: {
    bg: "bg-red-500/25",
    border: "border-red-500/40",
    label: "Sick Leave",
  },
  vacation: {
    bg: "bg-emerald-500/25",
    border: "border-emerald-500/40",
    label: "Vacation",
  },
  wholeDayLeave: {
    bg: "bg-amber-500/25",
    border: "border-amber-500/40",
    label: "Whole Day",
  },
  halfDayLeave: {
    bg: "bg-sky-500/25",
    border: "border-sky-500/40",
    label: "Half Day",
  },
  other: {
    bg: "bg-violet-500/25",
    border: "border-violet-500/40",
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
    (member.leave ?? []).map((l) => [l.leaveDate, l.leaveType[0] as LeaveType]),
  );

  const handleCellClick = (e: React.MouseEvent, dateStr: string) => {
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
        const isBlocked = weekend || isDayOff;
        const originalLeave = originalLeaveMap.get(dateStr);
        const leaveType = getEffectiveLeave(
          member.userId,
          dateStr,
          originalLeave,
        );
        const isToday = dateStr === formatDate(new Date());
        const lc = leaveType ? leaveColors[leaveType] : null;

        return (
          <div
            key={dateStr}
            className={cn(
              "relative shrink-0 border-r border-border/60 transition-colors",
              isBlocked
                ? "cursor-not-allowed"
                : "cursor-pointer hover:bg-muted/30",
              isToday && "bg-primary/5",
              isDayOff &&
                !leaveType &&
                "bg-amber-500/10 dark:bg-amber-400/10",
              weekend &&
                !isDayOff &&
                !leaveType &&
                "bg-muted/40",
            )}
            style={{ width: colWidth, minWidth: colWidth }}
            onClick={(e) => !isBlocked && handleCellClick(e, dateStr)}
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
                  text: `Weekend · ${dateStr}`,
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
                  "absolute inset-x-1 bottom-2 top-2 flex items-center justify-center rounded-md border transition-transform hover:scale-105",
                  lc.bg,
                  lc.border,
                )}
              >
                {leaveType === "halfDayLeave" && (
                  <div className="flex h-full w-full">
                    <div className="w-1/2 rounded-l-md bg-sky-500/20" />
                    <div className="w-1/2 rounded-r-md" />
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
      {popover && (
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
