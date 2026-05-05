"use client";

import { use } from "react";
import { SprintOverviewPage } from "@/features/sprint-overviews/presentation/components/sprint-overview-page";

interface Props {
  params: Promise<{ overviewId: string }>;
}

export default function SprintOverviewRoute({ params }: Props) {
  const { overviewId } = use(params);
  return <SprintOverviewPage overviewId={overviewId} />;
}
