"use client";

import { ChevronLeft, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SprintTeamsHeaderProps {
  sprintName: string;
  projectName: string;
  isEditMode: boolean;
  memberCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: "ALL" | "DEVS" | "QA";
  onRoleFilterChange: (role: "ALL" | "DEVS" | "QA") => void;
  hoursPerDay: number;
  onHoursPerDayChange: (hours: number) => void;
  showWeekends: boolean;
  onShowWeekendsChange: (show: boolean) => void;
  sprintStartDate?: string;
  sprintEndDate?: string;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  isMobile: boolean;
}

const roles: ("ALL" | "DEVS" | "QA")[] = ["ALL", "DEVS", "QA"];

function formatSprintDate(dateStr?: string) {
  if (!dateStr) return "";
  const normalized = dateStr.split("T")[0];
  const d = new Date(normalized + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function SprintTeamsHeader({
  sprintName,
  projectName,
  isEditMode,
  memberCount,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  hoursPerDay,
  onHoursPerDayChange,
  showWeekends,
  onShowWeekendsChange,
  sprintStartDate,
  sprintEndDate,
  onCancel,
  onSave,
  isSaving,
  isMobile,
}: SprintTeamsHeaderProps) {
  const dateRange =
    sprintStartDate && sprintEndDate
      ? `${formatSprintDate(sprintStartDate)} → ${formatSprintDate(sprintEndDate)}`
      : "";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isEditMode ? "Edit Team" : "Create Team"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {sprintName}
              {projectName ? ` · ${projectName}` : ""}
              {dateRange ? ` · ${dateRange}` : ""}
              {memberCount > 0 ? ` · ${memberCount} members` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="hover:border-foreground/35 hover:bg-foreground/10 hover:text-foreground dark:hover:border-foreground/35 dark:hover:bg-foreground/15 dark:hover:text-foreground"
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Update Team"
                : "Save Team"}
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search members..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-1 focus:ring-ring/50"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => onRoleFilterChange(r)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all",
                roleFilter === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Hours per day */}
        {!isMobile && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">Hrs/Day:</span>
            <input
              type="number"
              min={1}
              max={24}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) =>
                onHoursPerDayChange(
                  Math.min(24, Math.max(1, Number(e.target.value) || 8)),
                )
              }
              className="h-6 w-12 rounded border border-border bg-background px-1.5 text-center text-xs font-mono text-foreground outline-none transition focus:ring-1 focus:ring-ring/50"
            />
          </div>
        )}

        {/* Weekends toggle */}
        {!isMobile && (
          <button
            onClick={() => onShowWeekendsChange(!showWeekends)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all",
              showWeekends
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
            )}
          >
            {showWeekends ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            Weekends
          </button>
        )}
      </div>
    </div>
  );
}
