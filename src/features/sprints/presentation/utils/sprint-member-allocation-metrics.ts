import { LeaveType } from "@/features/teams/domain/types/team-types";
import type { Sprint } from "../../domain/types/sprint-types";
import { getSprintWorkdayKeys, normalizeDate } from "./sprint-date-utils";

export type AllocationMember = {
  userId: string;
  name: string;
  role: "DEVS" | "QA";
  hoursPerDay: number;
  leave?: Array<{ leaveDate: string; leaveType: LeaveType[] }>;
};

export type TicketCommitInput = {
  assignedDevId: string | null;
  assignedQaId: string | null;
  developmentEstimation: number;
  estimationTesting: number;
  devTimeSpent: number;
  testingTimeSpent: number;
};

function getLeaveWeight(leaveTypes: LeaveType[] = []) {
  if (leaveTypes.includes(LeaveType.HALF_DAY_LEAVE)) return 0.5;
  return leaveTypes.length > 0 ? 1 : 0;
}

export type MemberAllocationRow = {
  userId: string;
  name: string;
  role: "DEVS" | "QA";
  sprintCapacity: number;
  committed: number;
  timeSpent: number;
  available: number;
  utilization: number;
  isZeroCapacity: boolean;
};

export function computeMemberAllocationMetrics(
  sprint: Sprint,
  members: AllocationMember[],
  tickets: TicketCommitInput[],
) {
  const workDays = getSprintWorkdayKeys(sprint.startDate, sprint.endDate);
  const holidaySet = new Set(
    (sprint.dayOff ?? []).map((d) => normalizeDate(d.date)),
  );
  const committedMap = new Map<string, number>();
  const timeSpentMap = new Map<string, number>();

  for (const ticket of tickets) {
    if (ticket.assignedDevId) {
      committedMap.set(
        ticket.assignedDevId,
        (committedMap.get(ticket.assignedDevId) ?? 0) +
          Number(ticket.developmentEstimation || 0),
      );
      timeSpentMap.set(
        ticket.assignedDevId,
        (timeSpentMap.get(ticket.assignedDevId) ?? 0) +
          Number(ticket.devTimeSpent || 0),
      );
    }
    if (ticket.assignedQaId) {
      committedMap.set(
        ticket.assignedQaId,
        (committedMap.get(ticket.assignedQaId) ?? 0) +
          Number(ticket.estimationTesting || 0),
      );
      timeSpentMap.set(
        ticket.assignedQaId,
        (timeSpentMap.get(ticket.assignedQaId) ?? 0) +
          Number(ticket.testingTimeSpent || 0),
      );
    }
  }

  const byMember: MemberAllocationRow[] = members.map((member) => {
    let workingDays = 0;
    let leaveDeduction = 0;

    const leaveByDate = new Map(
      (member.leave ?? []).map((leave) => [
        normalizeDate(leave.leaveDate),
        leave.leaveType,
      ]),
    );

    for (const day of workDays) {
      if (holidaySet.has(day)) continue;
      workingDays += 1;
      const leaveTypes = leaveByDate.get(day);
      leaveDeduction += getLeaveWeight(leaveTypes);
    }

    const actualWorkingDays = Math.max(workingDays - leaveDeduction, 0);
    const sprintCapacity = Number(
      (member.hoursPerDay * actualWorkingDays).toFixed(2),
    );
    const committed = Number(
      (committedMap.get(member.userId) ?? 0).toFixed(2),
    );
    const timeSpent = Number((timeSpentMap.get(member.userId) ?? 0).toFixed(2));
    const available = Number((sprintCapacity - committed).toFixed(2));
    const utilization =
      sprintCapacity <= 0
        ? committed > 0
          ? 100
          : 0
        : Number(((committed / sprintCapacity) * 100).toFixed(2));

    return {
      userId: member.userId,
      name: member.name,
      role: member.role,
      sprintCapacity,
      committed,
      timeSpent,
      available,
      utilization,
      isZeroCapacity: sprintCapacity === 0,
    };
  });

  const totalSprintCapacity = Number(
    byMember.reduce((sum, m) => sum + m.sprintCapacity, 0).toFixed(2),
  );
  const totalCommitted = Number(
    byMember.reduce((sum, m) => sum + m.committed, 0).toFixed(2),
  );
  const totalTimeSpent = Number(
    byMember.reduce((sum, m) => sum + m.timeSpent, 0).toFixed(2),
  );
  const totalAvailable = Number(
    (totalSprintCapacity - totalCommitted).toFixed(2),
  );
  const hasOverCapacity = byMember.some((m) => m.available < 0);

  return {
    byMember,
    totalSprintCapacity,
    totalCommitted,
    totalTimeSpent,
    totalAvailable,
    hasOverCapacity,
  };
}

export function utilizationBarClass(utilization: number) {
  if (utilization > 100) return "bg-destructive";
  if (utilization >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}
