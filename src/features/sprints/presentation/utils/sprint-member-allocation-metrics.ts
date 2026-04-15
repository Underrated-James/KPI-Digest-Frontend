import { LeaveType } from "@/features/teams/domain/types/team-types";
import type { Sprint } from "../../domain/types/sprint-types";

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
};

export function normalizeAllocationDate(date: string) {
  return date.split("T")[0];
}

function getWorkDays(start: string, end: string) {
  const result: string[] = [];
  const current = new Date(`${normalizeAllocationDate(start)}T00:00:00`);
  const last = new Date(`${normalizeAllocationDate(end)}T00:00:00`);
  while (current <= last) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      result.push(current.toISOString().slice(0, 10));
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
}

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
  available: number;
  utilization: number;
  isZeroCapacity: boolean;
};

export function computeMemberAllocationMetrics(
  sprint: Sprint,
  members: AllocationMember[],
  tickets: TicketCommitInput[],
) {
  const workDays = getWorkDays(sprint.startDate, sprint.endDate);
  const holidaySet = new Set(
    (sprint.dayOff ?? []).map((d) => normalizeAllocationDate(d.date)),
  );
  const committedMap = new Map<string, number>();

  for (const ticket of tickets) {
    if (ticket.assignedDevId) {
      committedMap.set(
        ticket.assignedDevId,
        (committedMap.get(ticket.assignedDevId) ?? 0) +
          Number(ticket.developmentEstimation || 0),
      );
    }
    if (ticket.assignedQaId) {
      committedMap.set(
        ticket.assignedQaId,
        (committedMap.get(ticket.assignedQaId) ?? 0) +
          Number(ticket.estimationTesting || 0),
      );
    }
  }

  const byMember: MemberAllocationRow[] = members.map((member) => {
    let workingDays = 0;
    let leaveDeduction = 0;

    const leaveByDate = new Map(
      (member.leave ?? []).map((leave) => [
        normalizeAllocationDate(leave.leaveDate),
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
  const totalAvailable = Number(
    (totalSprintCapacity - totalCommitted).toFixed(2),
  );
  const hasOverCapacity = byMember.some((m) => m.available < 0);

  return {
    byMember,
    totalSprintCapacity,
    totalCommitted,
    totalAvailable,
    hasOverCapacity,
  };
}

export function utilizationBarClass(utilization: number) {
  if (utilization > 100) return "bg-destructive";
  if (utilization >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}
