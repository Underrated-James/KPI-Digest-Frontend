"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../domain/types/user-types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface ColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 whitespace-normal break-words">
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="whitespace-normal break-all text-zinc-200">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.role}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status;

      return (
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            isActive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isActive ? "bg-emerald-400" : "bg-red-400"
            }`}
            aria-hidden="true"
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onEdit(user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(user.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
