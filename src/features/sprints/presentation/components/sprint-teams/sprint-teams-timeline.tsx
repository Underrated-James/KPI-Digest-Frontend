"use client";

import { useRef } from "react";
import type { SprintTeamMember } from "../../hooks/use-sprint-teams-page";
import { SprintTeamsTimelineHeader } from "./sprint-teams-timeline-header";
import { SprintTeamsTimelineRow } from "./sprint-teams-timeline-row";
import { LeaveType } from "@/features/teams/domain/types/team-types";

interface SprintTeamsTimelineProps {
  members: SprintTeamMember[];
  days: Date[];
  dayOffs: string[];
  isMobile: boolean;
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

export function SprintTeamsTimeline({
  members,
  days,
  dayOffs,
  isMobile,
  hoveredUserId,
  onHover,
  getEffectiveLeave,
  onSetLeave,
  onRemoveLeave,
}: SprintTeamsTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const COL_WIDTH = isMobile ? 36 : 48;

  if (days.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Sprint date range not available. Configure sprint start &amp; end
          dates first.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm"
    >
      <div style={{ minWidth: days.length * COL_WIDTH }}>
        <SprintTeamsTimelineHeader
          days={days}
          dayOffs={dayOffs}
          colWidth={COL_WIDTH}
        />
        {members.map((member, i) => (
          <SprintTeamsTimelineRow
            key={member.userId}
            member={member}
            days={days}
            dayOffs={dayOffs}
            colWidth={COL_WIDTH}
            index={i}
            hoveredUserId={hoveredUserId}
            onHover={onHover}
            getEffectiveLeave={getEffectiveLeave}
            onSetLeave={onSetLeave}
            onRemoveLeave={onRemoveLeave}
          />
        ))}
      </div>
    </div>
  );
}
