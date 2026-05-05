const STORAGE_KEY = "sprintOverviewBySprintId";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getStoredSprintOverviewId(sprintId: string): string | null {
  const map = readMap();
  return map[sprintId] ?? null;
}

export function storeSprintOverviewId(sprintId: string, overviewId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const nextMap = {
      ...readMap(),
      [sprintId]: overviewId,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMap));
  } catch {
    // Ignore storage failures; API lookup still acts as fallback.
  }
}
