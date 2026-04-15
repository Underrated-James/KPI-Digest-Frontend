"use client";

import { ChevronLeft, Search, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  showWeekends: boolean;
  onShowWeekendsChange: (show: boolean) => void;
  sprintStartDate?: string;
  sprintEndDate?: string;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
  isDirty: boolean;
  isSaving: boolean;
  isDeleting?: boolean;
  isMobile: boolean;
  isViewOnly?: boolean;
}

const roles: ("ALL" | "DEVS" | "QA")[] = ["ALL", "DEVS", "QA"];
const roleLabels: Record<"ALL" | "DEVS" | "QA", string> = {
  ALL: "All",
  DEVS: "Devs",
  QA: "QA",
};

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
  showWeekends,
  onShowWeekendsChange,
  sprintStartDate,
  sprintEndDate,
  onCancel,
  onSave,
  onDelete,
  isDirty,
  isSaving,
  isDeleting = false,
  isMobile,
  isViewOnly = false,
}: SprintTeamsHeaderProps) {
  const dateRange =
    sprintStartDate && sprintEndDate
      ? `${formatSprintDate(sprintStartDate)} - ${formatSprintDate(sprintEndDate)}`
      : "";

  return (
    <div className="space-y-4">
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
              {isViewOnly
                ? "View Team"
                : isEditMode
                  ? "Edit Team"
                  : "Create Team"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {sprintName}
              {projectName ? ` - ${projectName}` : ""}
              {dateRange ? ` - ${dateRange}` : ""}
              {memberCount > 0 ? ` - ${memberCount} members` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isViewOnly ? (
            <Badge variant="secondary" className="h-9 px-3 font-medium">
              View only
            </Badge>
          ) : (
            <>
              {isEditMode && onDelete && (
                <Button
                  variant="ghost"
                  onClick={onDelete}
                  disabled={isSaving || isDeleting}
                  className="h-9 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {!isMobile && (isDeleting ? "Deleting..." : "Delete Team")}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSaving || isDeleting}
                className="hover:border-foreground/35 hover:bg-foreground/10 hover:text-foreground dark:hover:border-foreground/35 dark:hover:bg-foreground/15 dark:hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving || isDeleting || (isEditMode && !isDirty)}
                title={isEditMode && !isDirty ? "No changes to update" : undefined}
              >
                {isSaving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Team"
                    : "Save Team"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search members..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-1 focus:ring-ring/50"
          />
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => onRoleFilterChange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all",
                roleFilter === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>

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
