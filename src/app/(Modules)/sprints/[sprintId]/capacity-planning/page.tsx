"use client";

import { use } from "react";
import { SprintCapacityPlanningPage } from "@/features/sprints/presentation/components/sprint-capacity-planning-page";

interface Props {
  params: Promise<{ sprintId: string }>;
}

export default function CapacityPlanningRoute({ params }: Props) {
  const { sprintId } = use(params);
  return <SprintCapacityPlanningPage sprintId={sprintId} />;
}
