"use client";

import * as React from "react";
import { type ColumnDef, type Row, type Table as TanStackTable } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExpandableDataTable } from "@/components/data-table/expandable-data-table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { User } from "../../domain/types/user-types";
import { getColumns } from "./columns";

interface UserTableProps {
  data: User[];
  total: number;
  isMobile: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  selectedUserIds: string[];
  onSelectionChange: (ids: string[]) => void;
  hidePagination?: boolean;
}

export function UserTable({
  data,
  total,
  isMobile,
  onEdit,
  onDelete,
  selectedUserIds,
  onSelectionChange,
  hidePagination = false,
}: UserTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const totalPages = Math.ceil(total / size);

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "select",
        header: ({ table }: { table: TanStackTable<User> }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-sky-500"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(event) =>
              table.toggleAllPageRowsSelected(event.target.checked)
            }
            onClick={(event) => event.stopPropagation()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<User> }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-sky-500"
            checked={row.getIsSelected()}
            onChange={(event) => row.toggleSelected(event.target.checked)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          mobileVisible: true,
        },
      },
      ...getColumns({ onEdit, onDelete }),
    ],
    [onDelete, onEdit]
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-4">
      <ExpandableDataTable
        data={data}
        columns={columns}
        isMobile={isMobile}
        getRowId={(user) => user.id}
        selectedRowIds={selectedUserIds}
        onSelectionChange={onSelectionChange}
        emptyState={<p>No users found.</p>}
        getExpandedRowLabel={(user) => user.name}
      />

      {!hidePagination && totalPages > 1 && (
        <div className="mt-6 flex w-full flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-sm text-zinc-500 sm:block">
            Page {page} of {totalPages}
          </p>

          <Pagination className="mx-0 w-full sm:w-auto">
            <PaginationContent className="flex-wrap justify-start gap-1 sm:justify-end">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-zinc-900"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (currentPage) => (
                  <PaginationItem key={currentPage}>
                    <Button
                      variant={page === currentPage ? "outline" : "ghost"}
                      size="icon"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(currentPage);
                      }}
                      className={`h-9 w-9 cursor-pointer ${
                        page === currentPage
                          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      {currentPage}
                    </Button>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-zinc-900"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
