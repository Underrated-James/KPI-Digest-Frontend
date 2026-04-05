"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExpandableRows } from "@/hooks/use-expandable-rows";
import { cn } from "@/lib/utils";
import { MobileExpandedRowContent } from "./mobile-expanded-row-content";

interface ExpandableDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isMobile: boolean;
  getRowId: (row: TData) => string;
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  emptyState?: React.ReactNode;
  getExpandedRowLabel?: (row: TData) => string;
}

function getColumnHeaderClass(columnId: string) {
  if (columnId === "select") {
    return "w-12 pl-3 pr-2 md:w-auto md:px-2";
  }

  if (columnId === "status") {
    return "w-[134px] whitespace-nowrap py-3 pl-2 pr-3 text-right md:w-auto md:p-2 md:text-left";
  }

  if (columnId === "name") {
    return "py-3 pl-1 pr-2 md:p-2";
  }

  return undefined;
}

function getColumnCellClass(columnId: string) {
  if (columnId === "select") {
    return "w-12 align-middle pl-3 pr-2 md:w-auto md:px-2";
  }

  if (columnId === "name") {
    return "w-full whitespace-normal align-middle py-3 pl-1 pr-2 md:w-auto md:p-2";
  }

  if (columnId === "status") {
    return "w-[134px] whitespace-nowrap py-3 pl-2 pr-3 text-right align-middle md:w-auto md:p-2 md:text-left";
  }

  return undefined;
}

export function ExpandableDataTable<TData>({
  data,
  columns,
  isMobile,
  getRowId,
  selectedRowIds = [],
  onSelectionChange,
  emptyState,
  getExpandedRowLabel,
}: ExpandableDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { expandedRows, onExpandedChange, toggleRow, collapseAll } =
    useExpandableRows<string>();

  const rowSelection = React.useMemo(
    () =>
      selectedRowIds.reduce((accumulator, id) => {
        accumulator[id] = true;
        return accumulator;
      }, {} as Record<string, boolean>),
    [selectedRowIds]
  );

  const hasMobileHiddenColumns = React.useMemo(
    () =>
      columns.some(
        (column) =>
          column.id !== "select" && column.meta?.mobileVisible !== true
      ),
    [columns]
  );

  const columnVisibility = React.useMemo(
    () =>
      columns.reduce((visibility, column) => {
        const columnId =
          "id" in column && typeof column.id === "string"
            ? column.id
            : "accessorKey" in column && typeof column.accessorKey === "string"
              ? column.accessorKey
              : undefined;

        if (!columnId) {
          return visibility;
        }

        visibility[columnId] =
          !isMobile || column.meta?.mobileVisible === true || columnId === "select";

        return visibility;
      }, {} as Record<string, boolean>),
    [columns, isMobile]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onExpandedChange,
    onRowSelectionChange: onSelectionChange
      ? (updater) => {
          const nextSelection =
            typeof updater === "function" ? updater(rowSelection) : updater;
          const nextSelectedIds = Object.keys(nextSelection).filter(
            (key) => nextSelection[key]
          );

          onSelectionChange(nextSelectedIds);
        }
      : undefined,
    enableRowSelection: Boolean(onSelectionChange),
    getRowCanExpand: () => isMobile && hasMobileHiddenColumns,
    state: {
      sorting,
      expanded: expandedRows,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    if (!isMobile) {
      collapseAll();
    }
  }, [collapseAll, isMobile]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        {emptyState ?? <p>No results found.</p>}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
      <Table className="relative w-full table-fixed md:min-w-[600px] md:table-auto">
        <TableHeader className="sticky top-0 z-10 bg-zinc-950 shadow-[0_1px_0_0_rgba(39,39,42,1)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-zinc-800 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "text-zinc-400",
                    getColumnHeaderClass(header.column.id)
                  )}
                >
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
          {table.getRowModel().rows.map((row) => {
            const isExpandableRow = row.getCanExpand();
            const isExpandedRow = row.getIsExpanded();
            const rowId = getRowId(row.original);
            const rowLabel = getExpandedRowLabel?.(row.original) ?? rowId;

            return (
              <React.Fragment key={row.id}>
                <TableRow
                  aria-expanded={isExpandableRow ? isExpandedRow : undefined}
                  aria-label={
                    isExpandableRow
                      ? `Toggle details for ${rowLabel}`
                      : undefined
                  }
                  tabIndex={isExpandableRow ? 0 : undefined}
                  onClick={isExpandableRow ? () => toggleRow(rowId) : undefined}
                  onKeyDown={
                    isExpandableRow
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleRow(rowId);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "border-zinc-800 transition-colors data-[state=selected]:bg-zinc-900/50 hover:bg-zinc-900/30",
                    isExpandableRow &&
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        getColumnCellClass(cell.column.id)
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                <AnimatePresence initial={false}>
                  {isExpandableRow && isExpandedRow ? (
                    <TableRow className="border-zinc-800 bg-zinc-950 hover:bg-zinc-950 md:hidden">
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="px-3 pb-3 pt-0"
                      >
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <MobileExpandedRowContent row={row} />
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
