"use client";

import type { SprintTeamMember } from "../../hooks/use-sprint-teams-page";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface SprintTeamsMemberRowProps {
  member: SprintTeamMember;
  index: number;
  hoursPerDay: number;
  onRemove: (userId: string) => void;
  onRoleChange: (userId: string, role: "DEVS" | "QA") => void;
  onAllocationChange: (userId: string, allocationPercentage: number) => void;
}

const roleBadgeColors: Record<string, string> = {
  DEVS: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  QA: "bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
};

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

export function SprintTeamsMemberRow({
  member,
  index,
  hoursPerDay,
  onRemove,
  onRoleChange,
  onAllocationChange,
}: SprintTeamsMemberRowProps) {
  const effectiveHours =
    Math.round(((hoursPerDay * member.allocationPercentage) / 100) * 10) / 10;
  const avatarColor = getAvatarColor(member.name);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors hover:bg-muted/40",
        index % 2 === 0 ? "bg-background" : "bg-muted/10",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          avatarColor,
        )}
      >
        {getInitials(member.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {member.name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
              roleBadgeColors[member.role] ?? "bg-muted text-muted-foreground",
            )}
          >
            {member.role}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {member.allocationPercentage}% · {effectiveHours}h/d
          </span>
        </div>
      </div>

      {/* Role select */}
      <select
        value={member.role}
        onChange={(e) =>
          onRoleChange(member.userId, e.target.value as "DEVS" | "QA")
        }
        className="hidden h-7 w-[70px] appearance-none rounded-md border border-border bg-background px-2 text-[11px] font-medium text-foreground outline-none transition focus:ring-1 focus:ring-ring/50 md:block"
      >
        <option value="DEVS">DEVS</option>
        <option value="QA">QA</option>
      </select>

      {/* Allocation input */}
      <div className="hidden items-center gap-1 md:flex">
        <input
          type="number"
          min={1}
          max={100}
          value={member.allocationPercentage}
          onChange={(e) => {
            const val = Math.min(100, Math.max(1, Number(e.target.value) || 1));
            onAllocationChange(member.userId, val);
          }}
          className="h-7 w-14 rounded-md border border-border bg-background px-2 text-center text-[11px] font-mono text-foreground outline-none transition focus:ring-1 focus:ring-ring/50"
        />
        <span className="text-[10px] text-muted-foreground">%</span>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(member.userId)}
        className="shrink-0 rounded-md p-1.5 text-transparent transition-colors group-hover:text-destructive hover:bg-destructive/10"
        title={`Remove ${member.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
