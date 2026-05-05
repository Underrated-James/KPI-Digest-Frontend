import { getApiClient, API_ENDPOINTS } from "@/core/api";
import type {
  CreateSprintOverviewDTO,
  SprintOverview,
  SprintOverviewHoliday,
  SprintOverviewLeaveTimelineItem,
  SprintOverviewMemberMetric,
  SprintOverviewSummary,
  SprintOverviewTicket,
} from "../../domain/types/sprint-overview-types";

type RawHoliday = Partial<SprintOverviewHoliday>;
type RawSummary = Partial<SprintOverviewSummary>;
type RawLeaveTimelineItem = Partial<SprintOverviewLeaveTimelineItem>;
type RawMemberMetric = Partial<SprintOverviewMemberMetric> & {
  _userId?: string;
  _name?: string;
  _rhythm?: number;
  _sprintCapacity?: number;
  _committedCapacity?: number;
  _availableCapacity?: number;
  _timeSpent?: number;
  _utilization?: number;
  _leaveTimeline?: RawLeaveTimelineItem[];
};
type RawTicket = Partial<SprintOverviewTicket> & {
  _id?: string;
  _ticketNumber?: string;
  _title?: string;
  _status?: SprintOverviewTicket["status"];
  _devName?: string;
  _qaName?: string;
  _devEstimate?: number;
  _qaEstimate?: number;
  _devSpent?: number;
  _qaSpent?: number;
};

type RawSprintOverview = Partial<SprintOverview> & {
  _id?: string;
  _sprintId?: string;
  _projectId?: string;
  _projectName?: string;
  _sprintName?: string;
  _sprintStatus?: string;
  _planningStatus?: string;
  _planningStart?: string;
  _planningEnd?: string;
  _workingDays?: number;
  _actualStart?: string | null;
  _actualEnd?: string | null;
  _teamRhythm?: number;
  _holidays?: RawHoliday[];
  _teamId?: string;
  _finalizedAt?: string;
  _finalizedBy?: string;
  _summary?: RawSummary;
  _memberMetrics?: RawMemberMetric[];
  _sprintTickets?: RawTicket[];
};

type RawOverviewWithData = RawSprintOverview & {
  data?: RawSprintOverview;
};

type RawOverviewEnvelope = {
  data?: RawSprintOverview;
  content?: RawSprintOverview[];
};

type RawOverviewListEnvelope = {
  data?: RawSprintOverview[] | { content?: RawSprintOverview[] };
  content?: RawSprintOverview[];
};

function unwrapOverview(raw: unknown): RawSprintOverview | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as RawOverviewWithData;
  if (candidate.data && typeof candidate.data === "object") {
    return candidate.data;
  }

  return candidate;
}

function normalizeHoliday(raw: RawHoliday): SprintOverviewHoliday {
  return {
    name: raw.name ?? "",
    date: raw.date ?? "",
  };
}

function normalizeSummary(raw: RawSummary | undefined): SprintOverviewSummary {
  return {
    totalCapacity: Number(raw?.totalCapacity ?? 0),
    totalCommitted: Number(raw?.totalCommitted ?? 0),
    totalAvailable: Number(raw?.totalAvailable ?? 0),
    totalSpent: Number(raw?.totalSpent ?? 0),
    utilization: Number(raw?.utilization ?? 0),
  };
}

function normalizeLeaveTimelineItem(
  raw: RawLeaveTimelineItem,
): SprintOverviewLeaveTimelineItem {
  return {
    date: raw.date ?? "",
    status: raw.status ?? "",
  };
}

function normalizeMemberMetric(raw: RawMemberMetric): SprintOverviewMemberMetric {
  return {
    userId: raw.userId ?? raw._userId ?? "",
    name: raw.name ?? raw._name ?? "Member",
    role: raw.role === "QA" ? "QA" : "DEVS",
    rhythm: Number(raw.rhythm ?? raw._rhythm ?? 0),
    sprintCapacity: Number(raw.sprintCapacity ?? raw._sprintCapacity ?? 0),
    committedCapacity: Number(
      raw.committedCapacity ?? raw._committedCapacity ?? 0,
    ),
    availableCapacity: Number(
      raw.availableCapacity ?? raw._availableCapacity ?? 0,
    ),
    timeSpent: Number(raw.timeSpent ?? raw._timeSpent ?? 0),
    utilization: Number(raw.utilization ?? raw._utilization ?? 0),
    leaveTimeline: (raw.leaveTimeline ?? raw._leaveTimeline ?? []).map(
      normalizeLeaveTimelineItem,
    ),
  };
}

function normalizeTicket(raw: RawTicket): SprintOverviewTicket {
  return {
    id: raw.id ?? raw._id ?? "",
    ticketNumber: raw.ticketNumber ?? raw._ticketNumber ?? "",
    title: raw.title ?? raw._title ?? "",
    status: raw.status ?? raw._status ?? "open",
    devName: raw.devName ?? raw._devName ?? "—",
    qaName: raw.qaName ?? raw._qaName ?? "—",
    devEstimate: Number(raw.devEstimate ?? raw._devEstimate ?? 0),
    qaEstimate: Number(raw.qaEstimate ?? raw._qaEstimate ?? 0),
    devSpent: Number(raw.devSpent ?? raw._devSpent ?? 0),
    qaSpent: Number(raw.qaSpent ?? raw._qaSpent ?? 0),
  };
}

function normalizeSprintOverview(raw: unknown): SprintOverview | null {
  const data = unwrapOverview(raw);
  if (!data) {
    return null;
  }

  const id = data.id ?? data._id;
  const sprintId = data.sprintId ?? data._sprintId;
  if (!id || !sprintId) {
    return null;
  }

  return {
    id,
    projectId: data.projectId ?? data._projectId ?? "",
    projectName: data.projectName ?? data._projectName ?? "",
    sprintId,
    sprintName: data.sprintName ?? data._sprintName ?? "",
    sprintStatus: data.sprintStatus ?? data._sprintStatus ?? "completed",
    planningStatus: data.planningStatus ?? data._planningStatus ?? "locked",
    planningStart: data.planningStart ?? data._planningStart ?? "",
    planningEnd: data.planningEnd ?? data._planningEnd ?? "",
    workingDays: Number(data.workingDays ?? data._workingDays ?? 0),
    actualStart: data.actualStart ?? data._actualStart ?? null,
    actualEnd: data.actualEnd ?? data._actualEnd ?? null,
    teamRhythm: Number(data.teamRhythm ?? data._teamRhythm ?? 0),
    holidays: (data.holidays ?? data._holidays ?? []).map(normalizeHoliday),
    teamId: data.teamId ?? data._teamId ?? "",
    finalizedAt: data.finalizedAt ?? data._finalizedAt ?? "",
    finalizedBy: data.finalizedBy ?? data._finalizedBy ?? "",
    summary: normalizeSummary(data.summary ?? data._summary),
    memberMetrics: (data.memberMetrics ?? data._memberMetrics ?? []).map(
      normalizeMemberMetric,
    ),
    sprintTickets: (data.sprintTickets ?? data._sprintTickets ?? []).map(
      normalizeTicket,
    ),
  };
}

function extractOverview(raw: unknown): SprintOverview {
  const overview = normalizeSprintOverview(raw);
  if (!overview) {
    throw new Error(
      "Sprint overview response is invalid or missing required fields (ID/Sprint ID)",
    );
  }
  return overview;
}

function extractOverviewList(raw: unknown): SprintOverview[] {
  const envelope = raw as RawOverviewListEnvelope | RawSprintOverview[];
  let source: RawSprintOverview[] = [];

  if (Array.isArray(envelope)) {
    source = envelope;
  } else if (Array.isArray(envelope.content)) {
    source = envelope.content;
  } else if (Array.isArray(envelope.data)) {
    source = envelope.data;
  } else if (
    envelope.data &&
    typeof envelope.data === "object" &&
    Array.isArray(envelope.data.content)
  ) {
    source = envelope.data.content;
  }

  return source
    .map((item) => normalizeSprintOverview(item))
    .filter((item): item is SprintOverview => Boolean(item));
}

export const sprintOverviewApi = {
  async createSprintOverview(
    payload: CreateSprintOverviewDTO,
  ): Promise<SprintOverview | null> {
    const api = getApiClient();
    const { data } = await api.post<RawOverviewEnvelope>(
      API_ENDPOINTS.SPRINT_OVERVIEWS.CREATE,
      payload,
    );

    return normalizeSprintOverview(data.data ?? data);
  },

  async getSprintOverviewById(id: string): Promise<SprintOverview> {
    const api = getApiClient();
    const { data } = await api.get<RawOverviewEnvelope>(
      API_ENDPOINTS.SPRINT_OVERVIEWS.GET(id),
    );

    return extractOverview(data.data ?? data);
  },

  async findSprintOverviewBySprintId(
    sprintId: string,
  ): Promise<SprintOverview | null> {
    const api = getApiClient();
    const { data } = await api.get<RawOverviewListEnvelope>(
      API_ENDPOINTS.SPRINT_OVERVIEWS.LIST,
    );

    const overviews = extractOverviewList(data.data ?? data);
    const matches = overviews.filter((overview) => overview.sprintId === sprintId);

    if (matches.length === 0) {
      return null;
    }

    matches.sort((left, right) => {
      const leftTime = new Date(left.finalizedAt).getTime();
      const rightTime = new Date(right.finalizedAt).getTime();
      return rightTime - leftTime;
    });

    return matches[0] ?? null;
  },
};
