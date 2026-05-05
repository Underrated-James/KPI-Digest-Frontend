"use client";

import { use } from "react";
import { SprintOverviewBySprintPage } from "@/features/sprint-overviews/presentation/components/sprint-overview-page";

interface Props {
  params: Promise<{ sprintId: string }>;
}

export default function SprintOverviewBySprintRoute({ params }: Props) {
  const { sprintId } = use(params);
  return <SprintOverviewBySprintPage sprintId={sprintId} />;
}
