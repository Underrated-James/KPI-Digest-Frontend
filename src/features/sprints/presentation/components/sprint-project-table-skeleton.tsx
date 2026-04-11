"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="p-4">
        <Skeleton className="h-4 w-32 sm:w-44" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-28 sm:w-32" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-28 sm:w-32" />
      </td>
    </tr>
  );
}

interface SprintProjectTableSkeletonProps {
  rows?: number;
}

export function SprintProjectTableSkeleton({
  rows = 8,
}: SprintProjectTableSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading projects"
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)]">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full md:min-w-[920px]">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-32" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-28" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-28" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-28" />
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
