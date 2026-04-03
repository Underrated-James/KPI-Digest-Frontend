"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  type Row,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "../../domain/types/user-types";
import { getColumns } from "./columns";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import * as React from "react";

interface UserTableProps {
  data: User[];
  total: number;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  selectedUserIds: string[];
  onSelectionChange: (ids: string[]) => void;
  hidePagination?: boolean;
}

export function UserTable({ 
  data, 
  total, 
  onEdit, 
  onDelete,
  selectedUserIds,
  onSelectionChange,
  hidePagination = false,
}: UserTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const totalPages = Math.ceil(total / size);

  const columns = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }: { table: TanStackTable<User> }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-sky-500"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<User> }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-sky-500"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...getColumns({ onEdit, onDelete })
  ], [onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(table.getState().rowSelection) : updater;
      const selectedIds = Object.keys(newSelection)
        .filter((key) => newSelection[key])
        .map((index) => data[Number.parseInt(index, 10)]?.id)
        .filter((id): id is string => Boolean(id));
      onSelectionChange(selectedIds);
    },
    state: {
      sorting,
      rowSelection: selectedUserIds.reduce((acc, id) => {
        const index = data.findIndex(u => u.id === id);
        if (index !== -1) acc[index] = true;
        return acc;
      }, {} as Record<string, boolean>),
    },
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="w-full rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden">
        <Table className="min-w-[600px] w-full relative">
          <TableHeader className="sticky top-0 bg-zinc-950 z-10 shadow-[0_1px_0_0_rgba(39,39,42,1)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-zinc-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-zinc-400">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id} 
                className="border-zinc-800 data-[state=selected]:bg-zinc-900/50 hover:bg-zinc-900/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      {!hidePagination && totalPages > 1 && (
        <div className="mt-6 flex w-full flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500 hidden sm:block">
            Page {page} of {totalPages}
          </p>
          
          <Pagination className="mx-0 w-full sm:w-auto">
            <PaginationContent className="flex-wrap justify-start gap-1 sm:justify-end">
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-zinc-900"}
                />
              </PaginationItem>

              {/* Dynamic Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <Button
                    variant={page === p ? "outline" : "ghost"}
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(p);
                    }}
                    className={`h-9 w-9 cursor-pointer ${
                      page === p ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    {p}
                  </Button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-zinc-900"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
