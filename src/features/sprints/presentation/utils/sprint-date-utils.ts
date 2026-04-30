import { format } from "date-fns";

export function normalizeDate(dateStr: string): string {
  return dateStr.split("T")[0];
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getSprintDays(startDate: string, endDate: string): Date[] {
  const days: Date[] = [];
  const current = new Date(`${normalizeDate(startDate)}T00:00:00`);
  const end = new Date(`${normalizeDate(endDate)}T00:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getSprintWorkdayKeys(startDate: string, endDate: string): string[] {
  return getSprintDays(startDate, endDate)
    .filter((date) => !isWeekend(date))
    .map(formatDate);
}
