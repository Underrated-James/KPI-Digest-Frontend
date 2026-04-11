"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SprintTeamMember } from "../../hooks/use-sprint-teams-page";

interface SprintTeamsMemberRowProps {
  member: SprintTeamMember;
  index: number;
  workingHoursDay: number;
  onRemove: (userId: string) => void;
  onAllocationChange: (userId: string, allocationPercentage: number) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    "bg-rose-500/20 text-rose-600 dark:text-rose-400",
    "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    "bg-violet-500/20 text-violet-600 dark:text-violet-400",
    "bg-pink-500/20 text-pink-600 dark:text-pink-400",
    "bg-teal-500/20 text-teal-600 dark:text-teal-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const roleBadgeColors: Record<string, string> = {
  DEVS: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  QA: "bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
};

export function SprintTeamsMemberRow({
  member,
  index,
  workingHoursDay,
  onRemove,
  onAllocationChange,
}: SprintTeamsMemberRowProps) {
  const effectiveHours =
    Math.round(((workingHoursDay * member.allocationPercentage) / 100) * 10) /
    10;
  const avatarColor = getAvatarColor(member.name);
  const [allocationDraft, setAllocationDraft] = useState(
    String(member.allocationPercentage),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllocationDraft(String(member.allocationPercentage));
    }, 0);

    return () => clearTimeout(timer);
  }, [member.allocationPercentage]);

  const commitAllocation = (value: string) => {
    if (value.trim() === "") return;
    const val = Math.min(100, Math.max(1, Number(value) || 1));
    onAllocationChange(member.userId, val);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors hover:bg-muted/40",
        index % 2 === 0 ? "bg-background" : "bg-muted/10",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          avatarColor,
        )}
      >
        {getInitials(member.name)}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {member.name}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              roleBadgeColors[member.role] ??
                "bg-muted text-muted-foreground",
            )}
          >
            {member.role}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>Allocation {member.allocationPercentage}%</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span>{effectiveHours}h/day</span>
        </div>
      </div>

      <div className="hidden min-w-[124px] items-center justify-end md:flex">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={allocationDraft}
            onChange={(e) => {
              const nextValue = e.target.value.replace(/[^\d]/g, "");
              setAllocationDraft(nextValue);
              commitAllocation(nextValue);
            }}
            onBlur={() => {
              if (allocationDraft.trim() === "") {
                setAllocationDraft(String(member.allocationPercentage));
                return;
              }
              commitAllocation(allocationDraft);
            }}
            className="h-7 w-12 bg-transparent text-center text-sm font-semibold text-foreground outline-none"
            aria-label={`Allocation percentage for ${member.name}`}
          />
          <span className="text-[10px] font-medium text-muted-foreground">
            %
          </span>
        </div>
      </div>

      <div className="hidden min-w-[72px] justify-center md:flex">
        <span className="font-mono text-sm font-semibold text-foreground">
          {effectiveHours}h
        </span>
      </div>

      <button
        onClick={() => onRemove(member.userId)}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        title={`Remove ${member.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
