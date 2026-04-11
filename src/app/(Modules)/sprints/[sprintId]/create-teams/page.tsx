"use client";

import { use } from "react";
import { SprintTeamsPage } from "@/features/sprints/presentation/components/sprint-teams/sprint-teams-page";

interface Props {
  params: Promise<{ sprintId: string }>;
}

export default function CreateTeamsPage({ params }: Props) {
  const { sprintId } = use(params);

  return <SprintTeamsPage sprintId={sprintId} />;
}
