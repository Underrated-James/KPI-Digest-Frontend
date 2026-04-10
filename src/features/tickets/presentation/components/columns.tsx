"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Pencil, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sprint } from "../../domain/types/sprint-types";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface ColumnsProps {
  onEdit: (sprint: Sprint) => void;
  onDelete: (id: string) => void;
}

export const getSprintColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Sprint>[] => [
  {
    accessorKey: "name",
    header: "Sprint Name",
    meta: {
      mobileLabel: "Sprint Name",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {row.original.name}
          </span>
        </div>
      </div>
    ),
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
      const status = row.original.status;
      const getStatusStyles = () => {
        switch (status) {
          case "active":
            return "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
          case "inactive":
            return "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
          case "draft":
            return "border-amber-400/60 bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
          case "completed":
            return "border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
          default:
            return "border-amber-400/60 bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
        }
      };
      const getDotStyles = () => {
        switch (status) {
          case "active":
            return "bg-emerald-500 dark:bg-emerald-400";
          case "inactive":
            return "bg-rose-500 dark:bg-rose-400";
          case "draft":
            return "bg-amber-500 dark:bg-amber-400";
          case "completed":
            return "bg-blue-500 dark:bg-blue-400";
          default:
            return "bg-amber-500 dark:bg-amber-400";
        }
      };
      const labels: Record<string, string> = {
        active: "Active",
        inactive: "Inactive",
        draft: "Draft",
        completed: "Completed",
      };
      const label = labels[status] || status;

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
                status === "active"
                  ? "text-emerald-950 dark:text-emerald-300"
                  : status === "inactive"
                    ? "text-rose-950 dark:text-rose-300"
                : status === "completed"
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
    id: "dates",
    header: "Dates",
    meta: {
      mobileLabel: "Dates",
    },
    cell: ({ row }) => {
      const { startDate, endDate, officialStartDate, officialEndDate } = row.original;
      const formatDate = (date: string | null | undefined) => date ? format(new Date(date), "MMM dd, yyyy") : "N/A";

      return (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">Start:</span>
            <span className="font-medium">{formatDate(startDate)}</span>
            {officialStartDate && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none">Official: {formatDate(officialStartDate)}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">End:</span>
            <span className="font-medium">{formatDate(endDate)}</span>
            {officialEndDate && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none">Official: {formatDate(officialEndDate)}</Badge>
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
    cell: ({ row }) => <span className="font-mono">{row.original.workingHoursDay}h</span>,
  },
  {
    accessorKey: "sprintDuration",
    header: "Duration",
    meta: {
      mobileLabel: "Duration",
    },
    cell: ({ row }) => <span className="font-mono">{row.original.sprintDuration}d</span>,
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
        return (
          <span className="text-xs text-muted-foreground md:italic">
            None
          </span>
        );
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
                <h4 className="text-sm font-semibold leading-none">Specific Days Off</h4>
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  {dayOffs.map((day, idx) => (
                    <div key={idx} className="flex flex-col border-b border-border/50 py-1.5 last:border-0">
                      <span className="text-xs font-medium text-foreground">{day.label}</span>
                      <span className="text-[11px] text-muted-foreground">{format(new Date(day.date), "EEEE, MMM dd, yyyy")}</span>
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
      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(sprint);
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
              onEdit(sprint);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive md:inline-flex"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(sprint.id);
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
