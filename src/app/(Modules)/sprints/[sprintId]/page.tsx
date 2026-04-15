"use client";

import { use } from "react";
import { SprintCanvasPage } from "@/features/sprints/presentation/components/sprint-canvas-page";

interface Props {
  params: Promise<{ sprintId: string }>;
}

export default function SprintCanvasRoute({ params }: Props) {
  const { sprintId } = use(params);
  return <SprintCanvasPage sprintId={sprintId} />;
}
