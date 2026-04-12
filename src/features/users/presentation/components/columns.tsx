"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "../../domain/types/user-types";

interface ColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      mobileLabel: "Name",
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
    accessorKey: "email",
    header: "Email",
    meta: {
      mobileLabel: "Email",
    },
    cell: ({ row }) => (
      <span className="whitespace-normal break-all text-foreground/85 md:break-words">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      mobileLabel: "Role",
    },
    cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      mobileLabel: "Status",
      mobileVisible: true,
    },
    cell: ({ row }) => {
      const isActive = row.original.status;
      const statusStyles = isActive
        ? "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
      const dotStyles = isActive
        ? "bg-emerald-500 dark:bg-emerald-400"
        : "bg-rose-500 dark:bg-rose-400";
      const label = isActive ? "Active" : "Inactive";

      return (
        <>
          <span
            className={cn(
              "hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusStyles,
            )}
          >
            <span
              className={cn("h-2.5 w-2.5 rounded-full", dotStyles)}
              aria-hidden="true"
            />
            {label}
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
                  : "text-rose-950 dark:text-rose-300",
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", dotStyles)} aria-hidden="true" />
              {label}
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
      const user = row.original;

      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(user);
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
              onEdit(user);
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
              onDelete(user.id);
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
              onDelete(user.id);
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
