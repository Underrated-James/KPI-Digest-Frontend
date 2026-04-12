"use client";

import * as React from "react";
import {
  type ColumnDef,
  type Row,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { usePathname, useSearchParams } from "next/navigation";
import { ExpandableDataTable } from "@/components/data-table/expandable-data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket } from "../../domain/types/ticket-types";
import { getColumns } from "./columns";
import { pushTicketsUrl } from "../utils/tickets-url-state";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TicketTableProps {
  data: Ticket[];
  total: number;
  isMobile: boolean;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  selectedTicketIds: string[];
  onSelectionChange: (ids: string[]) => void;
  hidePagination?: boolean;
}

export function TicketTable({
  data,
  total,
  isMobile,
  onEdit,
  onDelete,
  selectedTicketIds,
  onSelectionChange,
  hidePagination = false,
}: TicketTableProps) {
  const pageSizeOptions = [5, 10, 20, 50];
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const totalPages = Math.max(1, Math.ceil(total / size));

  const columns = React.useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        id: "select",
        header: ({ table }: { table: TanStackTable<Ticket> }) => (
          <div
            className="flex justify-center"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-background accent-primary"
              checked={table.getIsAllPageRowsSelected()}
              onChange={(event) =>
                table.toggleAllPageRowsSelected(event.target.checked)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }: { row: Row<Ticket> }) => (
          <div
            className="flex justify-center"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-background accent-primary"
              checked={row.getIsSelected()}
              onChange={(event) => row.toggleSelected(event.target.checked)}
              aria-label={`Select ${row.original.ticketNumber}`}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...getColumns({ onEdit, onDelete }),
    ],
    [onDelete, onEdit],
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    pushTicketsUrl(pathname, params);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("size", newSize.toString());
    pushTicketsUrl(pathname, params);
  };

  const pageStart = total === 0 ? 0 : (page - 1) * size + 1;
  const pageEnd = total === 0 ? 0 : pageStart + data.length - 1;

  const visiblePages = React.useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3];
    }

    if (page >= totalPages - 2) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  return (
    <div className="w-full space-y-4">
      <ExpandableDataTable
        columns={columns}
        data={data}
        isMobile={isMobile}
        getRowId={(row) => row.id}
        selectedRowIds={selectedTicketIds}
        onSelectionChange={onSelectionChange}
        getExpandedRowLabel={(row) => row.ticketNumber}
      />

      {!hidePagination && (
        <div className="mt-6 flex w-full flex-col gap-3 pb-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <label htmlFor="ticket-page-size">Rows per page:</label>
            <Select
              value={size.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger
                id="ticket-page-size"
                size="sm"
                className="h-8 w-[84px] rounded-full border-border bg-background px-3 text-foreground shadow-none"
              >
                <SelectValue placeholder={size.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-muted-foreground">
            {pageStart}-{pageEnd} of {total}
          </div>

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
                      : "cursor-pointer border-border bg-background text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                  }
                />
              </PaginationItem>

              {visiblePages[0] > 1 ? (
                <>
                  <PaginationItem>
                    <Button
                      variant={page === 1 ? "default" : "ghost"}
                      size="icon"
                      aria-current={page === 1 ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(1);
                      }}
                      className={`h-9 w-9 cursor-pointer ${
                        page === 1
                          ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      1
                    </Button>
                  </PaginationItem>

                  {visiblePages[0] > 2 ? (
                    <PaginationItem>
                      <PaginationEllipsis className="text-muted-foreground" />
                    </PaginationItem>
                  ) : null}
                </>
              ) : null}

              {visiblePages.map((currentPage) => (
                <PaginationItem key={currentPage}>
                  <Button
                    variant={page === currentPage ? "default" : "ghost"}
                    size="icon"
                    aria-current={page === currentPage ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(currentPage);
                    }}
                    className={`h-9 w-9 cursor-pointer ${
                      page === currentPage
                        ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {currentPage}
                  </Button>
                </PaginationItem>
              ))}

              {visiblePages.at(-1) && visiblePages.at(-1)! < totalPages ? (
                <>
                  {visiblePages.at(-1)! < totalPages - 1 ? (
                    <PaginationItem>
                      <PaginationEllipsis className="text-muted-foreground" />
                    </PaginationItem>
                  ) : null}

                  <PaginationItem>
                    <Button
                      variant={page === totalPages ? "default" : "ghost"}
                      size="icon"
                      aria-current={page === totalPages ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(totalPages);
                      }}
                      className={`h-9 w-9 cursor-pointer ${
                        page === totalPages
                          ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </PaginationItem>
                </>
              ) : null}

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
                      : "cursor-pointer border-border bg-background text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
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
