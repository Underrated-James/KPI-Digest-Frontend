import type { LeaveDays } from "@/features/teams/domain/types/team-types";

export interface SprintTeamMember {
  userId: string;
  name: string;
  role: "DEVS" | "QA";
  allocationPercentage: number;
  leave?: LeaveDays[];
}
