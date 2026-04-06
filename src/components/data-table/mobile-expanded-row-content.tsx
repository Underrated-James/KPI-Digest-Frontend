"use client";

import { flexRender, type Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface MobileExpandedRowContentProps<TData> {
  row: Row<TData>;
  className?: string;
}

export function MobileExpandedRowContent<TData>({
  row,
  className,
}: MobileExpandedRowContentProps<TData>) {
  const hiddenCells = row.getAllCells().filter((cell) => {
    if (cell.column.id === "select") {
      return false;
    }

    return !cell.column.getIsVisible();
  });

  const actionCells = hiddenCells.filter(
    (cell) => cell.column.columnDef.meta?.mobileSection === "actions"
  );
  const detailCells = hiddenCells.filter(
    (cell) => cell.column.columnDef.meta?.mobileSection !== "actions"
  );

  if (hiddenCells.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-b-2xl border-t border-border bg-muted/40 px-4 pb-5 pt-4",
        className
      )}
    >
      <div className="space-y-5">
        {detailCells.map((cell) => {
          const meta = cell.column.columnDef.meta;

          return (
            <section key={cell.id} className="space-y-2">
              {meta?.mobileLabel ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {meta.mobileLabel}
                </p>
              ) : null}

              <div className="min-w-0 text-sm text-foreground">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </section>
          );
        })}

        {actionCells.length > 0 ? (
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Actions
            </p>
            <div className="h-px w-full bg-border" />
            <div className="grid grid-cols-2 gap-3">
              {actionCells.map((cell) => (
                <div key={cell.id} className="min-w-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
