"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="w-12 p-4">
        <Skeleton className="h-4 w-4 rounded-sm" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-28 sm:w-40" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-24 sm:w-32" />
      </td>
      <td className="p-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </td>
    </tr>
  );
}

interface ProjectsTableSkeletonProps {
  rows?: number;
}

export function ProjectsTableSkeleton({
  rows = 8,
}: ProjectsTableSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading projects"
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)] xl:flex-1">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:self-end">
            <Skeleton className="h-11 w-full rounded-lg sm:w-[140px]" />
            <Skeleton className="h-11 w-full rounded-lg sm:w-[180px]" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full md:min-w-[520px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-12 p-4">
                <Skeleton className="h-4 w-4 rounded-sm" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-14" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
