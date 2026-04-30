"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  Pencil,
  Eye,
  Trash,
  Calendar,
  Clock,
  FolderKanban,
  UserPlus,
  MoreHorizontal,
  Layers,
  Play,
  Pause,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sprint } from "../../domain/types/sprint-types";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  canCompleteSprint,
  canEditSprintDetails,
  canPauseSprint,
  canStartSprint,
  getSprintDisplayStatus,
  getSprintStatusLabel,
  isSprintViewOnly,
} from "../utils/sprint-control-utils";

function buildSprintCanvasHref(sprint: Sprint) {
  const params = new URLSearchParams();
  params.set("projectId", sprint.projectId);
  if (sprint.projectName) {
    params.set("projectName", sprint.projectName);
  }
  return `/sprints/${sprint.id}?${params.toString()}`;
}

function formatSprintDate(date: string | null | undefined) {
  return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
}

interface ColumnsProps {
  onEdit: (sprint: Sprint) => void;
  onDelete: (id: string) => void;
  onCreateTeams: (sprint: Sprint) => void;
  onCapacityPlanning: (sprint: Sprint) => void;
  onStartSprint: (sprint: Sprint) => void;
  onPauseSprint: (sprint: Sprint) => void;
  onCompleteSprint: (sprint: Sprint) => void;
  controlsPending?: boolean;
  teamSprintMap?: Map<string, string>;
  pendingStartSprintId?: string | null;
}

export const getSprintColumns = ({
  onEdit,
  onDelete,
  onCreateTeams,
  onCapacityPlanning,
  onStartSprint,
  onPauseSprint,
  onCompleteSprint,
  controlsPending = false,
  teamSprintMap,
  pendingStartSprintId,
}: ColumnsProps): ColumnDef<Sprint>[] => [
  {
    accessorKey: "name",
    header: "Sprint Name",
    meta: {
      mobileLabel: "Sprint Name",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const sprint = row.original;
      const displayStatus = getSprintStatusLabel(sprint);
      const dayOffCount = sprint.dayOff?.length ?? 0;
      return (
        <div className="flex min-w-0 items-center">
          <div className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={buildSprintCanvasHref(sprint)}
                  prefetch={false}
                  className="block truncate font-medium text-primary underline-offset-4 hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {sprint.name}
                </Link>
              </TooltipTrigger>
              <TooltipContent
                className="flex w-80 max-w-[20rem] flex-col items-stretch gap-4 rounded-md border bg-popover p-4 text-popover-foreground shadow-md"
                align="start"
                side="bottom"
                sideOffset={8}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold">
                      {sprint.name}
                    </h4>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {displayStatus}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-2 text-xs">
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <FolderKanban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Project</p>
                      <p className="text-muted-foreground">
                        {sprint.projectName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Dates</p>
                      <p className="text-muted-foreground">
                        {formatSprintDate(sprint.startDate)} to{" "}
                        {formatSprintDate(sprint.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Planning</p>
                      <p className="text-muted-foreground">
                        {sprint.workingHoursDay}h/day, {sprint.sprintDuration} days,{" "}
                        {dayOffCount} holiday{dayOffCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "projectName",
    header: "Project Name",
    meta: {
      mobileLabel: "Project Name",
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.projectName || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      mobileLabel: "Status",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const display = getSprintDisplayStatus(row.original);
      const getStatusStyles = () => {
        switch (display) {
          case "active":
            return "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
          case "inactive":
            return "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
          case "paused":
            return "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300";
          case "draft":
            return "border-amber-400/60 bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
          case "completed":
            return "border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
          default:
            return "border-amber-400/60 bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
        }
      };
      const getDotStyles = () => {
        switch (display) {
          case "active":
            return "bg-emerald-500 dark:bg-emerald-400";
          case "inactive":
            return "bg-rose-500 dark:bg-rose-400";
          case "paused":
            return "bg-violet-500 dark:bg-violet-400";
          case "draft":
            return "bg-amber-500 dark:bg-amber-400";
          case "completed":
            return "bg-blue-500 dark:bg-blue-400";
          default:
            return "bg-amber-500 dark:bg-amber-400";
        }
      };
      const label = getSprintStatusLabel(row.original);

      return (
        <>
          <span
            className={cn(
              "hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              getStatusStyles(),
            )}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", getDotStyles())} />
            {label}
          </span>

          <div className="flex items-center justify-end gap-2 text-sm md:hidden">
            {row.getCanExpand() ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    row.getIsExpanded() && "rotate-180 text-foreground",
                  )}
                  aria-hidden="true"
                />
              </span>
            ) : null}

            <span
              className={cn(
                "inline-flex min-w-[84px] items-center gap-2 whitespace-nowrap text-left font-medium",
                display === "active"
                  ? "text-emerald-950 dark:text-emerald-300"
                  : display === "inactive"
                    ? "text-rose-950 dark:text-rose-300"
                    : display === "paused"
                      ? "text-violet-950 dark:text-violet-300"
                      : display === "completed"
                        ? "text-blue-950 dark:text-blue-300"
                        : "text-amber-900 dark:text-amber-300",
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", getDotStyles())} />
              {label}
            </span>
          </div>
        </>
      );
    },
  },
  {
    id: "controls",
    header: "Controls",
    meta: {
      mobileLabel: "Controls",
      mobileSection: "controls",
    },
    cell: ({ row }) => {
      const sprint = row.original;
      const startOk = canStartSprint(sprint);
      const pauseOk = canPauseSprint(sprint);
      const completeOk = canCompleteSprint(sprint);
      const hasTeam = teamSprintMap?.has(sprint.id) ?? false;
      const startPending = pendingStartSprintId === sprint.id;
      const startDisabled =
        controlsPending || startPending || !startOk || !hasTeam;

      return (
        <div className="md:min-w-[9.5rem]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full justify-between gap-1 px-2 text-xs data-[state=open]:border-primary data-[state=open]:bg-muted/80"
                disabled={controlsPending}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Sprint run</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onClick={(e) => e.stopPropagation()}
            >
              {startOk && !hasTeam ? (
                <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
                  Start needs a team assigned to this sprint first.
                </p>
              ) : null}
              {startPending ? (
                <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
                  Checking sprint tickets...
                </p>
              ) : null}
              <DropdownMenuItem
                disabled={startDisabled}
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!startDisabled) onStartSprint(sprint);
                }}
              >
                <Play className="h-3.5 w-3.5 shrink-0" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={controlsPending || !pauseOk}
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!controlsPending && pauseOk) onPauseSprint(sprint);
                }}
              >
                <Pause className="h-3.5 w-3.5 shrink-0" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={controlsPending || !completeOk}
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!controlsPending && completeOk) onCompleteSprint(sprint);
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Complete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    id: "dates",
    header: "Dates",
    meta: {
      mobileLabel: "Dates",
    },
    cell: ({ row }) => {
      const { startDate, endDate, officialStartDate, officialEndDate } =
        row.original;
      const formatDate = (date: string | null | undefined) =>
        date ? format(new Date(date), "MMM dd, yyyy") : "N/A";

      return (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">Start:</span>
            <span className="font-medium">{formatDate(startDate)}</span>
            {officialStartDate && (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[10px] leading-none"
              >
                Official: {formatDate(officialStartDate)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">End:</span>
            <span className="font-medium">{formatDate(endDate)}</span>
            {officialEndDate && (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[10px] leading-none"
              >
                Official: {formatDate(officialEndDate)}
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "workingHoursDay",
    header: "Hrs/Day",
    meta: {
      mobileLabel: "Hrs/Day",
    },
    cell: ({ row }) => (
      <span className="font-mono">{row.original.workingHoursDay}h</span>
    ),
  },
  {
    accessorKey: "sprintDuration",
    header: "Duration",
    meta: {
      mobileLabel: "Duration",
    },
    cell: ({ row }) => (
      <span className="font-mono">{row.original.sprintDuration}d</span>
    ),
  },
  {
    id: "dayOff",
    header: "Days Off",
    meta: {
      mobileLabel: "Days Off",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const dayOffs = row.original.dayOff || [];
      if (dayOffs.length === 0) {
        return <span className="text-xs text-muted-foreground md:italic">None</span>;
      }

      return (
        <>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {dayOffs.length} Day{dayOffs.length > 1 ? "s" : ""} Off
            </span>
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden h-7 gap-1.5 rounded-full border-dashed px-2 text-xs transition-colors duration-200 hover:border-foreground/30 hover:bg-muted hover:text-foreground md:inline-flex"
                onClick={(event) => event.stopPropagation()}
                title="View day off details"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {dayOffs.length} Day{dayOffs.length > 1 ? "s" : ""} Off
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold leading-none">
                  Specific Days Off
                </h4>
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  {dayOffs.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col border-b border-border/50 py-1.5 last:border-0"
                    >
                      <span className="text-xs font-medium text-foreground">
                        {day.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(day.date), "EEEE, MMM dd, yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="w-full text-center">Actions</div>,
    meta: {
      mobileLabel: "Actions",
      mobileSection: "actions",
    },
    cell: ({ row }) => {
      const sprint = row.original;
      const viewOnlyPlanning = isSprintViewOnly(sprint);
      const hasTeam = teamSprintMap?.has(sprint.id) ?? false;
      const TeamIcon = hasTeam ? Pencil : UserPlus;
      const teamLabel = viewOnlyPlanning
        ? "View Team"
        : hasTeam
          ? "Edit Team"
          : "Create Team";
      const capacityLabel = viewOnlyPlanning ? "View Capacity" : "Plan Capacity";
      const editable = canEditSprintDetails(sprint);
      const primaryLabel = editable ? "Edit Sprint" : "View Sprint";
      const PrimaryIcon = editable ? Pencil : Eye;
      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden h-8 w-8 shrink-0 p-0 md:inline-flex"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="sr-only">Open actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(sprint)}>
                <PrimaryIcon className="mr-2 h-4 w-4" /> {primaryLabel}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateTeams(sprint)}>
                <TeamIcon className="mr-2 h-4 w-4" /> {teamLabel}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCapacityPlanning(sprint)}>
                <Layers className="mr-2 h-4 w-4" /> {capacityLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(sprint.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center border-border bg-background hover:border-foreground hover:bg-foreground hover:text-background md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(sprint);
            }}
            title={primaryLabel}
          >
            <PrimaryIcon className="h-4 w-4" />
            {editable ? "Edit" : "View"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-center border-border bg-background md:hidden",
              hasTeam
                ? "border-primary/30 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground"
                : "hover:border-foreground hover:bg-foreground hover:text-background",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onCreateTeams(sprint);
            }}
          >
            <TeamIcon className="h-4 w-4" />
            {viewOnlyPlanning ? "View Team" : hasTeam ? "Edit" : "Create"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center border-border bg-background hover:border-foreground hover:bg-foreground hover:text-background md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              onCapacityPlanning(sprint);
            }}
          >
            <Layers className="h-4 w-4" />
            {capacityLabel}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-center md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(sprint.id);
            }}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
