"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Ticket, TicketStatus } from "../../domain/types/ticket-types";
import {
  canTransitionTicketStatus,
  getTicketStatusTransitionOptions,
  ticketStatusLabel,
} from "../utils/ticket-status-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  CheckCircle2,
  Eye,
  ExternalLink,
  FolderKanban,
  Link2,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Trash2,
  UserRound,
  XCircle,
  Play,
  CirclePause,
  CircleCheckBig,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markdownToPlainText } from "@/components/editor/markdown-utils";

const previewTooltipContentClassName =
  "z-50 flex w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col items-stretch gap-4 rounded-md border bg-popover p-4 text-popover-foreground shadow-md";

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  inProgress: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  done: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

interface ColumnProps {
  onView: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, status: TicketStatus) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onStartTimer: (ticket: Ticket) => void;
  onPauseTimer: (ticket: Ticket) => void;
  onCompleteTimer: (ticket: Ticket) => void;
  getTimerDisplay: (ticket: Ticket) => string;
  statusChangePendingTicketId?: string | null;
}

function formatEstimate(value: number | null | undefined) {
  return value == null ? "" : `${value}h`;
}

function getTicketPreviewContent(ticket: Ticket) {
  return (
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
            {ticket.ticketNumber}
          </h4>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {ticketStatusLabel(ticket.status)}
          </Badge>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {ticket.ticketTitle}
        </p>
      </div>

      <div className="grid gap-2 text-xs">
        <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <FolderKanban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Project / Sprint</p>
            <p className="text-muted-foreground">
              {ticket.projectName || "No project"}
              {ticket.sprintName ? ` / ${ticket.sprintName}` : " / No sprint"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Assignments</p>
            <p className="text-muted-foreground">
              Dev: {ticket.assignedDevName || "Unassigned"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Effort</p>
            <p className="text-muted-foreground">
              Dev {formatEstimate(ticket.developmentEstimation) || "0h"} / QA{" "}
              {formatEstimate(ticket.estimationTesting) || "0h"}
            </p>
            <p className="text-muted-foreground">
              Spent {formatEstimate(ticket.devTimeSpent) || "0h"} /{" "}
              {formatEstimate(ticket.testingTimeSpent) || "0h"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">Description Link</p>
            <p className="line-clamp-2 break-all text-muted-foreground">
              {ticket.descriptionLink || "No link"}
            </p>
          </div>
        </div>
      </div>
    </TooltipContent>
  );
}

function getStatusActionMeta(status: TicketStatus) {
  switch (status) {
    case "inProgress":
      return {
        label: "In Progress",
        description: "Move this ticket into active work.",
        icon: RefreshCcw,
      };
    case "done":
      return {
        label: "Completed",
        description: "Mark this ticket as finished.",
        icon: CheckCircle2,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        description: "Stop this ticket and close it out.",
        icon: XCircle,
      };
    default:
      return {
        label: ticketStatusLabel(status),
        description: "Update ticket status.",
        icon: RefreshCcw,
      };
  }
}

function TicketStatusCell({
  ticket,
  onStatusChange,
  isPending,
}: {
  ticket: Ticket;
  onStatusChange: (ticket: Ticket, status: TicketStatus) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const status = ticket.status;
  const options = getTicketStatusTransitionOptions(status);
  const isInteractive = canTransitionTicketStatus(status);

  if (!isInteractive) {
    return (
      <Badge variant="outline" className={statusColors[status]}>
        {ticketStatusLabel(status)}
      </Badge>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          onClick={(event) => event.stopPropagation()}
          disabled={isPending}
          aria-label={`Change status for ${ticket.ticketNumber}`}
        >
          <Badge
            variant="outline"
            className={cn(
              statusColors[status],
              "cursor-pointer border-border/60 transition-colors hover:border-foreground/30",
              isPending && "cursor-wait opacity-70",
            )}
          >
            {isPending ? "Updating..." : ticketStatusLabel(status)}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(18rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Update Status
            </p>
            <p className="text-xs text-muted-foreground">
              {ticket.ticketNumber} • {ticket.ticketTitle}
            </p>
          </div>
          <div className="space-y-2">
            {options.map((nextStatus) => {
              const meta = getStatusActionMeta(nextStatus);
              const Icon = meta.icon;

              return (
                <button
                  key={nextStatus}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40"
                  onClick={() => {
                    onStatusChange(ticket, nextStatus);
                    setOpen(false);
                  }}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {meta.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {meta.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const getColumns = ({
  onView,
  onStatusChange,
  onEdit,
  onDelete,
  onStartTimer,
  onPauseTimer,
  onCompleteTimer,
  getTimerDisplay,
  statusChangePendingTicketId,
}: ColumnProps): ColumnDef<Ticket>[] => [
  {
    accessorKey: "ticketNumber",
    header: "Ticket #",
    meta: {
      mobileLabel: "Ticket #",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="font-medium tabular-nums text-primary underline-offset-4 hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onView(row.original);
            }}
          >
            {row.getValue("ticketNumber")}
          </button>
        </TooltipTrigger>
        {getTicketPreviewContent(row.original)}
      </Tooltip>
    ),
  },
  {
    accessorKey: "ticketTitle",
    header: "Title",
    meta: {
      mobileLabel: "Title",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <div className="flex min-w-0 items-start justify-between gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="max-w-[300px] truncate text-left text-primary underline-offset-4 hover:underline md:max-w-none"
              aria-label={String(row.getValue("ticketTitle"))}
              onClick={(event) => {
                event.stopPropagation();
                onView(row.original);
              }}
            >
              {row.getValue("ticketTitle")}
            </button>
          </TooltipTrigger>
          {getTicketPreviewContent(row.original)}
        </Tooltip>
        {row.getCanExpand() ? (
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center md:hidden">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                row.getIsExpanded() && "rotate-180 text-foreground",
              )}
              aria-hidden
            />
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    meta: {
      mobileLabel: "Description",
    },
    cell: ({ row }) => (
      <div className="w-[320px] max-w-[320px] truncate text-sm text-muted-foreground">
        {markdownToPlainText(row.original.description) || "-"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      mobileLabel: "Status",
    },
    cell: ({ row }) => {
      return (
        <TicketStatusCell
          ticket={row.original}
          onStatusChange={onStatusChange}
          isPending={statusChangePendingTicketId === row.original.id}
        />
      );
    },
  },
  {
    accessorKey: "assignedDevName",
    header: "Assigned",
    meta: {
      mobileLabel: "Developer",
    },
    cell: ({ row }) => (
      <div>{row.original.assignedDevName || "Unassigned"}</div>
    ),
  },
  {
    id: "controls",
    header: () => <div className="w-full text-center">Controls</div>,
    meta: {
      mobileLabel: "Ctrl",
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Start"
          onClick={(event) => {
            event.stopPropagation();
            onStartTimer(row.original);
          }}
          disabled={row.original.timerRunning || row.original.status === "done"}
        >
          <Play className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Pause"
          onClick={(event) => {
            event.stopPropagation();
            onPauseTimer(row.original);
          }}
          disabled={!row.original.timerRunning}
        >
          <CirclePause className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Complete"
          onClick={(event) => {
            event.stopPropagation();
            onCompleteTimer(row.original);
          }}
          disabled={row.original.status === "done"}
        >
          <CircleCheckBig className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
        </button>
      </div>
    ),
  },
  {
    id: "timer",
    header: () => <div className="w-full text-center">Timer</div>,
    meta: {
      mobileLabel: "Time",
    },
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm tabular-nums text-primary">
        {getTimerDisplay(row.original)}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="w-full text-center">Actions</div>,
    meta: {
      mobileLabel: "Actions",
      mobileSection: "actions",
    },
    cell: ({ row }) => {
      const ticket = row.original;
      const isLockedTicket =
        ticket.status === "done" || ticket.status === "cancelled";
      const primaryActionLabel = isLockedTicket ? "View" : "Edit";
      const PrimaryActionIcon = isLockedTicket ? Eye : Pencil;
      const handlePrimaryAction = () => {
        if (isLockedTicket) {
          onView(ticket);
          return;
        }

        onEdit(ticket);
      };

      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden h-8 w-8 shrink-0 p-0 md:inline-flex"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handlePrimaryAction}>
                <PrimaryActionIcon className="mr-2 h-4 w-4" />{" "}
                {primaryActionLabel}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(ticket.descriptionLink, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> View Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(ticket)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center border-border bg-background hover:border-foreground hover:bg-foreground hover:text-background md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              handlePrimaryAction();
            }}
          >
            <PrimaryActionIcon className="mr-2 h-4 w-4" />
            {primaryActionLabel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center border-border bg-background md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              window.open(ticket.descriptionLink, "_blank");
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View link
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-center md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(ticket);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
