"use client";

import { useQuery } from "@tanstack/react-query";
import { sprintOverviewApi } from "../../infrastructure/api/sprint-overview-api";
import { getStoredSprintOverviewId } from "../utils/sprint-overview-storage";

export function useSprintOverviewBySprint(sprintId: string) {
  return useQuery({
    queryKey: ["sprint-overviews", "by-sprint", sprintId],
    queryFn: async () => {
      const storedOverviewId = getStoredSprintOverviewId(sprintId);
      if (storedOverviewId) {
        try {
          return await sprintOverviewApi.getSprintOverviewById(storedOverviewId);
        } catch {
          // Fall back to the backend lookup in case local storage is stale.
        }
      }

      return sprintOverviewApi.findSprintOverviewBySprintId(sprintId);
    },
    enabled: Boolean(sprintId),
    staleTime: 1000 * 60 * 5,
  });
}
