"use client";

import { useQuery } from "@tanstack/react-query";
import { sprintOverviewApi } from "../../infrastructure/api/sprint-overview-api";

export function useSprintOverview(overviewId: string) {
  return useQuery({
    queryKey: ["sprint-overviews", "detail", overviewId],
    queryFn: () => sprintOverviewApi.getSprintOverviewById(overviewId),
    enabled: Boolean(overviewId),
    staleTime: 1000 * 60 * 5,
  });
}
