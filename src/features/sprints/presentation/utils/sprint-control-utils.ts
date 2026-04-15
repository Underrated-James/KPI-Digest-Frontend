import type { Sprint } from "../../domain/types/sprint-types";

export function canEditSprintDetails(sprint: Sprint): boolean {
  return sprint.status === "draft" || sprint.status === "inactive";
}

export function isSprintViewOnly(sprint: Sprint): boolean {
  return sprint.status === "active" || sprint.status === "completed";
}

export function getSprintDisplayStatus(sprint: Sprint): string {
  if (sprint.status === "inactive" && sprint.officialStartDate) {
    return "paused";
  }
  return sprint.status;
}

export function getSprintStatusLabel(sprint: Sprint): string {
  const key = getSprintDisplayStatus(sprint);
  const labels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    paused: "Paused",
    draft: "Draft",
    completed: "Completed",
  };
  return labels[key] ?? sprint.status;
}

export function canStartSprint(sprint: Sprint): boolean {
  return sprint.status === "draft" || sprint.status === "inactive";
}

export function canPauseSprint(sprint: Sprint): boolean {
  return sprint.status === "active";
}

export function canCompleteSprint(sprint: Sprint): boolean {
  if (sprint.status === "active") return true;
  if (sprint.status === "inactive" && sprint.officialStartDate) return true;
  return false;
}

export function isSprintStartReady(hasTeam: boolean, ticketCount: number): boolean {
  return hasTeam && ticketCount > 0;
}
