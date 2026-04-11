"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Project, ProjectStatus } from "@/features/projects/domain/types/project-types";
import { pushSprintsUrl } from "../utils/sprint-url-state";

interface SprintProjectTableProps {
  data: Project[];
  total: number;
  onProjectSelect: (project: Project) => void;
  hidePagination?: boolean;
}

function getStatusStyles(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "inactive":
      return "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
    case "inProgress":
      return "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
    default:
      return "border-border bg-muted text-foreground";
  }
}

function getStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "inProgress":
      return "In Progress";
    default:
      return status;
  }
}

export function SprintProjectTable({
  data,
  total,
  onProjectSelect,
  hidePagination = false,
}: SprintProjectTableProps) {
  const pageSizeOptions = [5, 10, 20, 50];
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get("projectPage")) || 1;
  const size = Number(searchParams.get("projectSize")) || 10;
  const totalPages = Math.max(1, Math.ceil(total / size));

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("projectPage", newPage.toString());
    pushSprintsUrl(pathname, params);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("projectPage", "1");
    params.set("projectSize", newSize.toString());
    pushSprintsUrl(pathname, params);
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

  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-14 text-center text-muted-foreground">
          <p className="text-base font-medium text-foreground">No projects found.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting the search or status filter.
          </p>
        </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table className="relative w-full table-fixed md:min-w-[920px]">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="py-3 pl-4 pr-3 text-muted-foreground md:p-4">
                Project Name
              </TableHead>
              <TableHead className="py-3 px-3 text-muted-foreground md:p-4">
                Number of Sprints
              </TableHead>
              <TableHead className="py-3 px-3 text-muted-foreground md:p-4">
                Project Status
              </TableHead>
              <TableHead className="py-3 px-3 text-muted-foreground md:p-4">
                Created Date
              </TableHead>
              <TableHead className="py-3 pl-3 pr-4 text-muted-foreground md:p-4">
                Updated Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((project) => (
              <TableRow
                key={project.id}
                tabIndex={0}
                role="button"
                aria-label={`Open ${project.name} sprints`}
                onClick={() => onProjectSelect(project)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onProjectSelect(project);
                  }
                }}
                className="cursor-pointer border-border transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <TableCell className="py-4 pl-4 pr-3 align-middle">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {project.name}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="py-4 px-3 align-middle">
                  <span className="font-mono text-foreground">
                    {project.sprintCount}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-3 align-middle">
                  <Badge
                    variant="outline"
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                      getStatusStyles(project.status),
                    )}
                  >
                    {getStatusLabel(project.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-3 align-middle text-muted-foreground">
                  {format(new Date(project.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="py-4 pl-3 pr-4 align-middle text-muted-foreground">
                  {format(new Date(project.updatedAt), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!hidePagination && data.length > 0 ? (
        <div className="mt-6 flex w-full flex-col gap-3 pb-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <label htmlFor="project-page-size">Rows per page:</label>
            <div className="relative">
              <select
                id="project-page-size"
                value={size}
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
                className="h-8 appearance-none rounded-full border border-border bg-background px-3 pr-8 text-foreground outline-none transition focus:border-ring"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                ▾
              </span>
            </div>
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
      ) : null}
    </div>
  );
}
