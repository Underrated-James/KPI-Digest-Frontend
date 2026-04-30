import { getApiClient, API_ENDPOINTS } from "@/core/api";
import {
  BackendResponse,
  CreateTeamDTO,
  ListOfUsers,
  PaginatedData,
  UpdateTeamDTO,
  Team,
  TeamQueryParams,
} from "../../domain/types/team-types";

type TeamApiUser = Partial<ListOfUsers> & {
  id?: string;
  userId?: string;
};

type TeamApiRecord = Omit<Team, "id" | "users"> & {
  id?: string;
  _id?: string;
  users?: TeamApiUser[];
  userIds?: TeamApiUser[];
};

function normalizeTeamUser(user: TeamApiUser): ListOfUsers {
  return {
    userId: user.userId ?? user.id ?? "",
    name: user.name,
    allocationPercentage: user.allocationPercentage ?? 100,
    hoursPerDay: user.hoursPerDay ?? 0,
    role: user.role ?? "DEVS",
    leave: user.leave ?? [],
  };
}

function normalizeTeam(team: TeamApiRecord): Team {
  const users = Array.isArray(team.users)
    ? team.users
    : Array.isArray(team.userIds)
      ? team.userIds
      : [];

  return {
    ...team,
    id: team.id ?? team._id ?? "",
    users: users.map(normalizeTeamUser),
  };
}

function normalizeTeamPage(
  page: PaginatedData<TeamApiRecord>,
): PaginatedData<Team> {
  return {
    ...page,
    content: page.content.map(normalizeTeam),
  };
}

export const teamApi = {
  async getTeams(params?: TeamQueryParams): Promise<PaginatedData<Team>> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<Team>>>(
      API_ENDPOINTS.TEAMS.LIST,
      { params },
    );

    return normalizeTeamPage(data.data as PaginatedData<TeamApiRecord>);
  },

  async getTeamById(id: string): Promise<Team> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<TeamApiRecord>>(
      API_ENDPOINTS.TEAMS.GET(id),
    );

    return normalizeTeam(data.data);
  },

  async createTeam(teamData: CreateTeamDTO): Promise<Team> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<TeamApiRecord>>(
      API_ENDPOINTS.TEAMS.CREATE,
      teamData,
    );

    return normalizeTeam(data.data);
  },

  async updateTeam(id: string, teamData: UpdateTeamDTO): Promise<Team> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<TeamApiRecord>>(
      API_ENDPOINTS.TEAMS.UPDATE(id),
      teamData,
    );

    return normalizeTeam(data.data);
  },

  async deleteTeam(id: string): Promise<void> {
    const api = getApiClient();
    await api.delete(API_ENDPOINTS.TEAMS.DELETE(id));
  },
};
