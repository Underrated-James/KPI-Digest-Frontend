"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Ticket, TicketStatus } from "../../domain/types/ticket-types";
import { ticketStatusLabel } from "../utils/ticket-status-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors: Record<TicketStatus, string> = {
  'open': "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  'inProgress': "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  'done': "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  'cancelled': "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

interface ColumnProps {
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

function formatEstimate(value: number | null | undefined) {
  return value == null ? "" : `${value}h`;
}

export const getColumns = ({ onEdit, onDelete }: ColumnProps): ColumnDef<Ticket>[] => [
  {
    accessorKey: "ticketNumber",
    header: "Ticket #",
    meta: {
      mobileLabel: "Ticket #",
      mobileVisible: true,
    },
    cell: ({ row }) => (
      <div className="font-medium tabular-nums">{row.getValue("ticketNumber")}</div>
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
        <div
          className="max-w-[300px] truncate md:max-w-none"
          title={row.getValue("ticketTitle")}
        >
          {row.getValue("ticketTitle")}
        </div>
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
    accessorKey: "status",
    header: "Status",
    meta: {
      mobileLabel: "Status",
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as TicketStatus;
      return (
        <Badge variant="outline" className={statusColors[status]}>
          {ticketStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedDevName",
    header: "Developer",
    meta: {
      mobileLabel: "Developer",
    },
    cell: ({ row }) => (
      <div>{row.original.assignedDevName || "Unassigned"}</div>
    ),
  },
  {
    accessorKey: "assignedQaName",
    header: "QA",
    meta: {
      mobileLabel: "QA",
    },
    cell: ({ row }) => (
      <div>{row.original.assignedQaName || "Unassigned"}</div>
    ),
  },
  {
    accessorKey: "developmentEstimation",
    header: "Dev Est.",
    meta: {
      mobileLabel: "Dev estimation",
    },
    cell: ({ row }) => (
      <div>{formatEstimate(row.original.developmentEstimation)}</div>
    ),
  },
  {
    accessorKey: "estimationTesting",
    header: "QA Est.",
    meta: {
      mobileLabel: "QA estimation",
    },
    cell: ({ row }) => (
      <div>{formatEstimate(row.original.estimationTesting)}</div>
    ),
  },
  {
    accessorKey: "devTimeSpent",
    header: "Dev Spent",
    meta: {
      mobileLabel: "Dev spent",
    },
    cell: ({ row }) => <div>{formatEstimate(row.original.devTimeSpent)}</div>,
  },
  {
    accessorKey: "testingTimeSpent",
    header: "QA Spent",
    meta: {
      mobileLabel: "QA spent",
    },
    cell: ({ row }) => (
      <div>{formatEstimate(row.original.testingTimeSpent)}</div>
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
              <DropdownMenuItem onClick={() => onEdit(ticket)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
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
              onEdit(ticket);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
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
