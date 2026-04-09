"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SprintStatus } from "../../domain/types/sprint-types";

const statusOptions: Array<{ label: string; value: SprintStatus | "ALL" }> = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
];

interface SprintPageToolbarProps {
  searchTerm: string;
  selectedStatus: SprintStatus | null;
  selectedSprintCount: number;
  isMobile: boolean;
  onSearchTermChange: (value: string) => void;
  onStatusChange: (status: SprintStatus | "ALL") => void;
  onAddSprint: () => void;
  onBulkDelete: () => void;
}

export function SprintPageToolbar({
  searchTerm,
  selectedStatus,
  selectedSprintCount,
  isMobile,
  onSearchTermChange,
  onStatusChange,
  onAddSprint,
  onBulkDelete,
}: SprintPageToolbarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)] xl:flex-1">
            <div className="space-y-3">
              <label
                htmlFor="sprint-search"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Search Sprints
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sprint-search"
                  value={searchTerm}
                  onChange={(event) => onSearchTermChange(event.target.value)}
                  placeholder={
                    isMobile
                      ? "Search sprints..."
                      : "Search by keyword..."
                  }
                  className="h-11 border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="sprint-status-filter"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Filter By Status
              </label>
              <div className="relative">
                <select
                  id="sprint-status-filter"
                  value={selectedStatus ?? "ALL"}
                  onChange={(event) =>
                    onStatusChange(event.target.value as SprintStatus | "ALL")
                  }
                  className="flex h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/50"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap xl:justify-end xl:self-end">
            <Button
              onClick={onAddSprint}
              className="h-11 w-full cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl md:w-auto md:min-w-[140px]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Sprint
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer border-destructive/20 text-destructive transition-all duration-200 hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[180px]"
              onClick={onBulkDelete}
              disabled={selectedSprintCount === 0}
            >
              <Trash2 className="mr-2 h-4 w-4 text-current" />
              Delete Selected ({selectedSprintCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
