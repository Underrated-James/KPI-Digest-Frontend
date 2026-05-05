import type { TicketStatus } from "@/features/tickets/domain/types/ticket-types";

export interface SprintOverviewHoliday {
  name: string;
  date: string;
}

export interface SprintOverviewSummary {
  totalCapacity: number;
  totalCommitted: number;
  totalAvailable: number;
  totalSpent: number;
  utilization: number;
}

export interface SprintOverviewLeaveTimelineItem {
  date: string;
  status: string;
}

export interface SprintOverviewMemberMetric {
  userId: string;
  name: string;
  role: "DEVS" | "QA";
  rhythm: number;
  sprintCapacity: number;
  committedCapacity: number;
  availableCapacity: number;
  timeSpent: number;
  utilization: number;
  leaveTimeline: SprintOverviewLeaveTimelineItem[];
}

export interface SprintOverviewTicket {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  devName: string;
  qaName: string;
  devEstimate: number;
  qaEstimate: number;
  devSpent: number;
  qaSpent: number;
}

export interface SprintOverview {
  id: string;
  projectId: string;
  projectName: string;
  sprintId: string;
  sprintName: string;
  sprintStatus: string;
  planningStatus: string;
  planningStart: string;
  planningEnd: string;
  workingDays: number;
  actualStart: string | null;
  actualEnd: string | null;
  teamRhythm: number;
  holidays: SprintOverviewHoliday[];
  teamId: string;
  finalizedAt: string;
  finalizedBy: string;
  summary: SprintOverviewSummary;
  memberMetrics: SprintOverviewMemberMetric[];
  sprintTickets: SprintOverviewTicket[];
}

export type CreateSprintOverviewDTO = Omit<SprintOverview, "id">;
