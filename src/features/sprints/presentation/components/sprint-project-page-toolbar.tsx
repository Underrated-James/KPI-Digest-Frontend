"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectStatus } from "@/features/projects/domain/types/project-types";

const statusOptions: Array<{ label: string; value: ProjectStatus | "ALL" }> = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "In-Progress", value: "inProgress" },
];

interface SprintProjectPageToolbarProps {
  searchTerm: string;
  selectedStatus: ProjectStatus | null;
  isMobile: boolean;
  onSearchTermChange: (value: string) => void;
  onStatusChange: (status: ProjectStatus | "ALL") => void;
}

export function SprintProjectPageToolbar({
  searchTerm,
  selectedStatus,
  isMobile,
  onSearchTermChange,
  onStatusChange,
}: SprintProjectPageToolbarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)] xl:flex-1">
          <div className="space-y-3">
            <label
              htmlFor="project-search"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Search Projects
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="project-search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder={isMobile ? "Search projects..." : "Search by keyword..."}
                className="h-11 border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="project-status-filter"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Filter By Status
            </label>
            <div className="relative">
              <select
                id="project-status-filter"
                value={selectedStatus ?? "ALL"}
                onChange={(event) =>
                  onStatusChange(event.target.value as ProjectStatus | "ALL")
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

      </div>
    </div>
  );
}
