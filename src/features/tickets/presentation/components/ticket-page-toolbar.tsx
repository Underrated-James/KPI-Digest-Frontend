"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketStatus } from "../../domain/types/ticket-types";
import { TICKET_STATUS_LABELS } from "../utils/ticket-status-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions: Array<{ label: string; value: TicketStatus | "ALL" }> = [
  { label: "All Status", value: "ALL" },
  { label: TICKET_STATUS_LABELS.open, value: "open" },
  { label: TICKET_STATUS_LABELS.inProgress, value: "inProgress" },
  { label: TICKET_STATUS_LABELS.done, value: "done" },
  { label: TICKET_STATUS_LABELS.cancelled, value: "cancelled" },
];

interface TicketPageToolbarProps {
  searchTerm: string;
  selectedStatus: TicketStatus | "ALL";
  selectedProjectId: string | null;
  projectOptions: Array<{
    id: string;
    name: string;
    projectCode: string;
  }>;
  selectedTicketCount: number;
  isMobile: boolean;
  onSearchTermChange: (value: string) => void;
  onStatusChange: (status: TicketStatus | "ALL") => void;
  onProjectChange: (projectId: string | "ALL") => void;
  onAddTicket: () => void;
  onBulkDelete: () => void;
}

export function TicketPageToolbar({
  searchTerm,
  selectedStatus,
  selectedProjectId,
  projectOptions,
  selectedTicketCount,
  isMobile,
  onSearchTermChange,
  onStatusChange,
  onProjectChange,
  onAddTicket,
  onBulkDelete,
}: TicketPageToolbarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_minmax(220px,0.9fr)] xl:flex-1">
            <div className="space-y-3">
              <label
                htmlFor="ticket-search"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Search Tickets
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="ticket-search"
                  value={searchTerm}
                  onChange={(event) => onSearchTermChange(event.target.value)}
                  placeholder={
                    isMobile ? "Search tickets..." : "Search by keyword..."
                  }
                  className="h-11 border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="ticket-status-filter"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Filter By Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(v) =>
                  onStatusChange(v as TicketStatus | "ALL")
                }
              >
                <SelectTrigger
                  id="ticket-status-filter"
                  className="h-11 w-full border-border bg-background text-foreground"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="ticket-project-filter"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Filter By Project
              </label>
              <Select
                value={selectedProjectId ?? "ALL"}
                onValueChange={(value) => onProjectChange(value as string | "ALL")}
              >
                <SelectTrigger
                  id="ticket-project-filter"
                  className="h-11 w-full border-border bg-background text-foreground"
                >
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Projects</SelectItem>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectCode
                        ? `${project.projectCode} - ${project.name}`
                        : project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap xl:justify-end xl:self-end">
            <Button
              onClick={onAddTicket}
              className="h-11 w-full cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl md:w-auto md:min-w-[140px]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Ticket
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer border-destructive/20 text-destructive transition-all duration-200 hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[180px]"
              onClick={onBulkDelete}
              disabled={selectedTicketCount === 0}
            >
              <Trash2 className="mr-2 h-4 w-4 text-current" />
              Delete Selected ({selectedTicketCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
