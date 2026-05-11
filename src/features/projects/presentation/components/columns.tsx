"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  FolderKanban,
  Hash,
  Pencil,
  Trash,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Project } from "../../domain/types/project-types";

const previewTooltipContentClassName =
  "z-50 flex w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col items-stretch gap-4 rounded-md border bg-popover p-4 text-popover-foreground shadow-md";

function formatProjectDate(date: string | undefined) {
  return date ? new Date(date).toLocaleDateString() : "N/A";
}

function getProjectStatusLabel(status: Project["status"]) {
  switch (status) {
    case "active":
      return "Active";
    case "inProgress":
      return "In Progress";
    case "draft":
      return "Draft";
    default:
      return "Inactive";
  }
}

interface ColumnsProps {
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const getProjectColumns = ({
  onView,
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Project>[] => [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      mobileLabel: "Name",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const project = row.original;
      const memberCount = project.members?.length ?? 0;

      return (
        <div className="flex min-w-0 items-center">
          <div className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="block truncate font-medium text-primary text-left underline-offset-4 hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    onView(project);
                  }}
                >
                  {project.name}
                </button>
              </TooltipTrigger>
              <TooltipContent
                className={previewTooltipContentClassName}
                align="start"
                side="bottom"
                sideOffset={8}
                collisionPadding={16}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold">
                      {project.name}
                    </h4>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {getProjectStatusLabel(project.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-2 text-xs">
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        Project Code
                      </p>
                      <p className="text-muted-foreground">
                        {project.projectCode || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        Target Finish
                      </p>
                      <p className="text-muted-foreground">
                        {formatProjectDate(project.finishDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Members</p>
                      <p className="text-muted-foreground">
                        {memberCount} member{memberCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <FolderKanban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Sprints</p>
                      <p className="text-muted-foreground">
                        {project.sprintCount ?? 0} sprint
                        {project.sprintCount === 1 ? "" : "s"}
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
    accessorKey: "projectCode",
    header: "Project Code",
    meta: {
      mobileLabel: "ProjCode",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {row.original.projectCode}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "finishDate",
    header: "Target Finish Date",
    meta: {
      mobileLabel: "Target Finish Date",
    },
    cell: ({ row }) => {
      const dateStr = row.original.finishDate;
      const formattedDate = new Date(dateStr).toLocaleDateString();
      return <span className="capitalize">{formattedDate}</span>;
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    meta: {
      mobileLabel: "Status",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = status === "active";
      const isInProgress = status === "inProgress";
      const isDraft = status === "draft";
      const getStatusStyles = () => {
        if (isActive) {
          return "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
        }

        if (isInProgress) {
          return "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
        }

        if (isDraft) {
          return "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300";
        }

        return "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
      };

      const getDotStyles = () => {
        if (isActive) return "bg-emerald-500 dark:bg-emerald-400";
        if (isInProgress) return "bg-amber-500 dark:bg-amber-400";
        if (isDraft) return "bg-zinc-500 dark:bg-zinc-400";
        return "bg-rose-500 dark:bg-rose-400";
      };

      const getStatusLabel = () => {
        if (isActive) return "Active";
        if (isInProgress) return "In Progress";
        if (isDraft) return "Draft";
        return "Inactive";
      };

      return (
        <>
          <span
            className={`hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyles()}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${getDotStyles()}`}
              aria-hidden="true"
            />
            {getStatusLabel()}
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
                isActive
                  ? "text-emerald-950 dark:text-emerald-300"
                  : isInProgress
                    ? "text-amber-950 dark:text-amber-300"
                    : isDraft
                      ? "text-yellow-950 dark:text-yellow-300"
                      : "text-rose-950 dark:text-rose-300",
              )}
            >
              <span
                className={cn("h-2.5 w-2.5 rounded-full", getDotStyles())}
                aria-hidden="true"
              />
              {getStatusLabel()}
            </span>
          </div>
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
      const project = row.original;
      const isInactive = project.status === "inactive";

      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center">
          {isInactive ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive md:inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project.id);
                }}
                title="Delete project"
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-center md:hidden"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project.id);
                }}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(project);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center border-border bg-background hover:border-foreground hover:bg-foreground hover:text-background md:hidden"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(project);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive md:inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project.id);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-center md:hidden"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project.id);
                }}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
