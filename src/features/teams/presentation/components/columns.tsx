"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Team } from "../../domain/types/team-types";

interface ColumnsProps {
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
}

export const getTeamColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Team>[] => [
  {
    accessorKey: "projectName",
    header: "Project",
    meta: {
      mobileLabel: "Project",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.projectName ?? "N/A"}</span>
    ),
  },
  {
    accessorKey: "sprintName",
    header: "Sprint",
    meta: {
      mobileLabel: "Sprint",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.sprintName ?? "N/A"}</span>
    ),
  },
  {
    accessorKey: "users",
    header: "Members",
    meta: {
      mobileLabel: "Members",
    },
    cell: ({ row }) => {
      const users = row.original.users ?? [];
      return <span>{users.length} members</span>;
    },
  },

  {
    accessorKey: "sprintStatus",
    header: "Status",
    meta: {
      mobileLabel: "Status",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const status = row.original.sprintStatus;
      const isActive = status === 'active';
      const isDraft = status === 'draft';
      const isCompleted = status === 'completed';
      const isInactive = status === 'inactive';

      const getStatusStyles = () => {
        if (isActive) {
          return "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
        }

        if (isDraft) {
          return "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
        }

        if (isCompleted) {
          return "border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
        }

        return "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
      };

      const getDotStyles = () => {
        if (isActive) return "bg-emerald-500 dark:bg-emerald-400";
        if (isDraft) return "bg-amber-500 dark:bg-amber-400";
        if (isCompleted) return "bg-blue-500 dark:bg-blue-400";
        return "bg-rose-500 dark:bg-rose-400";
      };

      const getStatusLabel = () => {
        if (isActive) return "Active";
        if (isDraft) return "Draft";
        if (isCompleted) return "Completed";
        if (isInactive) return "Inactive";
        return status;
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
                    row.getIsExpanded() && "rotate-180 text-foreground"
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
                  : isDraft
                    ? "text-amber-950 dark:text-amber-300"
                    : "text-rose-950 dark:text-rose-300",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  getDotStyles()
                )}
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

      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center">
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
        </div>
      );
    },
  },
];
